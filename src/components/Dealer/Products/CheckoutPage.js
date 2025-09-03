// C:\Users\Win11\Desktop\B2B-OP-dev-feb-12\src\components\Dealer\Products\CheckoutPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  Breadcrumbs,
  Link
} from '@mui/material';

import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import soonImg from "../../assets/soon-img.png";

// Define the Flipkart-inspired theme
const flipkartTheme = createTheme({
  palette: {
    primary: {
      main: "#1565C0", // Flipkart's primary blue
      dark: "#0a4b86",
    },
    secondary: {
      main: "#212121", // A dark gray for main text
    },
    error: {
      main: "#ff6161",
    },
    success: {
      main: "#388e3c",
    },
    background: {
      default: "#f1f3f6", // A light gray for the main page background
      paper: "#FFFFFF", // White for cards and sections
    },
    text: {
      primary: "#212121",
      secondary: "#878787", // Gray for secondary text
      disabled: "#D6D6D6",
    },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "2rem",
      letterSpacing: "0.5px",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.6rem",
      "@media (max-width:600px)": {
        fontSize: "1.3rem",
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.25rem",
      "@media (max-width:600px)": {
        fontSize: "1.1rem",
      },
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.875rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.7)",
          },
        },
      },
    },
  },
});

// Styled components for a modern, Flipkart-like look
const WhiteBackgroundBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff', // Set background to solid white
  minHeight: '100vh',
  padding: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.17)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
  padding: theme.spacing(4),
  height: '100%',
}));

const CheckoutButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main, // Flipkart Blue
  border: 0,
  borderRadius: 8,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(21, 101, 192, .3)',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark, // A slightly darker blue on hover
  },
}));

function CheckoutPage({ fetchCartCount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userDetails, setUserDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userData = localStorage.getItem("user");
        const userId = userData ? JSON.parse(userData).id : null;
        if (userId) {
          const response = await axios.get(
            `${process.env.REACT_APP_IP}obtainUserDetails/?user_id=${userId}`
          );
          setUserDetails(response.data.data.user_obj);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const getUserData = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  const fetchCartItems = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainUserCartItemList/?user_id=${userId}`
      );
      setCartItems(response.data.data || []);
    } catch (err) {
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalAmountAndCount = async (userId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}totalCheckOutAmount/?user_id=${userId}`
      );
      if (response.data && response.data.data) {
        const { total_amount, cart_count } = response.data.data;
        setTotalAmount(total_amount || 0);
        setCartCount(cart_count || 0);
      } else {
        console.error("Invalid response structure for total amount and count.");
      }
    } catch (err) {
      console.error("Error fetching total amount and count:", err);
    }
  };

  const handleConfirmOrder = async () => {
    const { username, email, mobile_number, address } = userDetails || {};
    const { street, city, state, country, zipCode } = address || {};

    if (!username || !email || !mobile_number || !street || !city || !state || !country || !zipCode) {
      setOpenDialog(true);
      return;
    }
    
    // Instead of creating an order on the backend, we navigate to the payment page.
    // The order creation will happen on the payment page after the user confirms payment method.
    navigate("/dealer/paymentPage", {
      state: {
        cartItems: cartItems,
        totalAmount: totalAmount,
        userDetails: userDetails,
        cartCount: cartCount,
      }
    });
  };

  useEffect(() => {
    const user = getUserData();
    if (!user) {
      setError("User not found.");
      setLoading(false);
      return;
    }

    const singleProduct = location.state?.product;

    if (singleProduct) {
      setCartItems([singleProduct]);
      setTotalAmount(singleProduct.price * singleProduct.quantity);
      setCartCount(1);
      setLoading(false);
    } else {
      fetchCartItems(user.id);
      fetchTotalAmountAndCount(user.id);
    }
  }, [location.state]);

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleNavigateProfile = () => {
    navigate("/dealer/profile");
    setOpenDialog(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ThemeProvider theme={flipkartTheme}>
      <WhiteBackgroundBox>
        <Container maxWidth="lg">
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
            <Link underline="hover" color="inherit" href="/dealer/home">
              Home
            </Link>
            <Link underline="hover" color="inherit" href="/dealer/cart">
              Cart
            </Link>
            <Typography color="text.primary">
              Checkout
            </Typography>
          </Breadcrumbs>

          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Secure Checkout
          </Typography>

          <Grid container spacing={4}>
            {/* Left Side - Customer Information */}
            <Grid item xs={12} md={7}>
              <StyledPaper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                    1. Shipping details
                  </Typography>
                  <Button
                    onClick={isEditing ? handleSave : handleEditClick}
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{
                      textTransform: 'none',
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'rgba(21, 101, 192, 0.04)',
                      }
                    }}
                  >
                    {isEditing ? 'Save' : 'Change'}
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {userDetails ? (
                  isEditing ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Full Name"
                          fullWidth
                          required
                          value={userDetails.username || ''}
                          onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email Address"
                          fullWidth
                          required
                          value={userDetails.email || ''}
                          onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Phone Number"
                          fullWidth
                          required
                          value={userDetails.mobile_number || ''}
                          onChange={(e) => setUserDetails({ ...userDetails, mobile_number: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Street Address"
                          fullWidth
                          required
                          value={userDetails.address?.street || ''}
                          onChange={(e) => setUserDetails({
                            ...userDetails,
                            address: { ...userDetails.address, street: e.target.value },
                          })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="City"
                          fullWidth
                          required
                          value={userDetails.address?.city || ''}
                          onChange={(e) => setUserDetails({
                            ...userDetails,
                            address: { ...userDetails.address, city: e.target.value },
                          })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="State"
                          fullWidth
                          required
                          value={userDetails.address?.state || ''}
                          onChange={(e) => setUserDetails({
                            ...userDetails,
                            address: { ...userDetails.address, state: e.target.value },
                          })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Country"
                          fullWidth
                          required
                          value={userDetails.address?.country || ''}
                          onChange={(e) => setUserDetails({
                            ...userDetails,
                            address: { ...userDetails.address, country: e.target.value },
                          })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Zip Code"
                          fullWidth
                          required
                          value={userDetails.address?.zipCode || ''}
                          onChange={(e) => setUserDetails({
                            ...userDetails,
                            address: { ...userDetails.address, zipCode: e.target.value },
                          })}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <Box>
                      <Typography variant="body1" fontWeight="bold">{userDetails.username}</Typography>
                      <Typography variant="body1">{userDetails.address?.street}</Typography>
                      <Typography variant="body1">{`${userDetails.address?.city}, ${userDetails.address?.state} ${userDetails.address?.zipCode}`}</Typography>
                      <Typography variant="body1">{userDetails.address?.country}</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        <Box component="span" fontWeight="bold">Phone: </Box>
                        {userDetails.mobile_number}
                      </Typography>
                    </Box>
                  )
                ) : (
                  <Typography>Loading user details...</Typography>
                )}
              </StyledPaper>
            </Grid>

            {/* Right Side - Order Summary */}
            <Grid item xs={12} md={5}>
              <StyledPaper>
                <Typography variant="h6" gutterBottom>
                  Order Summary ({cartCount} Items)
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  pr: 1,
                  '&::-webkit-scrollbar': { width: '4px' },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '2px',
                  },
                }}>
                  {cartItems.map((item, index) => (
                    <Box key={index} display="flex" alignItems="center" my={2}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 2,
                          overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        <img
                          src={!item.primary_image || item.primary_image?.startsWith("http://example.com") || !(item.primary_image?.startsWith("http") || item.primary_image?.startsWith("https"))
                            ? soonImg
                            : item.primary_image
                          }
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Box ml={2} flex={1}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontSize: '14px', lineHeight: '1.2', cursor: 'pointer', fontWeight: 500 }}
                          onClick={() => handleProductClick(item.product_id)}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          Quantity: {item.quantity} x ${item.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'text.primary' }}>Order Total</Typography>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>${totalAmount.toFixed(2)}</Typography>
                </Box>

                <CheckoutButton
                  fullWidth
                  size="large"
                  onClick={handleConfirmOrder}
                >
                  Confirm Order & Proceed to Payment
                </CheckoutButton>
              </StyledPaper>
            </Grid>
          </Grid>
        </Container>

        {/* Dialog for missing information */}
        <Dialog open={openDialog} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: 8 } }}>
          <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Profile Incomplete</Typography>
              <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 4 }}>
            <Typography variant="body1">
              Please ensure all required shipping details are filled out in your profile before you can confirm your order.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleNavigateProfile} color="primary" variant="contained" sx={{ px: 4 }}>
              Update Profile
            </Button>
          </DialogActions>
        </Dialog>
      </WhiteBackgroundBox>
    </ThemeProvider>
  );
}

export default CheckoutPage;