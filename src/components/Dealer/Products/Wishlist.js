import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useNavigate } from "react-router-dom";
import soonImg from "../../assets/soon-img.png";

const Wishlist = ({ fetchCartCount, fetchWishlist }) => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(
    async (query = "") => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("user");
        if (!userData) {
          setError("No user logged in");
          setLoading(false);
          return;
        }
        const user = JSON.parse(userData);
        const userId = user.id;
        const searchParam = query ? `&search=${query}` : "";
        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainWishlistForBuyer/?user_id=${userId}${searchParam}`
        );
        setWishlist(response.data.data || []);
      } catch (err) {
        setError("Error retrieving wishlist");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData, fetchWishlist]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Debounce or directly call API on change
    if (query.length > 2 || query.length === 0) {
      fetchData(query);
    }
  };

  const handleRemove = async () => {
    if (!itemToDelete) return;
    const originalWishlist = [...wishlist];
    setWishlist(wishlist.filter((item) => item.id !== itemToDelete));
    setOpenDialog(false);
    try {
      await axios.get(
        `${process.env.REACT_APP_IP}deleteWishlist/?wish_list_id=${itemToDelete}`
      );
      // Re-fetch the data to get the updated list from the server
      fetchData(searchQuery);
    } catch (error) {
      setError("Failed to remove item from wishlist");
      setWishlist(originalWishlist);
    } finally {
      setItemToDelete(null);
    }
  };

  const handleOpenDialog = (wishListId) => {
    setItemToDelete(wishListId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setItemToDelete(null);
  };

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  const handleAddToCart = async (product) => {
    setAddingToCartId(product.id);
    const originalWishlist = [...wishlist];
    setWishlist((prevWishlist) =>
      prevWishlist.filter((item) => item.id !== product.id)
    );

    try {
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData);
      const userId = user.id;

      await axios.post(
        `${process.env.REACT_APP_IP}createOrUpdateUserCartItem/`,
        {
          user_id: userId,
          product_id: product.product_id,
          quantity: 1,
          price: product.price,
        }
      );

      await axios.get(
        `${process.env.REACT_APP_IP}deleteWishlist/?wish_list_id=${product.id}`
      );

      if (fetchCartCount) {
        fetchCartCount();
      }
      // Re-fetch the data to get the updated list from the server
      fetchData(searchQuery);
    } catch (error) {
      console.error("Failed to add to cart or remove from wishlist:", error);
      setError("Failed to move item to cart.");
      setWishlist(originalWishlist);
    } finally {
      setAddingToCartId(null);
    }
  };

  const flipkartBlue = "#2874f0";
  const flipkartYellow = "#ffe11b";
  const flipkartGray = "#f1f3f6";

  return (
    <Box
      sx={{ p: { xs: 1, sm: 2 }, background: flipkartGray, minHeight: "100vh" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            textAlign: "left",
            color: flipkartBlue,
            letterSpacing: 1,
          }}
        >
          My Wishlist
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: { xs: "100%", sm: "250px" },
            mt: { xs: 2, sm: 0 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
            },
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", paddingTop: "50px" }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : wishlist.length > 0 ? (
        <Box
          display="flex"
          flexWrap="wrap"
          gap={3}
          justifyContent={{ xs: "center", sm: "flex-start" }}
        >
          {wishlist.map((product) => (
            <Card
              key={product.id}
              sx={{
                width: { xs: "100%", sm: 340, md: 300 },
                minHeight: 390,
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(40,116,240,0.08)",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "box-shadow 0.2s",
                "&:hover": {
                  boxShadow: "0 4px 16px rgba(40,116,240,0.18)",
                },
                cursor: "pointer",
              }}
              onClick={() => handleProductClick(product.product_id)}
            >
              <Box sx={{ position: "relative", p: 2, pb: 0 }}>
                <CardMedia
                  component="img"
                  height="160"
                  image={
                    !product.primary_image ||
                    product.primary_image.startsWith("http://example.com") ||
                    !(
                      product.primary_image.startsWith("http") ||
                      product.primary_image.startsWith("https")
                    )
                      ? soonImg
                      : product.primary_image
                  }
                  alt={product.name || "Product Image"}
                  sx={{
                    objectFit: "contain",
                    borderRadius: 1,
                    background: "#f8f8f8",
                    border: "1px solid #f0f0f0",
                    height: 160,
                  }}
                />
                {product.discount > 0 &&
                  product.price.toFixed(2) !== product.was_price.toFixed(2) && (
                    <Chip
                      icon={<LocalOfferIcon sx={{ color: "#fff" }} />}
                      label={`${product.discount}% OFF`}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        bgcolor: flipkartBlue,
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "12px",
                        px: 1,
                        zIndex: 2,
                      }}
                    />
                  )}
                {product.in_cart && (
                  <Chip
                    label="In Cart"
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: 10,
                      left: 10,
                      bgcolor: "#43a047",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "12px",
                      px: 1,
                      zIndex: 2,
                    }}
                  />
                )}
              </Box>
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 2,
                  pt: 1,
                }}
              >
                <Box>
                  <Tooltip title={product.name}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        color: "#212121",
                        lineHeight: "22px",
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        fontSize: "1rem",
                      }}
                    >
                      {product.name}
                    </Typography>
                  </Tooltip>
                  <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: "12px", color: "#878787" }}>
                      Brand: {product.brand_name || "-"}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography sx={{ fontSize: "12px", color: "#878787" }}>
                      SKU: {product.sku_number}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: "12px", color: "#878787" }}>
                      MPN: {product.mpn_number}
                    </Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography sx={{ fontSize: "12px", color: "#878787" }}>
                      Category: {product.category_name || "-"}
                    </Typography>
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: "12px", color: "#388e3c" }}>
                    {product.availability ? "In Stock" : "Out of Stock"}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#212121",
                        fontWeight: 700,
                        fontSize: "1.2rem",
                        letterSpacing: 0.5,
                      }}
                    >
                      {product.currency}
                      {product.price.toFixed(2)}
                    </Typography>
                    {product.price.toFixed(2) !== product.was_price.toFixed(2) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          textDecoration: "line-through",
                          fontSize: "0.95rem",
                          color: "#878787",
                        }}
                      >
                        {product.currency}
                        {product.was_price.toFixed(2)}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.95rem",
                        color: "#388e3c",
                        fontWeight: 600,
                        ml: 1,
                      }}
                    >
                      {product.discount > 0 ? `Save ${product.currency}${(product.was_price - product.price).toFixed(2)}` : ""}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: "12px", color: "#878787", mt: 0.5 }}>
                    MSRP: {product.currency}{product.msrp?.toFixed(2)}
                  </Typography>
                  {product.description && (
                    <Typography
                      sx={{
                        fontSize: "12px",
                        color: "#616161",
                        mt: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                      }}
                    >
                      {product.description}
                    </Typography>
                  )}
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1}
                  mt={2}
                >
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      background: flipkartYellow,
                      color: "#212121",
                      fontWeight: 700,
                      boxShadow: "none",
                      "&:hover": {
                        background: "#ffd700",
                        boxShadow: "none",
                      },
                      minWidth: 0,
                      px: 2,
                      py: 0.5,
                      fontSize: "0.95rem",
                    }}
                    disabled={!product.availability || addingToCartId === product.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    startIcon={addingToCartId === product.id ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartOutlinedIcon />}
                  >
                    {addingToCartId === product.id ? "Adding..." : "Add to Cart"}
                  </Button>
                  <Tooltip title="Remove Item">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(product.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", paddingTop: "50px" }}>
          <Typography variant="h6" marginBottom={"20px"}>
            Your Wishlist is Empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              background: flipkartBlue,
              color: "#fff",
              fontWeight: 700,
              "&:hover": { background: "#1565c0" },
            }}
            onClick={() => navigate("/dealer/products")}
          >
            Continue Shopping
          </Button>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this item from your wishlist?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRemove} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wishlist;