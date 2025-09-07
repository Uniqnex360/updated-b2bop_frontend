import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  InputAdornment,
  Tooltip,
  Chip,
  Breadcrumbs,
  Typography,
  Stack,
  createTheme,
  ThemeProvider,
  Menu,
  MenuItem,
  Pagination,
  Grid,
  ListItemText,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";

// Dummy static data
const staticOrders = [
  {
    _id: "1",
    order_id: "101-09-2025",
    creation_date: "2025-09-09",
    dealer_name: "John",
    address: { city: "Texas", country: "US" },
    total_items: 7,
    amount: 54700,
    payment_status: "Paid",
    fulfilled_status: "Unfulfilled",
    delivery_status: "Delivered",
    is_reorder: false,
    product_name: "Aervoe 74701 SolaDyne Mini Solar Lantern",
  },
  {
    _id: "2",
    order_id: "102-09-2025",
    creation_date: "2025-09-09",
    dealer_name: "Sophia Taylor",
    address: { city: "New York", country: "US" },
    total_items: 5,
    amount: 400,
    payment_status: "Pending",
    fulfilled_status: "Unfulfilled",
    delivery_status: "Pending",
    is_reorder: false,
    product_name: "A.Y. McDonald 3132-667 Starting Capacitor 2HP 230V 1PH 4 in. DELUXE",
  },
  {
    _id: "3",
    order_id: "103-09-2025",
    creation_date: "2025-09-09",
    dealer_name: "Christopher Brown",
    address: { city: "California", country: "US" },
    total_items: 8,
    amount: 1060,
    payment_status: "Paid",
    fulfilled_status: "Unfulfilled",
    delivery_status: "Delivered",
    is_reorder: false,
    product_name: "A.Y. McDonald 3132-650 Starting Capacitor 3/4HP 230V 1PH 4 in.",
  },
  {
    _id: "4",
    order_id: "104-09-2025",
    creation_date: "2025-09-09",
    dealer_name: "Isabella Harris",
    address: { city: "Arizona", country: "US" },
    total_items: 6,
    amount: 900,
    payment_status: "Paid",
    fulfilled_status: "Unfulfilled",
    delivery_status: "Delivered",
    is_reorder: false,
    product_name:
      "Thorlabs BF44LS01 1to4 FanOut Bundle, 400 µm Core, Low OH, SMA, Round Common End, 1 m Long",
  },
  {
    _id: "5",
    order_id: "105-09-2025",
    creation_date: "2025-09-09",
    dealer_name: "William Anderson",
    address: { city: "Pennsylvania", country: "US" },
    total_items: 9,
    amount: 1980,
    payment_status: "Paid",
    fulfilled_status: "Unfulfilled",
    delivery_status: "Delivered",
    is_reorder: false,
    product_name:
      "Thorlabs BF42HS01 1to4 FanOut Bundle, 200 µm Core, High OH, SMA, Round Common End, 1 m Long",
  },
  {
    _id: "6",
    order_id: "106-09-2025",
    creation_date: "2025-09-09",
    dealer_name: "Emily Davis",
    address: { city: "Los Angeles", country: "US" },
    total_items: 6,
    amount: 1020,
    payment_status: "Paid",
    fulfilled_status: "Unfulfilled",
    delivery_status: "Delivered",
    is_reorder: false,
    product_name:
      "Thorlabs BF44HS01 1to4 FanOut Bundle, 400 µm Core, High OH, SMA, Round Common End, 1 m Long",
  },
  {
    _id: "7",
    order_id: "107-09-2025",
    creation_date: "2025-09-10",
    dealer_name: "James Miller",
    address: { city: "Chicago", country: "US" },
    total_items: 4,
    amount: 990,
    payment_status: "Paid",
    fulfilled_status: "Unfulfilled",
    delivery_status: "Delivered",
    is_reorder: false,
    product_name:
      "Thorlabs BF42LS01 1to4 FanOut Bundle, 200 µm Core, Low OH, SMA, Round Common End, 1 m Long",
  },
  {
    _id: "8",
    order_id: "108-09-2025",
    creation_date: "2025-09-10",
    dealer_name: "Michael Johnson",
    address: { city: "Illinois", country: "US" },
    total_items: 4,
    amount: 840,
    payment_status: "Paid",
    fulfilled_status: "Unfulfilled",
    delivery_status: "Delivered",
    is_reorder: false,
    product_name:
      "Thorlabs BFA105LS02 LineartoLinear Bundle, 7 x Ø105 µm Core Fibers, LowOH, SMA, 2 m Long",
  },
];

