import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Table,
  TableBody,
  MenuItem,
  Menu,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Chip,
  Breadcrumbs,
  Link,
  Typography,
  Stack,
  Pagination,
} from "@mui/material";
import axios from "axios";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const OrderList = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const filter = location.state?.filter || {};
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage] = useState(25);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentColumn, setCurrentColumn] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [delivery_status, setDeliveryStatus] = useState("all");
  const [fulfilled_status, setFulfilledStatus] = useState("all");
  const [payment_status, setPaymentStatus] = useState(
    filter?.payment_status || "all"
  );
  const [is_reorder, setis_reorder] = useState(filter?.is_reorder || "all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const initialPage = parseInt(queryParams.get("page"), 10) || 1;
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    if (searchTerm) setPage(1);
  }, [searchTerm]);

  const fetchOrderList = async (key, direction) => {
    setLoading(true);
    try {
      const formattedStartDate = selectedDate
        ? selectedDate.format("YYYY-MM-DD")
        : null;
      const formattedEndDate = endDate ? endDate.format("YYYY-MM-DD") : null;
      const sort_by_value = direction === "asc" ? 1 : direction === "desc" ? -1 : "";

      const response = await axios.post(
        `${process.env.REACT_APP_IP}obtainOrderListForDealer/`, {
          user_id: user?.id,
          sort_by: key || "",
          sort_by_value,
          delivery_status,
          fulfilled_status,
          payment_status,
          is_reorder,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
        }
      );
      const fetchedOrders = Array.isArray(response?.data?.data) ? response.data.data : [];
      setOrders(fetchedOrders);
      setTotalPages(Math.ceil(fetchedOrders.length / rowsPerPage));
    } catch (error) {
      setOrders([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderList(sortConfig.key, sortConfig.direction);
    // eslint-disable-next-line
  }, [
    user?.id,
    delivery_status,
    fulfilled_status,
    payment_status,
    is_reorder,
    selectedDate,
    endDate,
    sortConfig.key,
    sortConfig.direction,
  ]);

  const handlePayment = (orderId) => {
    navigate(`/dealer/paymentConfirm?page=${page}`, { state: { orderId } });
  };

  const handleOrderClick = (orderId) => {
    navigate(`/dealer/OrderDetail?page=${page}`, { state: { orderId } });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
      case "Unfulfilled":
      case "Partially Fulfilled":
      case "Paid":
      case "Shipped":
        return "default";
      case "Canceled":
      case "Failed":
        return "error";
      case "Completed":
      case "Fulfilled":
        return "success";
      default:
        return "default";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return (
      order.order_id?.toString().toLowerCase().includes(normalizedSearch) ||
      order.payment_status?.toLowerCase().includes(normalizedSearch) ||
      order.delivery_status?.toLowerCase().includes(normalizedSearch) ||
      order.fulfilled_status?.toLowerCase().includes(normalizedSearch)
    );
  });

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );

  const handleOpenMenu = (event, column) => {
    setCurrentColumn(column);
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => setAnchorEl(null);

  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setPage(1);
    setAnchorEl(null);
  };

  const handleStatusFilter = (statusType, status) => {
    if (statusType === "delivery_status") {
      setDeliveryStatus(status);
      setFulfilledStatus("all");
      setPaymentStatus("all");
      setis_reorder("all");
    } else if (statusType === "fulfilled_status") {
      setDeliveryStatus("all");
      setFulfilledStatus(status);
      setPaymentStatus("all");
      setis_reorder("all");
    } else if (statusType === "payment_status") {
      setDeliveryStatus("all");
      setFulfilledStatus("all");
      setPaymentStatus(status);
      setis_reorder("all");
    } else if (statusType === "is_reorder") {
      setDeliveryStatus("all");
      setFulfilledStatus("all");
      setPaymentStatus("all");
      setis_reorder(status);
    }
    setPage(1);
    setAnchorEl(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const breadcrumbs = [
    <Typography key="1" color="text.primary" sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
      My Orders
    </Typography>
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "grey.50", minHeight: "100vh" }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          {breadcrumbs}
        </Breadcrumbs>
      </Box>
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 4,
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="flex-end" // Changed from "space-between" to "flex-end"
          alignItems="center"
          spacing={{ xs: 2, sm: 4 }}
        >
          {/* This stack is now aligned to the right using justifyContent */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            spacing={1}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={1}>
                <DatePicker
                  label="Start Date"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: { xs: "100%", sm: "140px" }, bgcolor: "white" },
                    },
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newDate) => setEndDate(newDate)}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: { width: { xs: "100%", sm: "140px" }, bgcolor: "white" },
                    },
                  }}
                />
              </Stack>
            </LocalizationProvider>
            <Tooltip title="Clear dates">
              <IconButton
                onClick={() => {
                  setSelectedDate(null);
                  setEndDate(null);
                }}
                sx={{ color: "primary.main", "&:hover": { bgcolor: "primary.light" }, bgcolor: "grey.200" }}
                aria-label="Clear dates"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="flex-end"
            alignItems="center"
            spacing={2}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <TextField
              variant="outlined"
              value={searchTerm}
              size="small"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID, Status..."
              sx={{ width: { xs: "100%", sm: "300px" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "grey.400" }} />
                  </InputAdornment>
                ),
              }}
              onKeyPress={(event) => {
                if (
                  event.key === " " &&
                  (searchTerm.trim() === "" ||
                    searchTerm.startsWith(" ") ||
                    searchTerm.endsWith(" "))
                ) {
                  event.preventDefault();
                }
              }}
            />
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: "grey.100",
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                Total Orders: <strong>{filteredOrders.length}</strong>
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          maxHeight: 520,
          overflowX: "auto",
        }}
      >
        <Table stickyHeader sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              {[
                { id: "order_id", label: "Order ID" },
                { id: "order_date", label: "Order Date" },
                { id: "total_items", label: "Quantity" },
                { id: "amount", label: "Order Value" },
                { id: "payment_status", label: "Payment Status" },
                { id: "fulfilled_status", label: "Fulfillment Status" },
                { id: "delivery_status", label: "Delivery Status" },
                { id: "is_reorder", label: "Reorder" },
                { id: "make_payment", label: "Actions" },
              ].map((column) => (
                <TableCell
                  key={column.id}
                  align="left"
                  sx={{
                    bgcolor: "grey.100",
                    color: "grey.600",
                    fontWeight: "600",
                    px: 2,
                    py: 1.5,
                    whiteSpace: "nowrap",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    ...(column.id === "order_id" && {
                      left: 0,
                      zIndex: 3,
                      bgcolor: "white",
                    }),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ whiteSpace: "nowrap" }}>
                      {column.label}
                    </Typography>
                    {column.id !== "make_payment" && (
                      <IconButton
                        onClick={(e) => handleOpenMenu(e, column.id)}
                        size="small"
                        sx={{ color: "grey.500" }}
                      >
                        <MoreVertIcon sx={{ width: 16, height: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress color="primary" />
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <TableRow
                  key={order.order_id}
                  onClick={() => handleOrderClick(order.id)}
                  sx={{
                    "&:hover": {
                      bgcolor: "primary.lightest",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                    },
                  }}
                >
                  <TableCell
                    align="left"
                    sx={{
                      fontSize: "0.875rem",
                      color: "grey.800",
                      px: 2,
                      py: 1.5,
                      whiteSpace: "nowrap",
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      bgcolor: "white",
                    }}
                  >
                    {order.order_id}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontSize: "0.875rem", color: "grey.800", px: 2, py: 1.5, whiteSpace: "nowrap" }}
                  >
                    {order.order_date
                      ? new Date(order.order_date).toLocaleDateString()
                      : ""}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontSize: "0.875rem", color: "grey.800", px: 2, py: 1.5, whiteSpace: "nowrap" }}
                  >
                    {order.total_items}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontSize: "0.875rem", color: "grey.800", px: 2, py: 1.5, whiteSpace: "nowrap" }}
                  >
                    {order.currency}{order.amount}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ px: 2, py: 1.5, whiteSpace: "nowrap" }}
                  >
                    <Chip
                      label={order.payment_status}
                      color={getStatusColor(order.payment_status)}
                      size="small"
                      sx={{ fontWeight: "medium" }}
                    />
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ px: 2, py: 1.5, whiteSpace: "nowrap" }}
                  >
                    <Chip
                      label={order.fulfilled_status}
                      color={getStatusColor(order.fulfilled_status)}
                      size="small"
                      sx={{ fontWeight: "medium" }}
                    />
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ px: 2, py: 1.5, whiteSpace: "nowrap" }}
                  >
                    <Chip
                      label={order.delivery_status}
                      color={getStatusColor(order.delivery_status)}
                      size="small"
                      sx={{ fontWeight: "medium" }}
                    />
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontSize: "0.875rem", color: "grey.800", px: 2, py: 1.5, whiteSpace: "nowrap" }}
                  >
                    {order.is_reorder ? "Yes" : "No"}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ px: 2, py: 1.5, whiteSpace: "nowrap" }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: "600",
                        borderRadius: "8px",
                        boxShadow: 1,
                      }}
                      disabled={
                        order.payment_status === "Paid" ||
                        order.payment_status === "Completed"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePayment(order.id);
                      }}
                    >
                      Confirm Payment
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No Orders Available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredOrders.length > rowsPerPage && (
        <Stack
          spacing={2}
          sx={{ mt: 3, justifyContent: "center", alignItems: "center" }}
        >
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            shape="rounded"
            size="large"
          />
        </Stack>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {currentColumn === "order_id" && (
          <>
            <MenuItem onClick={() => handleSelectSort("order_id", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("order_id", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "total_items" && (
          <>
            <MenuItem onClick={() => handleSelectSort("total_items", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("total_items", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "amount" && (
          <>
            <MenuItem onClick={() => handleSelectSort("amount", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("amount", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "order_date" && (
          <>
            <MenuItem onClick={() => handleSelectSort("order_date", "asc")}>
              Lowest
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("order_date", "desc")}>
              Highest
            </MenuItem>
          </>
        )}
        {currentColumn === "delivery_status" && (
          <>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "all")}>All</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "Pending")}>Pending</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "Shipped")}>Shipped</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "Completed")}>Completed</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "Canceled")}>Canceled</MenuItem>
          </>
        )}
        {currentColumn === "fulfilled_status" && (
          <>
            <MenuItem onClick={() => handleStatusFilter("fulfilled_status", "all")}>All</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("fulfilled_status", "Fulfilled")}>Fulfilled</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("fulfilled_status", "Unfulfilled")}>Unfulfilled</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("fulfilled_status", "Partially Fulfilled")}>Partially Fulfilled</MenuItem>
          </>
        )}
        {currentColumn === "payment_status" && (
          <>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "all")}>All</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "Completed")}>Completed</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "Pending")}>Pending</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "Paid")}>Paid</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "Failed")}>Failed</MenuItem>
          </>
        )}
        {currentColumn === "is_reorder" && (
          <>
            <MenuItem onClick={() => handleStatusFilter("is_reorder", "all")}>All</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("is_reorder", "Yes")}>Yes</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("is_reorder", "No")}>No</MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default OrderList;