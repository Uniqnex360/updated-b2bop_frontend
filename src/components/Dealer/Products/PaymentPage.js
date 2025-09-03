// C:\Users\Win11\Desktop\B2B-OP-dev-feb-12\src\components\Dealer\Products\PaymentPage.js

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Divider,
  Grid,
  Breadcrumbs,
  Link,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LockIcon from '@mui/icons-material/Lock';
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

const WhiteBackgroundBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#ffffff',
  minHeight: '100vh',
  padding: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.17)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  padding: theme.spacing(4),
  height: '100%',
}));

const PaymentButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.success.main, // A distinct color for payment button
  border: 0,
  borderRadius: 8,
  color: 'white',
  height: 48,
  padding: '0 30px',
  boxShadow: '0 3px 5px 2px rgba(56, 142, 60, .3)',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
  },
}));

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, totalAmount, cartCount } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // Check if data is missing, redirect back to checkout if so
  useEffect(() => {
    if (!cartItems || !totalAmount) {
      navigate('/dealer/checkout');
    }
  }, [cartItems, totalAmount, navigate]);

  const handlePayment = () => {
    // This is where you would make the API call to your backend
    // to finalize the order and process payment.
    // For this UI-only demo, we'll just show an alert.
    alert("This is a UI demo. Payment not processed.");
  };

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  return (
    <ThemeProvider theme={flipkartTheme}>
      <WhiteBackgroundBox>
        <Container maxWidth="lg">
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
            <Link underline="hover" color="inherit" href="/dealer/home">Home</Link>
            <Link underline="hover" color="inherit" href="/dealer/cart">Cart</Link>
            <Link underline="hover" color="inherit" href="/dealer/checkout">Checkout</Link>
            <Typography color="text.primary">Payment</Typography>
          </Breadcrumbs>

          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Secure Payment
          </Typography>

          <Grid container spacing={4}>
            {/* Left Side - Payment Options */}
            <Grid item xs={12} md={7}>
              <StyledPaper>
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold', mb: 2 }}>
                  2. Select Payment Method
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <FormControl component="fieldset" fullWidth>
                  <RadioGroup
                    aria-label="payment-method"
                    name="payment-method-group"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <FormControlLabel
                          value="credit_card"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CreditCardIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography>Credit / Debit Card</Typography>
                            </Box>
                          }
                          sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        />
                        {paymentMethod === 'credit_card' && (
                          <Box sx={{ mt: 2, pl: 4 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <TextField
                                  label="Card Number"
                                  fullWidth
                                  required
                                  placeholder="xxxx xxxx xxxx xxxx"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  label="Name on Card"
                                  fullWidth
                                  required
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  label="Expiry"
                                  fullWidth
                                  required
                                  placeholder="MM/YY"
                                />
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <TextField
                                  label="CVV"
                                  fullWidth
                                  required
                                  placeholder="***"
                                />
                              </Grid>
                            </Grid>
                          </Box>
                        )}
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <FormControlLabel
                          value="net_banking"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography>Net Banking</Typography>
                            </Box>
                          }
                          sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        />
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <FormControlLabel
                          value="upi"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PhoneIphoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography>UPI / QR Code</Typography>
                            </Box>
                          }
                          sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        />
                      </CardContent>
                    </Card>
                  </RadioGroup>
                </FormControl>
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
                  {cartItems?.map((item, index) => (
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
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'text.primary' }}>Order Total</Typography>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>${totalAmount?.toFixed(2) || '0.00'}</Typography>
                </Box>
                <PaymentButton
                  fullWidth
                  size="large"
                  onClick={handlePayment}
                >
                  <LockIcon sx={{ mr: 1 }} />
                  Pay Now
                </PaymentButton>
              </StyledPaper>
            </Grid>
          </Grid>
        </Container>
      </WhiteBackgroundBox>
    </ThemeProvider>
  );
}

export default PaymentPage;