// Dummy list of unique dealers from static data
const uniqueDealers = [...new Set(staticOrders.map((order) => order.dealer_name))];

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
    grey: { 50: "#f9fafb", 100: "#f2f4f7", 200: "#e4e7ec", 400: "#98a2b3", 500: "#667085", 800: "#1d2939" },
    success: { main: "#12b76a" },
    error: { main: "#f04438" },
    warning: { main: "#f79009" },
  },
  components: {
    MuiTextField: { styleOverrides: { root: { "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.875rem" } } } },
    MuiButton: { styleOverrides: { root: { textTransform: "capitalize", fontWeight: 600, borderRadius: "8px", fontSize: "0.875rem" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500, fontSize: "0.75rem", height: "24px" } } },
    MuiTableHead: { styleOverrides: { root: { "& .MuiTableCell-head": { fontWeight: 600, color: "#475467", backgroundColor: "#f9fafb" } } } },
    MuiTableBody: { styleOverrides: { root: { "& .MuiTableCell-body": { color: "#344054", fontSize: "0.875rem" } } } },
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

const OrderList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentColumn, setCurrentColumn] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "creation_date",
    direction: "desc",
  });
  const [deliveryStatus, setDeliveryStatus] = useState("all");
  const [fulfilledStatus, setFulfilledStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [isReorder, setIsReorder] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // New state for dealer filter
  const [dealerAnchorEl, setDealerAnchorEl] = useState(null);
  const [selectedDealer, setSelectedDealer] = useState("all");

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
      case "Unfulfilled":
      case "Partially Fulfilled":
      case "Paid":
        return "default";
      case "Canceled":
      case "Failed":
        return "error";
      case "Completed":
      case "Fulfilled":
      case "Shipped":
      case "Delivered":
        return "success";
      default:
        return "default";
    }
  };

  const handleOpenMenu = (event, column) => {
    setCurrentColumn(column);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenDealerDropdown = (event) => {
    setDealerAnchorEl(event.currentTarget);
  };

  const handleCloseDealerDropdown = () => {
    setDealerAnchorEl(null);
  };

  const handleSelectDealer = (dealerName) => {
    setSelectedDealer(dealerName);
    setPage(0);
    handleCloseDealerDropdown();
  };

  const handleSelectSort = (key, direction) => {
    setSortConfig({ key, direction });
    setPage(0);
    handleCloseMenu();
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
        setIsReorder(status);
        break;
      default:
        break;
    }
    setPage(0);
    handleCloseMenu();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleClearDates = () => {
    setSelectedDate(null);
    setEndDate(null);
  };

  const handleExport = (status) => {
    alert(`Exporting orders with status: ${status}`);
    handleCloseMenu();
  };

  const handleRowClick = (orderId) => {
    alert(`Navigating to order details for Order ID: ${orderId}`);
  };

  const sortedAndFilteredOrders = useMemo(() => {
    let tempOrders = [...staticOrders];

    // Filter by selected dealer
    if (selectedDealer !== "all") {
      tempOrders = tempOrders.filter(
        (order) => order.dealer_name === selectedDealer
      );
    }

    // Filter by search term
    if (searchTerm) {
      tempOrders = tempOrders.filter(
        (order) =>
          order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.dealer_name &&
            order.dealer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.address?.city &&
            order.address.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.address?.country &&
            order.address.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
          order.delivery_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.payment_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by statuses and reorder flag
    if (deliveryStatus !== "all") {
      tempOrders = tempOrders.filter(
        (order) => order.delivery_status === deliveryStatus
      );
    }
    if (fulfilledStatus !== "all") {
      tempOrders = tempOrders.filter(
        (order) => order.fulfilled_status === fulfilledStatus
      );
    }
    if (paymentStatus !== "all") {
      tempOrders = tempOrders.filter(
        (order) => order.payment_status === paymentStatus
      );
    }
    if (isReorder !== "all") {
      const isReorderBoolean = isReorder === "Yes";
      tempOrders = tempOrders.filter(
        (order) => (order.is_reorder || false) === isReorderBoolean
      );
    }

    // Filter by date range
    if (selectedDate) {
      tempOrders = tempOrders.filter((order) =>
        dayjs(order.creation_date).isAfter(dayjs(selectedDate).subtract(1, "day"))
      );
    }
    if (endDate) {
      tempOrders = tempOrders.filter((order) =>
        dayjs(order.creation_date).isBefore(dayjs(endDate).add(1, "day"))
      );
    }

    // Sort the filtered data
    if (sortConfig.key) {
      tempOrders.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return tempOrders;
  }, [
    searchTerm,
    sortConfig,
    deliveryStatus,
    fulfilledStatus,
    paymentStatus,
    isReorder,
    selectedDate,
    endDate,
    selectedDealer,
  ]);

  const paginatedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedAndFilteredOrders.slice(start, start + rowsPerPage);
  }, [sortedAndFilteredOrders, page, rowsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredOrders.length / rowsPerPage);

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
                {selectedDealer === "all" ? "View Orders By Dealer Name" : `Filtering by: ${selectedDealer}`}
              </Button>
              <Menu
                anchorEl={dealerAnchorEl}
                open={Boolean(dealerAnchorEl)}
                onClose={handleCloseDealerDropdown}
              >
                <MenuItem onClick={() => handleSelectDealer("all")}>All Dealers</MenuItem>
                {uniqueDealers.map((dealer) => (
                  <MenuItem key={dealer} onClick={() => handleSelectDealer(dealer)}>
                    <ListItemText primary={dealer} />
                  </MenuItem>
                ))}
              </Menu>
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
                  </Stack>
                </LocalizationProvider>
                <TextField
                  variant="outlined"
                  value={searchTerm}
                  size="small"
                  onChange={handleSearchChange}
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
                />
                <Tooltip title="Export" arrow>
                  <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
                    <FileUploadOutlinedIcon sx={{ fontSize: "40px", color: "primary.main" }} />
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                >
                  <MenuItem onClick={() => handleExport("all")}>Export All Orders</MenuItem>
                  <MenuItem onClick={() => handleExport("Pending")}>
                    Export Pending Orders
                  </MenuItem>
                  <MenuItem onClick={() => handleExport("Shipped")}>
                    Export Shipped Orders
                  </MenuItem>
                  <MenuItem onClick={() => handleExport("Delivered")}>
                    Export Delivered Orders
                  </MenuItem>
                </Menu>
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
                    Total Orders: <strong>{sortedAndFilteredOrders.length}</strong>
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
                  { id: "creation_date", label: "Order Date" },
                  { id: "dealer_name", label: "Dealer Name" },
                  { id: "destination", label: "Destination" },
                  { id: "total_items", label: "Total Items" },
                  { id: "amount", label: "Order Value" },
                  { id: "payment_status", label: "Payment Status" },
                  { id: "fulfilled_status", label: "Fulfillment Status" },
                  { id: "delivery_status", label: "Delivery Status" },
                  { id: "is_reorder", label: "Reorder" },
                ].map((column) => (
                  <StyledTableCell key={column.id} align="left">
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
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <StyledTableRow key={order._id} onClick={() => handleRowClick(order._id)}>
                    <StyledTableCell align="left">{order.order_id}</StyledTableCell>
                    <StyledTableCell align="left">
                      {dayjs(order.creation_date).format("YYYY-MM-DD")}
                    </StyledTableCell>
                    <StyledTableCell align="left">{order.dealer_name}</StyledTableCell>
                    <StyledTableCell align="left">
                      {order.address?.city && order.address?.country
                        ? `${order.address.city}, ${order.address.country}`
                        : "N/A"}
                    </StyledTableCell>
                    <StyledTableCell align="left">{order.total_items}</StyledTableCell>
                    <StyledTableCell align="left">
                      ${order.amount.toFixed(2)}
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
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={(event, newPage) => setPage(newPage - 1)}
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
          {currentColumn === "payment_status" && (
            <>
              <MenuItem onClick={() => handleStatusFilter("payment_status", "all")}>
                All
              </MenuItem>
              <MenuItem onClick={() => handleStatusFilter("payment_status", "Paid")}>
                Paid
              </MenuItem>
              <MenuItem onClick={() => handleStatusFilter("payment_status", "Pending")}>
                Pending
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
          {currentColumn === "delivery_status" && (
            <>
              <MenuItem onClick={() => handleStatusFilter("delivery_status", "all")}>
                All
              </MenuItem>
              <MenuItem onClick={() => handleStatusFilter("delivery_status", "Delivered")}>
                Delivered
              </MenuItem>
              <MenuItem onClick={() => handleStatusFilter("delivery_status", "Pending")}>
                Pending
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
      </Box>
    </ThemeProvider>
  );
};

export default OrderList;