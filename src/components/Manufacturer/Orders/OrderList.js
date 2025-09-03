import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Typography,
  ListItemText,
  Pagination,
  Grid,
  Stack,
} from "@mui/material";
import axios from "axios";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { styled } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";

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
  },
  "&.MuiTableCell-body": {
    fontSize: "0.875rem",
    color: theme.palette.grey[800],
    padding: theme.spacing(1.5, 2),
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiMenu-paper": {
    padding: 0,
    maxHeight: "400px",
    width: "300px",
    overflowY: "hidden",
    fontSize: "12px",
    display: "flex",
    flexDirection: "column",
  },
  "& .MuiMenu-list": {
    paddingTop: 0,
    paddingBottom: 0,
    margin: "5px 0px",
  },
}));

const OrderList = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const filter = location.state?.filter || {};
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentColumn, setCurrentColumn] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [delivery_status, setDeliveryStatus] = useState("all");
  const [fulfilled_status, setFulfilledStatus] = useState("all");
  const [payment_status, setPaymentStatus] = useState(
    filter?.payment_status || "all"
  );
  const [is_reorder, setis_reorder] = useState(filter?.is_reorder || "all");
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [dealerAnchorEl, setDealerAnchorEl] = useState(null);
  const [selectedDealerIds, setSelectedDealerIds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingDealers, setLoadingDealers] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get("page"), 10) || 0;
  const [page, setPage] = useState(initialPage);

  // Fetch dealers
  const fetchDealers = useCallback(async () => {
    setLoadingDealers(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainDealerlist/`,
        {
          params: { manufacture_unit_id: user.manufacture_unit_id },
        }
      );
      if (response.status === 200) {
        setDealers(
          response.data.data.map((dealer) => ({
            id: dealer.id,
            username: dealer.username,
          })) || []
        );
      } else {
        setError("Failed to load dealer data");
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
      setError("An error occurred while fetching dealers.");
    } finally {
      setLoadingDealers(false);
    }
  }, [user.manufacture_unit_id]);

  // Fetch orders (integrates with updated backend search filter)
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    if (!user || !user.manufacture_unit_id) {
      console.error("User or manufacture_unit_id is not defined.");
      setLoading(false);
      return;
    }

    try {
      const formattedStartDate = selectedDate
        ? selectedDate.format("YYYY-MM-DD")
        : null;
      const formattedEndDate = endDate ? endDate.format("YYYY-MM-DD") : null;

      const response = await axios.post(
        `${process.env.REACT_APP_IP}obtainOrderList/`,
        {
          manufacture_unit_id: user.manufacture_unit_id,
          search_query: searchTerm,
          sort_by: sortConfig.key,
          sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
          page,
          rows_per_page: rowsPerPage,
          dealer_list: selectedDealerIds,
          delivery_status,
          fulfilled_status,
          payment_status,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          is_reorder,
        }
      );
      setOrders(response.data.data);
      setTotalOrders(response.data.total_orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setTotalOrders(0);
      enqueueSnackbar("Failed to fetch orders. Please try again.", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [
    user.manufacture_unit_id,
    searchTerm,
    sortConfig,
    page,
    rowsPerPage,
    selectedDealerIds,
    delivery_status,
    fulfilled_status,
    payment_status,
    is_reorder,
    selectedDate,
    endDate,
    enqueueSnackbar,
  ]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filterParam = searchParams.get("filter");

    if (filterParam === "Pending") {
      setPaymentStatus("Pending");
    } else if (filterParam === "yes") {
      setis_reorder("Yes");
    }

    fetchOrders();
  }, [location.search, fetchOrders]);

  const handleRowClick = (orderId) => {
    navigate(`/manufacturer/order-details/${orderId}?page=${page}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenMenu = (event, column) => {
    setCurrentColumn(column);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setPage(0);
    handleCloseMenu();
  };

  const handleStatusFilter = (statusType, status) => {
    setDeliveryStatus("all");
    setFulfilledStatus("all");
    setPaymentStatus("all");
    setis_reorder("all");

    if (statusType === "delivery_status") setDeliveryStatus(status);
    if (statusType === "fulfilled_status") setFulfilledStatus(status);
    if (statusType === "payment_status") setPaymentStatus(status);
    if (statusType === "is_reorder") setis_reorder(status);

    handleCloseMenu();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleOpenExportMenu = (event) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };

  const handleExport = async (status) => {
    const exportUrl = `${process.env.REACT_APP_IP}exportOrders/`;
    const params = {
      manufacture_unit_id: user.manufacture_unit_id,
      status,
    };

    try {
      const response = await axios.get(exportUrl, {
        params,
        responseType: "blob",
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", `orders_${status}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      enqueueSnackbar("Export successful!", { variant: "success" });
    } catch (error) {
      console.error("Error exporting orders:", error);
      enqueueSnackbar("Failed to export orders. Please try again.", {
        variant: "error",
      });
    }
    handleCloseExportMenu();
  };

  const handleOpenDealerDropdown = (event) => {
    setDealerAnchorEl(event.currentTarget);
  };

  const handleCloseDealerDropdown = () => {
    setDealerAnchorEl(null);
  };

  const handleDealerSelection = (dealer) => {
    setSelectedDealerIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(dealer.id)) {
        return prevSelectedIds.filter((id) => id !== dealer.id);
      } else {
        return [...prevSelectedIds, dealer.id];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedDealerIds([]);
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

  const totalPages = Math.ceil(totalOrders / rowsPerPage);

  const breadcrumbs = [
    <Typography
      key="1"
      color="text.primary"
      sx={{ fontSize: "1.5rem", fontWeight: "bold" }}
    >
      My Orders
    </Typography>,
  ];

  return (
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
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4} lg={3}>
            <Button
              fullWidth
              sx={{
                border: "1px solid",
                borderColor: "primary.main",
                textTransform: "capitalize",
                fontSize: "12px",
                whiteSpace: "nowrap",
                height: "40px",
                borderRadius: "8px",
              }}
              onClick={handleOpenDealerDropdown}
            >
              View Orders By Dealer Name
            </Button>
            <StyledMenu
              anchorEl={dealerAnchorEl}
              open={Boolean(dealerAnchorEl)}
              onClose={handleCloseDealerDropdown}
              disableAutoFocusItem
              sx={{ maxWidth: 400 }}
            />
          </Grid>

          <Grid item xs={12} md={8} lg={9}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="flex-end"
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction="row" spacing={1} alignItems="center">
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
                      onClick={() => {
                        setSelectedDate(null);
                        setEndDate(null);
                      }}
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
                </Stack>
              </LocalizationProvider>

              <TextField
                variant="outlined"
                value={searchTerm}
                size="small"
                onChange={handleSearchChange}
                // Updated placeholder to reflect backend's updated search filter:
                placeholder="Search by Order ID, Dealer Name, City, Country, Delivery or Payment Status"
                sx={{ width: { xs: "100%", sm: "300px" }, borderRadius: "8px" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "grey.400" }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: "8px" },
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

              <Tooltip title="Export" arrow>
                <IconButton onClick={handleOpenExportMenu} sx={{ p: 0 }}>
                  <FileUploadOutlinedIcon sx={{ fontSize: "40px", color: "primary.main" }} />
                </IconButton>
              </Tooltip>

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
                <Typography variant="body2">
                  Total Orders: <strong>{totalOrders}</strong>
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </FilterPaper>

      <StyledTableContainer component={Paper}>
        <Table stickyHeader sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {[
                { id: "order_id", label: "Order ID" },
                { id: "dealer_name", label: "Dealer Name" },
                { id: "destination", label: "Destination" },
                { id: "total_items", label: "Total Items" },
                { id: "amount", label: "Order Value" },
                { id: "creation_date", label: "Order Date" },
                { id: "payment_status", label: "Payment Status" },
                { id: "fulfilled_status", label: "Fulfillment Status" },
                { id: "delivery_status", label: "Delivery Status" },
                { id: "is_reorder", label: "Reorder" },
              ].map((column) => (
                <StyledTableCell
                  key={column.id}
                  align="left"
                  sx={{
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
                    {column.id !== "destination" && (
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
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <CircularProgress color="primary" />
                </TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <StyledTableRow key={order._id} onClick={() => handleRowClick(order._id)}>
                  <StyledTableCell
                    align="left"
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                      bgcolor: "white",
                    }}
                  >
                    {order.order_id}
                  </StyledTableCell>
                  <StyledTableCell align="left">{order.dealer_name}</StyledTableCell>
                  <StyledTableCell align="left">
                    {order.address?.city && order.address?.country
                      ? `${order.address.city}, ${order.address.country}`
                      : "N/A"}
                  </StyledTableCell>
                  <StyledTableCell align="left">{order.total_items}</StyledTableCell>
                  <StyledTableCell align="left">
                    {order.amount} {order.currency}
                  </StyledTableCell>
                  <StyledTableCell align="left">
                    {dayjs(order.creation_date).format("YYYY-MM-DD")}
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
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No Orders Available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
          color="primary"
          shape="rounded"
          size="large"
        />
      </Box>

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
        {currentColumn === "dealer_name" && (
          <>
            <MenuItem onClick={() => handleSelectSort("dealer_name", "asc")}>
              Sort A to Z
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("dealer_name", "desc")}>
              Sort Z to A
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
        {currentColumn === "creation_date" && (
          <>
            <MenuItem onClick={() => handleSelectSort("creation_date", "asc")}>
              Oldest
            </MenuItem>
            <MenuItem onClick={() => handleSelectSort("creation_date", "desc")}>
              Newest
            </MenuItem>
          </>
        )}
        {currentColumn === "delivery_status" && (
          <>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "all")}>
              All
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "Pending")}>
              Pending
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "Shipped")}>
              Shipped
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "Completed")}>
              Completed
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("delivery_status", "Canceled")}>
              Canceled
            </MenuItem>
          </>
        )}
        {currentColumn === "fulfilled_status" && (
          <>
            <MenuItem onClick={() => handleStatusFilter("fulfilled_status", "all")}>
              All
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("fulfilled_status", "Fulfilled")}>
              Fulfilled
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("fulfilled_status", "Unfulfilled")}>
              Unfulfilled
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("fulfilled_status", "Partially Fulfilled")}>
              Partially Fulfilled
            </MenuItem>
          </>
        )}
        {currentColumn === "payment_status" && (
          <>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "all")}>
              All
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "Completed")}>
              Completed
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "Pending")}>
              Pending
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "Paid")}>
              Paid
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("payment_status", "Failed")}>
              Failed
            </MenuItem>
          </>
        )}
        {currentColumn === "is_reorder" && (
          <>
            <MenuItem onClick={() => handleStatusFilter("is_reorder", "all")}>
              All
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("is_reorder", "Yes")}>
              Yes
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilter("is_reorder", "No")}>
              No
            </MenuItem>
          </>
        )}
      </Menu>

      <StyledMenu
        anchorEl={dealerAnchorEl}
        open={Boolean(dealerAnchorEl)}
        onClose={handleCloseDealerDropdown}
        sx={{ maxWidth: 400 }}
      >
        <Box
          sx={{
            padding: 1,
            fontSize: "14px",
            bgcolor: "white",
            boxShadow: 1,
          }}
        >
          {loadingDealers
            ? "Loading..."
            : selectedDealerIds.length > 0
            ? `Selected ${selectedDealerIds.length} ${
                selectedDealerIds.length > 1 ? "dealers" : "dealer"
              }`
            : "No dealers selected"}
        </Box>
        <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
          {loadingDealers ? (
            <Box
              sx={{
                height: 200,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 2,
              }}
            >
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            dealers.map((dealer) => (
              <MenuItem
                key={dealer.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  bgcolor: selectedDealerIds.includes(dealer.id)
                    ? "grey.200"
                    : "transparent",
                  "&:hover": { bgcolor: "grey.300" },
                }}
                onClick={() => handleDealerSelection(dealer)}
              >
                <ListItemText primary={dealer.username} />
              </MenuItem>
            ))
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            bgcolor: "white",
            boxShadow: 2,
            p: 1.25,
          }}
        >
          <Button
            sx={{ fontSize: "12px" }}
            variant="outlined"
            onClick={handleClearSelection}
          >
            Clear
          </Button>
        </Box>
      </StyledMenu>

      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={handleCloseExportMenu}
      >
        <MenuItem onClick={() => handleExport("all")}>
          Export All Orders
        </MenuItem>
        <MenuItem onClick={() => handleExport("Pending")}>
          Export Pending Orders
        </MenuItem>
        <MenuItem onClick={() => handleExport("Shipped")}>
          Export Shipped Orders
        </MenuItem>
        <MenuItem onClick={() => handleExport("Completed")}>
          Export Completed Orders
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrderList;