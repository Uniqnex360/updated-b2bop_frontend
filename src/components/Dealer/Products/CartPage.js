import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogActions,
  DialogTitle,
  TextField,
  Stack,
  Divider,
  createTheme,
  ThemeProvider,
  styled,
  IconButton,
  Breadcrumbs,
  Link,
  Grid,
  CircularProgress,
  DialogContent,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const CartItemContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  gap: theme.spacing(2),
  flexWrap: "nowrap",
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

const ProductDetailsContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
}));

const DeleteIconContainer = styled(Box)({
  flexShrink: 0,
  minWidth: "32px",
  display: "flex",
  justifyContent: "flex-end",
});

const ProductImageContainer = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flexShrink: 0,
  border: `1px solid ${theme.palette.text.disabled}`,
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    height: 200,
  },
}));

const QuantityBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  border: `1px solid ${theme.palette.text.disabled}`,
  borderRadius: 8,
  background: theme.palette.background.paper,
}));

const ActionButton = styled(Button)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor,
  color: theme.palette.background.paper,
  fontWeight: 700,
  "&:hover": {
    backgroundColor: bgcolor,
    opacity: 0.9,
  },
}));

const CartPage = ({ fetchCartCount, fetchWishlist }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [emptyCartDialogVisible, setEmptyCartDialogVisible] = useState(false);
  const [deleteItemDialogVisible, setDeleteItemDialogVisible] = useState(false);
  const [itemQuantity, setItemQuantity] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [movingToWishlistId, setMovingToWishlistId] = useState(null);
  const navigate = useNavigate();

  const getUserData = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  const fetchCartItems = useCallback(async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainUserCartItemList/?user_id=${userId}`
      );
      const items = response.data.data || [];
      setCartItems(items);
      const initialQuantities = items.reduce(
        (acc, item) => ({
          ...acc,
          [item.id]: item.quantity,
        }),
        {}
      );
      setItemQuantity(initialQuantities);
    } catch (err) {
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  }, []);

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => acc + item.price * (itemQuantity[item.id] || item.quantity),
      0
    );
  }, [cartItems, itemQuantity]);

  const deleteCartItem = async (cartItemId) => {
    const originalCartItems = [...cartItems];
    const originalQuantity = { ...itemQuantity };
    setCartItems(cartItems.filter((item) => item.id !== cartItemId));

    try {
      const user = getUserData();
      if (user) {
        await axios.post(
          `${process.env.REACT_APP_IP}updateOrDeleteUserCartItem/`,
          {
            is_delete: true,
            empty_cart: false,
            id: cartItemId,
            quantity: 0,
          }
        );
        fetchCartCount();
      }
    } catch (error) {
      setError("Failed to delete item.");
      setCartItems(originalCartItems);
      setItemQuantity(originalQuantity);
    }
  };

  const handleMoveToWishlist = async (item) => {
    setMovingToWishlistId(item.id);
    const user = getUserData();
    if (!user) {
      setError("User not found. Please log in.");
      setMovingToWishlistId(null);
      return;
    }
    
    try {
      await axios.post(
        `${process.env.REACT_APP_IP}moveCartItemsToWishlist/`,
        {
          user_id: user.id,
          product_id: item.product_id,
        }
      );
      
      // Update local cart state to remove the item
      setCartItems(prevItems => prevItems.filter(cartItem => cartItem.id !== item.id));
      
      // Trigger a refresh on the wishlist page by calling the passed prop
      if (fetchWishlist) {
        fetchWishlist();
      }
      
      // Update cart count
      if (fetchCartCount) {
        fetchCartCount();
      }

    } catch (error) {
      console.error("Error moving item to wishlist:", error);
      setError("Failed to move item to wishlist. Please try again.");
      // Revert the state change if the API call fails
      setCartItems(prevItems => [...prevItems, item]);
    } finally {
      setMovingToWishlistId(null);
    }
  };

  const handleDeleteConfirmation = (cartItemId) => {
    setDeleteItemId(cartItemId);
    setDeleteItemDialogVisible(true);
  };

  const handleConfirmDeleteItem = () => {
    if (deleteItemId) {
      deleteCartItem(deleteItemId);
    }
    setDeleteItemDialogVisible(false);
  };

  const handleEmptyCartConfirmation = () => {
    setEmptyCartDialogVisible(true);
  };

  const updateCartItemQuantities = async () => {
    setIsUpdating(true);
    try {
      const user = getUserData();
      if (user) {
        const updatedCartList = cartItems.map((item) => ({
          id: item.id,
          quantity: itemQuantity[item.id] || item.quantity,
        }));
        await axios.post(
          `${process.env.REACT_APP_IP}updateOrDeleteUserCartItem/`,
          {
            is_delete: false,
            empty_cart: false,
            cart_list: updatedCartList,
          }
        );
      }
    } catch (error) {
      setError("Failed to update quantities.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  useEffect(() => {
    const user = getUserData();
    if (user) {
      fetchCartItems(user.id);
    } else {
      setError("User not found.");
      setLoading(false);
    }
  }, [fetchCartItems]);

  const handleQuantityChange = (cartItemId, newQuantity) => {
    const value = Math.max(1, parseInt(newQuantity) || 1);
    setItemQuantity((prev) => ({
      ...prev,
      [cartItemId]: value,
    }));
  };

  const handleEmptyCart = async () => {
    setEmptyCartDialogVisible(false);
    try {
      const user = getUserData();
      if (user) {
        await axios.post(
          `${process.env.REACT_APP_IP}updateOrDeleteUserCartItem/`,
          {
            empty_cart: true,
            user_id: user.id,
          }
        );
        setCartItems([]);
        setItemQuantity({});
        fetchCartCount();
      }
    } catch (error) {
      setError("Failed to clear cart.");
    }
  };

  const handleSingleProductCheckout = (item) => {
    const updatedItem = {
      ...item,
      quantity: itemQuantity[item.id] || item.quantity,
    };
    navigate("/dealer/checkout", { state: { product: updatedItem } });
  };

  const handleFullCartCheckout = () => {
    setIsPlacingOrder(true);
    setTimeout(() => {
      const itemsForCheckout = cartItems.map(item => ({
        ...item,
        quantity: itemQuantity[item.id] || item.quantity
      }));
      navigate("/dealer/checkout", { state: { cartItems: itemsForCheckout, totalAmount } });
      setIsPlacingOrder(false);
    }, 500);
  };

  const breadcrumbs = [
    <Link
      component={RouterLink}
      underline="hover"
      key="1"
      color="inherit"
      to="/dealer/products"
    >
      Products
    </Link>,
    <Typography key="2" color="text.primary">
      Cart
    </Typography>,
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: flipkartTheme.palette.background.default }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={flipkartTheme}>
      <Box
        sx={{
          background: flipkartTheme.palette.background.default,
          minHeight: "100vh",
          p: { xs: 1, sm: 3 },
        }}
      >
        <Box maxWidth="1100px" mx="auto" mb={2}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbs}
          </Breadcrumbs>
        </Box>
        {cartItems.length === 0 ? (
          <Box sx={{ textAlign: "center", paddingTop: "50px" }}>
            <Typography
              variant="h6"
              marginBottom={"20px"}
              color={flipkartTheme.palette.primary.main}
            >
              Your cart is empty.
            </Typography>
            <Button
              variant="contained"
              sx={{
                background: flipkartTheme.palette.primary.main,
                color: "#fff",
                fontWeight: 700,
                "&:hover": { background: flipkartTheme.palette.primary.dark },
              }}
              onClick={() => navigate("/dealer/products")}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          <Box maxWidth="1100px" mx="auto">
            <StyledPaper sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h4" sx={{ color: flipkartTheme.palette.text.primary }}>
                  My Cart ({cartItems.length})
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: flipkartTheme.palette.primary.main,
                    color: flipkartTheme.palette.primary.main,
                    fontWeight: 600,
                  }}
                  onClick={handleEmptyCartConfirmation}
                >
                  Clear Cart
                </Button>
              </Box>
            </StyledPaper>

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <StyledPaper sx={{ p: { xs: 1, sm: 2 } }}>
                  {cartItems.map((item) => (
                    <Box key={item.id} sx={{ borderBottom: '1px solid #D6D6D6', '&:last-of-type': { borderBottom: 'none' } }}>
                      <CartItemContainer>
                        <ProductImageContainer>
                          <img
                            src={
                              !item.primary_image ||
                              item.primary_image?.startsWith("http://example.com") ||
                              !(
                                item.primary_image?.startsWith("http") ||
                                item.primary_image?.startsWith("https")
                              )
                                ? soonImg
                                : item.primary_image
                            }
                            alt={item.name || "Product Image"}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </ProductImageContainer>
                        <ProductDetailsContainer>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color: flipkartTheme.palette.text.primary,
                              cursor: "pointer",
                              mb: 0.5,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => handleProductClick(item.product_id)}
                          >
                            {item.name}
                          </Typography>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 0, sm: 1 }}
                            divider={
                              <Divider
                                orientation="vertical"
                                flexItem
                                sx={{ display: { xs: "none", sm: "block" } }}
                              />
                            }
                            sx={{ mb: 1, flexWrap: "wrap" }}
                          >
                            <Typography
                              sx={{
                                fontSize: "12px",
                                color: flipkartTheme.palette.text.secondary,
                              }}
                            >
                              Brand: {item.brand_name || "-"}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "12px",
                                color: flipkartTheme.palette.text.secondary,
                              }}
                            >
                              SKU: {item.sku_number}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: flipkartTheme.palette.text.secondary,
                            }}
                          >
                            Each item price: {item.currency}{item.price?.toFixed(2)}
                          </Typography>
                          <Box sx={{ my: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                color: flipkartTheme.palette.text.primary,
                                fontSize: "1.25rem",
                              }}
                            >
                              {item.currency}{(itemQuantity[item.id] * item.price)?.toFixed(2)}
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <QuantityBox sx={{ width: "fit-content" }}>
                              <Button
                                sx={{
                                  minWidth: 32,
                                  px: 0,
                                  color: flipkartTheme.palette.text.primary,
                                  fontWeight: 700,
                                  fontSize: 20,
                                }}
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    Math.max(1, (itemQuantity[item.id] || item.quantity) - 1)
                                  )
                                }
                                disabled={isUpdating}
                              >
                                -
                              </Button>
                              <TextField
                                type="number"
                                value={itemQuantity[item.id] || item.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(item.id, e.target.value)
                                }
                                size="small"
                                inputProps={{
                                  min: 1,
                                  style: { textAlign: "center", padding: "6px 0" },
                                }}
                                sx={{
                                  width: "50px",
                                  "& .MuiInputBase-input": {
                                    textAlign: "center",
                                    fontWeight: 600,
                                    fontSize: 15,
                                  },
                                }}
                                disabled={isUpdating}
                              />
                              <Button
                                sx={{
                                  minWidth: 32,
                                  px: 0,
                                  color: flipkartTheme.palette.text.primary,
                                  fontWeight: 700,
                                  fontSize: 20,
                                }}
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    (itemQuantity[item.id] || item.quantity) + 1
                                  )
                                }
                                disabled={isUpdating}
                              >
                                +
                              </Button>
                            </QuantityBox>
                          </Box>
                          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                              variant="outlined"
                              sx={{
                                flex: 1,
                                borderColor: flipkartTheme.palette.primary.main,
                                color: flipkartTheme.palette.primary.main,
                                fontWeight: 600,
                                "&:hover": {
                                  bgcolor: 'transparent',
                                  textDecoration: 'underline'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToWishlist(item);
                              }}
                              disabled={isUpdating || movingToWishlistId === item.id}
                            >
                              {movingToWishlistId === item.id ? <CircularProgress size={20} color="inherit" /> : "SAVE FOR LATER"}
                            </Button>
                            <Button
                              variant="contained"
                              sx={{
                                flex: 1,
                                bgcolor: flipkartTheme.palette.primary.main,
                                color: flipkartTheme.palette.background.paper,
                                fontWeight: 600,
                                "&:hover": { bgcolor: flipkartTheme.palette.primary.dark }
                              }}
                              onClick={() => handleSingleProductCheckout(item)}
                              disabled={isPlacingOrder || isUpdating}
                            >
                              Checkout
                            </Button>
                          </Box>
                        </ProductDetailsContainer>
                        <DeleteIconContainer>
                          <IconButton
                            aria-label="delete item"
                            sx={{
                              color: flipkartTheme.palette.error.main,
                            }}
                            onClick={() => handleDeleteConfirmation(item.id)}
                            disabled={isUpdating}
                          >
                            <HighlightOffIcon />
                          </IconButton>
                        </DeleteIconContainer>
                      </CartItemContainer>
                    </Box>
                  ))}
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Button
                      variant="outlined"
                      sx={{
                        borderColor: flipkartTheme.palette.primary.main,
                        color: flipkartTheme.palette.primary.main,
                        fontWeight: 600,
                        ml: "auto",
                      }}
                      onClick={updateCartItemQuantities}
                      disabled={isUpdating}
                    >
                      {isUpdating ? <CircularProgress size={20} color="inherit" /> : "Update Quantities"}
                    </Button>
                  </Box>
                </StyledPaper>
              </Grid>

              {/* Right Column for Price Details */}
              <Grid item xs={12} md={4}>
                <StyledPaper sx={{ p: { xs: 1, sm: 2 } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: flipkartTheme.palette.text.secondary,
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    PRICE DETAILS
                  </Typography>
                  <Divider />
                  <Box sx={{ display: "flex", justifyContent: "space-between", my: 1, fontWeight: 'bold' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                      Item
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                      Quantity
                    </Typography>
                  </Box>
                  {cartItems.map((item) => (
                    <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", my: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1, pr: 1 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {itemQuantity[item.id] || item.quantity}
                      </Typography>
                    </Box>
                  ))}
                  <Divider />
                  <Stack spacing={1} sx={{ my: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">
                        Price ({cartItems.length} items)
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        {cartItems[0]?.currency}{totalAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: flipkartTheme.palette.text.primary }}
                    >
                      Total Amount
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700, color: flipkartTheme.palette.primary.main }}
                    >
                      {cartItems[0]?.currency}{totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                    <ActionButton
                      variant="contained"
                      fullWidth
                      bgcolor={flipkartTheme.palette.primary.main}
                      onClick={handleFullCartCheckout}
                      disabled={isPlacingOrder || isUpdating}
                    >
                      {isPlacingOrder ? <CircularProgress size={20} color="inherit" /> : "Place Full Order"}
                    </ActionButton>
                  </Box>
                </StyledPaper>
              </Grid>
            </Grid>

            {/* Empty Cart Confirmation Dialog */}
            <Dialog
              open={emptyCartDialogVisible}
              onClose={() => setEmptyCartDialogVisible(false)}
            >
              <DialogTitle>
                Are you sure you want to empty the cart?
              </DialogTitle>
              <DialogActions>
                <Button
                  onClick={handleEmptyCart}
                  color="primary"
                  variant="contained"
                >
                  Yes
                </Button>
                <Button
                  onClick={() => setEmptyCartDialogVisible(false)}
                  color="secondary"
                  variant="outlined"
                >
                  No
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete Item Confirmation Dialog */}
            <Dialog
              open={deleteItemDialogVisible}
              onClose={() => setDeleteItemDialogVisible(false)}
            >
              <DialogTitle>
                Are you sure you want to delete this item from the cart?
              </DialogTitle>
              <DialogContent>
                <Typography>This action cannot be undone.</Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleConfirmDeleteItem}
                  color="primary"
                  variant="contained"
                >
                  Yes, Delete
                </Button>
                <Button
                  onClick={() => setDeleteItemDialogVisible(false)}
                  color="secondary"
                  variant="outlined"
                >
                  Cancel
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default CartPage;