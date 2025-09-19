import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Button,
  Chip,
  InputBase,
  Popper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tabs,
  Tab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ImageIcon from "@mui/icons-material/Image";
import SearchIcon from "@mui/icons-material/Search";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import axios from "axios";
import "./DealerDetail.css";

// Import the BuyerDiscount and Transactions components
import BuyerDiscount from "./BuyerDiscount";
import Transactions from "./Transactions";

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  border: "1px solid #f0f0f0",
  "&:hover": {
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  color: "#2874f0",
  textTransform: "capitalize",
  fontWeight: "500",
  "&:hover": {
    backgroundColor: "rgba(40, 116, 240, 0.08)",
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: "#fafafa",
  "& .MuiTableCell-head": {
    fontWeight: "600",
    fontSize: "13px",
    color: "#212121",
    borderBottom: "2px solid #e0e0e0",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: "#fefefe",
  },
  "&:hover": {
    backgroundColor: "#f8f9ff",
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "12px",
}));

const SearchBarContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  background: "#fff",
  borderRadius: "24px",
  padding: "8px 16px",
  margin: "24px 0 16px 0",
  boxShadow: "0 1px 4px rgba(40,116,240,0.07)",
  width: "100%",
  maxWidth: 700,
  position: "relative",
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  fontSize: 16,
  background: "transparent",
}));

// Helper to highlight matched text in suggestions
const highlightMatch = (text, keyword) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, "ig");
  const parts = text.split(regex);
  return parts.map((part, idx) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <span key={idx} style={{ color: "#2874f0", fontWeight: 600 }}>
        {part}
      </span>
    ) : (
      part
    )
  );
};

const DealerDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [dealerData, setDealerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("page") || 0;
  const [selectedTab, setSelectedTab] = useState(0);

  // Added state for the current logged-in user
  const [currentUser, setCurrentUser] = useState(null);
  // Add a loading state for the user data
  const [userLoading, setUserLoading] = useState(true);

  // Autosuggest state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [suggestions, setSuggestions] = useState({ product_names: [], brand_names: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // useEffect to fetch current user details (including manufacture_unit_id)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Replace this with your actual endpoint to get the logged-in user's data
        const response = await axios.get(`${process.env.REACT_APP_IP}currentUserDetails`);
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Failed to fetch current user data:", err);
      } finally {
        setUserLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedTab === 0) {
      const fetchDealerDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `${process.env.REACT_APP_IP}obtainDealerDetails/?user_id=${id}`
          );
          setDealerData(response.data?.data);
        } catch (err) {
          setError(err.message || "Something went wrong while fetching data.");
        } finally {
          setLoading(false);
        }
      };
      fetchDealerDetails();
    }
  }, [id, selectedTab]);

  // Autosuggest API call
  const fetchSuggestions = async (keyword) => {
    if (!id) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}dealer-order-product-brand-autosuggest/`,
        {
          params: {
            user_id: id,
            keyword: keyword,
          },
        }
      );
      setSuggestions(response.data);
    } catch (err) {
      setSearchError("Failed to fetch suggestions");
      setSuggestions({ product_names: [], brand_names: [] });
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchKeyword) {
        fetchSuggestions(searchKeyword);
      } else {
        setSuggestions({ product_names: [], brand_names: [] });
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchKeyword, id]);

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
    setShowSuggestions(true);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Filter and sort order_list based on searchKeyword
  const getFilteredSortedOrders = () => {
    if (!dealerData || !dealerData.order_list) return [];
    const order_list = dealerData.order_list;
    if (!searchKeyword.trim()) return order_list;

    const keyword = searchKeyword.trim().toLowerCase();

    // Filter orders where any product or brand matches the keyword
    const filtered = order_list.filter((order) =>
      order.product_list.some(
        (product) =>
          (product.product_name && product.product_name.toLowerCase().includes(keyword)) ||
          (product.brand_name && product.brand_name.toLowerCase().includes(keyword))
      )
    );

    // Sort filtered orders by most matches first
    const sorted = filtered.sort((a, b) => {
      const aMatches = a.product_list.filter(
        (product) =>
          (product.product_name && product.product_name.toLowerCase().includes(keyword)) ||
          (product.brand_name && product.brand_name.toLowerCase().includes(keyword))
      ).length;
      const bMatches = b.product_list.filter(
        (product) =>
          (product.product_name && product.product_name.toLowerCase().includes(keyword)) ||
          (product.brand_name && product.brand_name.toLowerCase().includes(keyword))
      ).length;
      return bMatches - aMatches; // Descending: most matches first
    });

    return sorted;
  };

  // Check if both dealer data and user data are loading
  if (loading && selectedTab === 0) {
    return (
      <Box className="dealer-detail-container">
        <Box className="loading-container">
          <div className="loading-spinner"></div>
          <Typography variant="h6" className="loading-text">
            Loading buyer details...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Check if there was an error with dealer data
  if (error && selectedTab === 0) {
    return (
      <Box className="dealer-detail-container">
        <Box className="error-container">
          <Typography variant="h6" color="error" className="error-text">
            Error: {error}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }

  // Handle the case where user data is still loading
  if (userLoading) {
    return (
      <Box className="dealer-detail-container">
        <Box className="loading-container">
          <div className="loading-spinner"></div>
          <Typography variant="h6" className="loading-text">
            Fetching user data...
          </Typography>
        </Box>
      </Box>
    );
  }

  const { user_details = {}, order_list = [] } = dealerData || {};

  return (
    <Box className="dealer-detail-container">
      {/* Header Section */}
      <Box className="header-section">
        <BackButton
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/manufacturer/dealerList?page=${currentPage}`)}
        >
          Back to Buyers
        </BackButton>
        <Typography variant="h4" className="page-title">
          Buyer Details
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper
        elevation={3}
        sx={{
          marginBottom: "20px",
          boxShadow: "none",
          backgroundColor: "white",
          position: "sticky",
          top: "56px",
          padding: "10px 0px",
          zIndex: 9,
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
          sx={{ textTransform: "capitalize" }}
        >
          <Tab sx={{ textTransform: "capitalize" }} label="Buyer Information" />
          <Tab sx={{ textTransform: "capitalize" }} label="Buyer Discount" />
          <Tab sx={{ textTransform: "capitalize" }} label="Transactions" />
        </Tabs>
      </Paper>

      {/* Conditional Rendering of Tab Content */}
      {selectedTab === 0 && (
        <>
          {/* Buyer Information Card */}
          <StyledCard className="buyer-info-card">
            <CardContent className="card-content">
              <Box className="card-header">
                <PersonIcon className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Buyer Information
                </Typography>
              </Box>
              <Divider className="section-divider" />

              <Grid container spacing={3} className="info-grid">
                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <PersonIcon className="info-icon" />
                    <Box>
                      <Typography className="info-label">Full Name</Typography>
                      <Typography className="info-value">
                        {`${user_details.first_name || ""} ${user_details.last_name || ""}`.trim() ||
                          "N/A"}
                      </Typography>
                    </Box>
                  </InfoItem>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <EmailIcon className="info-icon" />
                    <Box>
                      <Typography className="info-label">Email Address</Typography>
                      <Typography className="info-value">
                        {user_details.email || "N/A"}
                      </Typography>
                    </Box>
                  </InfoItem>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <PhoneIcon className="info-icon" />
                    <Box>
                      <Typography className="info-label">Mobile Number</Typography>
                      <Typography className="info-value">
                        {user_details.mobile_number || "N/A"}
                      </Typography>
                    </Box>
                  </InfoItem>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <InfoItem>
                    <BusinessIcon className="info-icon" />
                    <Box>
                      <Typography className="info-label">Company Name</Typography>
                      <Typography className="info-value">
                        {user_details.company_name || "N/A"}
                      </Typography>
                    </Box>
                  </InfoItem>
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>

          {/* Orders Section */}
          <Box className="orders-section">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
              }}
            >
              <Box className="orders-header" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ShoppingCartIcon className="section-icon" />
                <Typography variant="h6" className="section-title">
                  Order History ({order_list.length})
                </Typography>
              </Box>
              <SearchBarContainer>
                <SearchIcon sx={{ color: "#2874f0" }} />
                <SearchInput
                  placeholder="Search Order History by products or brands…"
                  value={searchKeyword}
                  onChange={handleSearchChange}
                  inputProps={{ "aria-label": "search products or brands" }}
                  onFocus={(e) => {
                    setAnchorEl(e.currentTarget);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                />
                {searchLoading && (
                  <Typography variant="body2" sx={{ color: "#2874f0", ml: 2 }}>
                    Loading...
                  </Typography>
                )}
                {searchError && (
                  <Typography color="error" variant="body2" sx={{ ml: 2 }}>
                    {searchError}
                  </Typography>
                )}
                <Popper
                  open={
                    showSuggestions &&
                    (suggestions.product_names.length > 0 || suggestions.brand_names.length > 0)
                  }
                  anchorEl={anchorEl}
                  placement="bottom-start"
                  style={{
                    zIndex: 9999,
                    width: anchorEl?.offsetWidth || 300,
                  }}
                >
                  <Paper elevation={3} sx={{ mt: 1, maxHeight: 260, overflow: "auto" }}>
                    <List dense>
                      {suggestions.product_names.map((name) => (
                        <ListItem key={`prod-${name}`} disablePadding>
                          <ListItemButton
                            onMouseDown={() => {
                              setSearchKeyword(name);
                              setShowSuggestions(false);
                            }}
                          >
                            <ListItemText
                              primary={highlightMatch(name, searchKeyword)}
                              secondary="Product"
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                      {suggestions.brand_names.map((name) => (
                        <ListItem key={`brand-${name}`} disablePadding>
                          <ListItemButton
                            onMouseDown={() => {
                              setSearchKeyword(name);
                              setShowSuggestions(false);
                            }}
                          >
                            <ListItemText
                              primary={highlightMatch(name, searchKeyword)}
                              secondary="Brand"
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Popper>
              </SearchBarContainer>
            </Box>

            {/* Render filtered and sorted orders */}
            {getFilteredSortedOrders().length > 0 ? (
              getFilteredSortedOrders().map((order, index) => (
                <StyledCard key={order.order_id} className="order-card">
                  <CardContent className="order-content">
                    {/* Order Header */}
                    <Box className="order-header">
                      <Box className="order-info">
                        <Box className="order-id-section">
                          <ReceiptIcon className="order-icon" />
                          <Typography className="order-id">
                            Order #{order.order_id}
                          </Typography>
                        </Box>
                        <Chip
                          label={`Order ${index + 1}`}
                          size="small"
                          className="order-chip"
                        />
                      </Box>
                      <Box className="order-amount">
                        <Typography className="amount-label">Total Amount</Typography>
                        <Typography className="amount-value">₹{order.amount}</Typography>
                      </Box>
                    </Box>

                    {/* Products Table */}
                    <Box className="products-table-container">
                      <TableContainer component={Paper} className="table-container">
                        <Table>
                          <StyledTableHead>
                            <TableRow>
                              <TableCell align="center">Image</TableCell>
                              <TableCell>Product Name</TableCell>
                              <TableCell>Brand</TableCell>
                              <TableCell align="center">SKU</TableCell>
                              <TableCell align="center">MPN</TableCell>
                              <TableCell align="center">Quantity</TableCell>
                              <TableCell align="center">Price</TableCell>
                              <TableCell align="center">Total</TableCell>
                            </TableRow>
                          </StyledTableHead>
                          <TableBody>
                            {order.product_list.map((product, productIndex) => (
                              <StyledTableRow key={`${product.sku_number}-${productIndex}`}>
                                <TableCell align="center" className="image-cell">
                                  {product.primary_image ? (
                                    <Avatar
                                      variant="rounded"
                                      src={product.primary_image}
                                      alt={product.product_name}
                                      className="product-image"
                                    />
                                  ) : (
                                    <Avatar
                                      variant="rounded"
                                      className="product-image-placeholder"
                                    >
                                      <ImageIcon />
                                    </Avatar>
                                  )}
                                </TableCell>
                                <TableCell className="product-name-cell">
                                  <Tooltip title={product.product_name} arrow>
                                    <Typography className="product-name">
                                      {product.product_name || "N/A"}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                                <TableCell>
                                  <Typography className="table-text">
                                    {product.brand_name || "N/A"}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={product.sku_number || "N/A"}
                                    size="small"
                                    className="sku-chip"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography className="table-text">
                                    {product.mpn_number || "N/A"}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={product.quantity || 0}
                                    size="small"
                                    className="quantity-chip"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography className="price-text">
                                    ₹{product.price || 0}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography className="total-price-text">
                                    ₹{product.total_price || 0}
                                  </Typography>
                                </TableCell>
                              </StyledTableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </CardContent>
                </StyledCard>
              ))
            ) : (
              <StyledCard className="no-orders-card">
                <CardContent className="no-orders-content">
                  <ShoppingCartIcon className="no-orders-icon" />
                  <Typography className="no-orders-title">No Orders Found</Typography>
                  <Typography className="no-orders-subtitle">
                    This buyer hasn't placed any orders yet.
                  </Typography>
                </CardContent>
              </StyledCard>
            )}
          </Box>
        </>
      )}

      {/* Conditionally render BuyerDiscount and Transactions only after user data is available */}
      {selectedTab === 1 && !userLoading && <BuyerDiscount user={currentUser} buyerId={id} />}
      {selectedTab === 2 && !userLoading && <Transactions user={currentUser} />}
    </Box>
  );
};

export default DealerDetail;