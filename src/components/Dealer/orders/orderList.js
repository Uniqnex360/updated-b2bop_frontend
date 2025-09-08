import React, { useEffect, useState, useMemo } from "react";
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
  createTheme,
  ThemeProvider,
  Grid,
} from "@mui/material";
import axios from "axios";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";

const theme = createTheme({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h3: { fontSize: "1.5rem", fontWeight: 700 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 600 },
    body1: { fontSize: "0.9375rem" },
    body2: { fontSize: "0.875rem" },
  },
  palette: {
    primary: { main: "#1976d2" },
    grey: {
      50: "#f9fafb",
      100: "#f2f4f7",
      200: "#e4e7ec",
      400: "#98a2b3",
      500: "#667085",
      800: "#1d2939",
    },
    success: { main: "#12b76a" },
    error: { main: "#f04438" },
    warning: { main: "#f79009" },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
          fontWeight: 600,
          borderRadius: "8px",
          fontSize: "0.875rem",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, fontSize: "0.75rem", height: "24px" },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            fontWeight: 600,
            color: "#475467",
            backgroundColor: "#f9fafb",
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-body": { color: "#344054", fontSize: "0.875rem" },
        },
      },
    },
  },
});

const FilterPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "16px",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  maxHeight: 520,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  "&.MuiTableCell-head": {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.grey[600],
    fontWeight: "600",
    padding: theme.spacing(2),
    fontSize: "0.875rem",
    position: "sticky",
    top: 0,
    zIndex: 2,
    whiteSpace: "nowrap",
  },
  "&.MuiTableCell-body": {
    fontSize: "0.875rem",
    color: theme.palette.grey[800],
    padding: theme.spacing(1.5, 2),
    whiteSpace: "nowrap",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
}));

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
        `${process.env.REACT_APP_IP}obtainOrderListForDealer/`,
        {
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
      const fetchedOrders = Array.isArray(response?.data?.data)
        ? response.data.data
        : [];
      setOrders(fetchedOrders);
    } catch (error) {
      setOrders([]);
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

  const filteredOrders = useMemo(() => {
    let tempOrders = [...orders];

    if (searchTerm) {
      tempOrders = tempOrders.filter(
        (order) =>
          order.order_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.payment_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.delivery_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.fulfilled_status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Server-side filtering is already handled by fetchOrderList, but client-side filtering by searchTerm is needed here.
    // The other filters (statuses, dates, sorting) trigger a new API call, handled by the useEffect.

    return tempOrders;
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );

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
    switch (statusType) {
      case "delivery_status":
        setDeliveryStatus(status);
        break;
      case "fulfilled_status":
        setFulfilledStatus(status);
        break;
      case "payment_status":
        setPaymentStatus(status);
        break;
      case "is_reorder":
        setis_reorder(status);
        break;
      default:
        break;
    }
    setPage(1);
    setAnchorEl(null);
  };

  const handleClearDates = () => {
    setSelectedDate(null);
    setEndDate(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const breadcrumbs = [
    <Typography key="1" color="text.primary" variant="h3">
      My Orders
    </Typography>,
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "grey.50", minHeight: "100vh" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbs}
          </Breadcrumbs>
        </Stack>
        <FilterPaper elevation={1}>
          <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
            <Grid item xs={12} md={6} lg={4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    slotProps={{
                      textField: {
                        size: "small",
                        sx: { width: { xs: "50%", sm: "140px" }, bgcolor: "white" },
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
                        sx: { width: { xs: "50%", sm: "140px" }, bgcolor: "white" },
                      },
                    }}
                  />
                  <Tooltip title="Clear dates">
                    <IconButton
                      onClick={handleClearDates}
                      sx={{
                        color: "primary.main",
                        "&:hover": { bgcolor: "primary.light" },
                        bgcolor: "grey.200",
                      }}
                      aria-label="Clear dates"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </LocalizationProvider>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="flex-end"
              >
                <TextField
                  variant="outlined"
                  value={searchTerm}
                  size="small"
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Order ID, Status..."
                  sx={{ width: { xs: "100%", sm: "300px" }, borderRadius: "8px" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "grey.400" }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: "8px" },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    py: 0.5,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Total Orders: <strong>{filteredOrders.length}</strong>
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </FilterPaper>

        <StyledTableContainer component={Paper}>
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
                  <StyledTableCell key={column.id} align="left">
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
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <CircularProgress color="primary" />
                  </StyledTableCell>
                </StyledTableRow>
              ) : paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <StyledTableRow
                    key={order.order_id}
                    onClick={() => handleOrderClick(order.id)}
                  >
                    <StyledTableCell align="left">
                      {order.order_id}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      {order.order_date
                        ? dayjs(order.order_date).format("YYYY-MM-DD")
                        : ""}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      {order.total_items}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      {order.currency}
                      {order.amount}
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <Chip
                        label={order.payment_status}
                        color={getStatusColor(order.payment_status)}
                        size="small"
                        sx={{ fontWeight: "medium" }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <Chip
                        label={order.fulfilled_status}
                        color={getStatusColor(order.fulfilled_status)}
                        size="small"
                        sx={{ fontWeight: "medium" }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      <Chip
                        label={order.delivery_status}
                        color={getStatusColor(order.delivery_status)}
                        size="small"
                        sx={{ fontWeight: "medium" }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="left">
                      {order.is_reorder ? "Yes" : "No"}
                    </StyledTableCell>
                    <StyledTableCell align="left">
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
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">
                      No Orders Available
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>

        {filteredOrders.length > rowsPerPage && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              color="primary"
              shape="rounded"
              size="large"
            />
          </Box>
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
                Oldest
              </MenuItem>
              <MenuItem onClick={() => handleSelectSort("order_date", "desc")}>
                Newest
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
    </ThemeProvider>
  );
};

export default OrderList;