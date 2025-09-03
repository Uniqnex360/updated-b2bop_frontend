import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import {
  CircularProgress,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  styled,
  createTheme,
  ThemeProvider,
  Breadcrumbs, // Import Breadcrumbs
  Link, // Import Link
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import VerifiedIcon from "@mui/icons-material/Verified";
import NavigateNextIcon from "@mui/icons-material/NavigateNext"; // Import NavigateNextIcon for the separator
import soonImg from "../../assets/soon-img.png";
import fallbackImage from "../../../../src/whirlpool.jpeg";

// Define the Flipkart-inspired theme
const flipkartTheme = createTheme({
  palette: {
    primary: {
      main: "#1565C0", // Flipkart's primary blue
    },
    secondary: {
      main: "#212121", // A dark gray for main text
    },
    error: {
      main: "#ff6161", // A red for error states and discounts
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
      fontWeight: 600,
      fontSize: "2.1rem",
      "@media (max-width:600px)": {
        fontSize: "1.7rem",
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.6rem",
      "@media (max-width:600px)": {
        fontSize: "1.3rem",
      },
    },
    h6: {
      fontWeight: 500,
      fontSize: "1.1rem",
      "@media (max-width:600px)": {
        fontSize: "1rem",
      },
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.875rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 48,
          "&.Mui-expanded": {
            minHeight: 48,
          },
        },
        content: {
          "&.Mui-expanded": {
            margin: "12px 0",
          },
        },
      },
    },
  },
});

// Styled components for better readability and reusable styles
const ProductContainer = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  minHeight: "100vh",
  padding: theme.spacing(2, 2, 4),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(3, 4, 6),
  },
}));

const ProductDetailsWrapper = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

const ProductImageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  position: "sticky",
  top: theme.spacing(10), // Adjust based on your header height
  alignSelf: "flex-start",
  zIndex: 2,
  [theme.breakpoints.down("md")]: {
    position: "static",
    top: "auto",
  },
}));

const MainImage = styled(CardMedia)(({ theme }) => ({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  maxHeight: 400,
  [theme.breakpoints.down("sm")]: {
    maxHeight: 250,
  },
}));

const ThumbnailImage = styled("img")(({ theme, isSelected }) => ({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  border: isSelected
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.text.disabled}`,
  borderRadius: theme.spacing(0.5),
  cursor: "pointer",
  transition: "border 0.2s",
  "&:hover": {
    borderColor: theme.palette.primary.main,
  },
}));

const QuantityBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  border: `1px solid ${theme.palette.text.disabled}`,
  borderRadius: theme.spacing(0.5),
  height: 38,
}));

const ActionButton = styled(Button)(({ theme, bgcolor }) => ({
  color: theme.palette.background.paper,
  fontWeight: 600,
  fontSize: 15,
  padding: theme.spacing(1.5, 4),
  boxShadow: "none",
  borderRadius: theme.spacing(0.5),
  backgroundColor: bgcolor,
  "&:hover": {
    backgroundColor: bgcolor,
    opacity: 0.9,
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: 14,
    padding: theme.spacing(1.5, 2),
  },
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.1)",
  marginBottom: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  "&::before": {
    display: "none",
  },
}));

const RelatedProductsSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.1)",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(3),
  },
}));

const RelatedProductCard = styled(Card)(({ theme }) => ({
  width: "100%",
  height: "100%",
  padding: theme.spacing(1),
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  cursor: "pointer",
  transition: "transform 0.2s, box-shadow 0.2s",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    transform: "scale(1.03)",
    borderColor: theme.palette.primary.main,
  },
}));

const EngagementsSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.1)",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

const EngagementItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    textAlign: "center",
    gap: theme.spacing(1),
  },
}));

const ProductDetail = ({ fetchCartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [RelatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(soonImg);
  const [currentIndex, setCurrentIndex] = useState(0);
  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("page") || 0;
  const { searchQuery } = location.state || {};
  const [expandedInfo, setExpandedInfo] = useState(true);
  const [expandedAttributes, setExpandedAttributes] = useState(true);
  const [expandedfeatures, setExpandedfeatures] = useState(false);
  const isMobile = useMediaQuery(flipkartTheme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductDetails/?product_id=${id}`
        );
        const productData = productResponse.data.data || {};
        setProduct(productData);
        setMainImage(productData.logo || soonImg);
        setCurrentIndex(0);

        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        const relatedResponse = await axios.get(
          `${process.env.REACT_APP_IP}get_related_products/?product_id=${id}&manufacture_unit_id=${manufactureUnitId}`
        );
        const relatedData = relatedResponse.data.data || [];
        setRelatedProducts(relatedData);
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleQuantityChange = (type) => {
    setQuantity((prev) => (type === "increment" ? prev + 1 : Math.max(prev - 1, 1)));
  };

  const handleAddToCart = async (product, quantity, isBuyNow = false) => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        toast.error("Please log in to add items to your cart.");
        navigate("/login");
        return;
      }
      const user = JSON.parse(userData);
      const userId = user.id;

      const existingItem = cartItems.find((item) => item.product_id === product.id);

      let newQuantity = quantity;
      if (existingItem) {
        newQuantity += existingItem.quantity;
      }

      await axios.post(`${process.env.REACT_APP_IP}createOrUpdateUserCartItem/`, {
        user_id: userId,
        product_id: product.id,
        quantity: newQuantity,
        price: product.list_price,
      });

      setCartItems((prev) => {
        if (existingItem) {
          return prev.map((item) =>
            item.product_id === product.id ? { ...item, quantity: newQuantity } : item
          );
        } else {
          return [...prev, { product_id: product.id, quantity: quantity, price: product.list_price }];
        }
      });

      toast.success(existingItem ? "Product quantity updated." : "Product added to cart!");
      fetchCartCount && fetchCartCount();
      if (isBuyNow) {
        navigate("/dealer/checkout", {
          state: { product: { ...product, quantity } },
        });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add product to cart.");
    }
  };

  const handleBuyNow = () => {
    handleAddToCart(product, quantity, true);
  };

  const handleImageClick = (image, index) => {
    setMainImage(image);
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    const newIndex =
      (currentIndex - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1);
    setMainImage(product?.images?.[newIndex] || soonImg);
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % (product?.images?.length || 1);
    setMainImage(product?.images?.[newIndex] || soonImg);
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === "ArrowLeft") {
        handlePrev();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, product?.images]);

  const handleProductClick = (productId) => {
    const url = `/dealer/products/${productId}`;
    const newTab = window.open(url, "_blank");
    if (newTab) {
      newTab.focus();
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box
        sx={{
          textAlign: "center",
          mt: 4,
          color: "red",
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        {error}
      </Box>
    );

  return (
    <ThemeProvider theme={flipkartTheme}>
      <ProductContainer>
        <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
          {/* Breadcrumbs */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 2, color: "text.secondary" }}
          >
            <Link
              underline="hover"
              color="inherit"
              href="#"
              onClick={() => navigate("/dealer/products")}
            >
              Products
            </Link>
            <Typography color="text.primary">{product?.product_name}</Typography>
          </Breadcrumbs>
          {/* Main Product Grid */}
          <ProductDetailsWrapper>
            <Grid container spacing={isMobile ? 2 : 5}>
              {/* Image Gallery Section */}
              <Grid item xs={12} md={5}>
                <ProductImageContainer>
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: 250, sm: 350, md: 450 },
                      backgroundColor: "background.paper",
                      borderRadius: 1,
                      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.1)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      border: "1px solid #e0e0e0",
                      p: 2,
                      overflow: "hidden",
                    }}
                  >
                    <MainImage
                      component="img"
                      image={
                        mainImage &&
                        (mainImage.startsWith("http://example.com") || !mainImage.startsWith("http")
                          ? soonImg
                          : mainImage)
                      }
                      alt={product?.product_name}
                    />
                  </Box>
                  {/* Thumbnails */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                      mt: 2,
                      overflowX: "auto",
                    }}
                  >
                    {product?.images?.map((image, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: { xs: 50, sm: 60, md: 70 },
                          height: { xs: 50, sm: 60, md: 70 },
                        }}
                        onClick={() => handleImageClick(image, index)}
                      >
                        <ThumbnailImage
                          src={
                            image &&
                            (image.startsWith("http://example.com") || !image.startsWith("http")
                              ? soonImg
                              : image)
                          }
                          alt={`Thumbnail ${index}`}
                          isSelected={index === currentIndex}
                        />
                      </Box>
                    ))}
                  </Box>
                </ProductImageContainer>
              </Grid>

              {/* Product Details Section */}
              <Grid item xs={12} md={7}>
                <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Brand and Name */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 18, color: "text.primary" }}>
                      {product?.brand_name || "N/A"}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "text.primary", mt: 1 }}>
                    {product?.product_name}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
                    {product?.short_description}
                  </Typography>
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      alignItems: "baseline",
                      gap: 3,
                      borderBottom: `1px solid ${flipkartTheme.palette.divider}`,
                      pb: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      component="p"
                      sx={{ fontSize: { xs: 22, sm: 28, md: 32 }, fontWeight: 700, color: "text.primary" }}
                    >
                      {product?.currency} {product?.list_price ? product.list_price.toFixed(2) : "N/A"}
                    </Typography>
                    {product?.was_price && product?.list_price && product.list_price < product.was_price && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          component="p"
                          sx={{ fontSize: 18, color: "text.secondary", textDecoration: "line-through" }}
                        >
                          {product?.was_price.toFixed(2)}
                        </Typography>
                        {product?.discount && product.discount !== "0%" && (
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 13,
                              fontWeight: 500,
                              background: flipkartTheme.palette.error.main,
                              borderRadius: 4,
                              padding: "2px 8px",
                            }}
                          >
                            {product.discount} OFF
                          </span>
                        )}
                      </Box>
                    )}
                  </Box>
                  {/* Icons Section */}
                  <Box sx={{ width: "100%", mt: 2, display: "flex", gap: 3, flexWrap: "wrap" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: flipkartTheme.palette.primary.main,
                        fontWeight: 500,
                        fontSize: 15,
                      }}
                    >
                      <LocalOfferIcon fontSize="small" />
                      <span>
                        Special Price:{" "}
                        {product?.discount && product.discount !== "0%"
                          ? product.discount + " OFF"
                          : "Best Deal"}
                      </span>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        color: "#2196f3", // Consistent with the new blue theme
                        fontSize: 13,
                        mt: { xs: 1, sm: 0 },
                      }}
                    >
                      <VerifiedUserIcon fontSize="small" />
                      <span>100% Genuine Products</span>
                    </Box>
                  </Box>
                  {/* Quantity and Actions */}
                  <Box sx={{ display: "flex", gap: 2, mt: 3, alignItems: "center", flexWrap: "wrap" }}>
                    <QuantityBox>
                      <Button
                        sx={{ minWidth: 36, fontSize: 20, color: "text.primary" }}
                        onClick={() => handleQuantityChange("decrement")}
                      >
                        -
                      </Button>
                      <Typography sx={{ mx: 1, fontWeight: 600, color: "text.primary" }}>
                        {quantity}
                      </Typography>
                      <Button
                        sx={{ minWidth: 36, fontSize: 20, color: "text.primary" }}
                        onClick={() => handleQuantityChange("increment")}
                      >
                        +
                      </Button>
                    </QuantityBox>
                    <ActionButton
                      bgcolor={flipkartTheme.palette.primary.main}
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAddToCart(product, quantity)}
                    >
                      Add to Cart
                    </ActionButton>
                    <ActionButton
                      bgcolor="#fb641b" // A vibrant orange for Buy Now, common on Flipkart
                      startIcon={<FlashOnIcon />}
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </ActionButton>
                  </Box>
                  {/* Accordions */}
                  <Box sx={{ mt: 4, flexGrow: 1 }}>
                    <StyledAccordion
                      expanded={expandedInfo}
                      onChange={() => setExpandedInfo(!expandedInfo)}
                    >
                      <AccordionSummary
                        expandIcon={expandedInfo ? <RemoveIcon /> : <AddIcon />}
                        sx={{ background: flipkartTheme.palette.background.default }}
                      >
                        <Typography sx={{ fontWeight: 600, color: flipkartTheme.palette.secondary.main }}>
                          Product Information
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              {Object.entries({
                                "Model Name": product?.model,
                                "Brand Name": product?.brand_name,
                                "Product Category": product?.end_level_category,
                                Industry: product?.industry_name,
                                "Product Description": product?.long_description,
                                "MPN Number": product?.mpn,
                                "UPC Number": product?.upc_ean,
                                MSRP: product?.msrp ? `$${product.msrp.toFixed(2)}` : "N/A",
                              }).map(([key, value]) => (
                                <TableRow key={key}>
                                  <TableCell
                                    sx={{
                                      width: 180,
                                      fontWeight: 600,
                                      color: "text.primary",
                                      borderBottom: "none",
                                    }}
                                  >
                                    {key}
                                  </TableCell>
                                  <TableCell sx={{ color: "text.secondary", borderBottom: "none" }}>
                                    {value || "N/A"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </StyledAccordion>
                    <StyledAccordion
                      expanded={expandedAttributes}
                      onChange={() => setExpandedAttributes(!expandedAttributes)}
                    >
                      <AccordionSummary
                        expandIcon={expandedAttributes ? <RemoveIcon /> : <AddIcon />}
                        sx={{ background: flipkartTheme.palette.background.default }}
                      >
                        <Typography sx={{ fontWeight: 600, color: flipkartTheme.palette.secondary.main }}>
                          Product Attributes
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        <TableContainer>
                          <Table size="small">
                            <TableBody>
                              {product?.attributes &&
                                Object.entries(product.attributes).map(([key, value]) => (
                                  <TableRow key={key}>
                                    <TableCell
                                      sx={{
                                        width: 180,
                                        fontWeight: 600,
                                        color: "text.primary",
                                        borderBottom: "none",
                                      }}
                                    >
                                      {key}
                                    </TableCell>
                                    <TableCell sx={{ color: "text.secondary", borderBottom: "none" }}>
                                      {value}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </StyledAccordion>
                    <StyledAccordion
                      expanded={expandedfeatures}
                      onChange={() => setExpandedfeatures(!expandedfeatures)}
                    >
                      <AccordionSummary
                        expandIcon={expandedfeatures ? <RemoveIcon /> : <AddIcon />}
                        sx={{ background: flipkartTheme.palette.background.default }}
                      >
                        <Typography sx={{ fontWeight: 600, color: flipkartTheme.palette.secondary.main }}>
                          Features
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2 }}>
                        {product?.features && product.features.length > 0 ? (
                          <ul
                            style={{
                              paddingLeft: 24,
                              margin: 0,
                              color: "inherit",
                              listStyleType: "disc", // <-- ensure bullets
                            }}
                          >
                            {product.features.map((feature, index) => (
                              <li
                                key={index}
                                style={{
                                  fontSize: 15,
                                  lineHeight: 1.43,
                                  marginBottom: 5,
                                  color: "inherit",
                                  listStyleType: "disc", // <-- ensure bullets for each li
                                }}
                              >
                                {feature}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Typography color="text.secondary" sx={{ textAlign: "left" }}>
                            No data available for features
                          </Typography>
                        )}
                      </AccordionDetails>
                    </StyledAccordion>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </ProductDetailsWrapper>

          {/* From The Manufacturer */}
          <Box sx={{ my: 4 }}>
            {/* <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600 }}>
              From The Manufacturer
            </Typography>
            <Box sx={{ mt: 2, borderRadius: 1, overflow: "hidden", boxShadow: "0 1px 2px 0 rgba(0,0,0,0.1)" }}>
              {product?.from_the_manufacture &&
              product.from_the_manufacture !== "N/A" &&
              !product.from_the_manufacture.startsWith("http://example.com") ? (
                <img
                  src={product.from_the_manufacture}
                  alt="Manufacturer"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              ) : (
                <img
                  src={fallbackImage}
                  alt="Fallback Manufacturer"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              )}
            </Box> */}
          </Box>

          {/* Extra engaging info section */}
          <EngagementsSection>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 3 }}>
              Why You'll Love This Product
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} sm={4}>
                <EngagementItem>
                  <LocalShippingIcon sx={{ color: flipkartTheme.palette.primary.main, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>
                      Fast Delivery
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Hassle-free shipping on all orders.
                    </Typography>
                  </Box>
                </EngagementItem>
              </Grid>
              <Grid item xs={12} sm={4}>
                <EngagementItem>
                  <WorkspacePremiumIcon sx={{ color: "#FFC107", fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>
                      Top-Tier Quality
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tested for superior performance and durability.
                    </Typography>
                  </Box>
                </EngagementItem>
              </Grid>
              <Grid item xs={12} sm={4}>
                <EngagementItem>
                  <VerifiedIcon sx={{ color: flipkartTheme.palette.primary.main, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>
                      Certified Authentic
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      100% genuine products from trusted brands.
                    </Typography>
                  </Box>
                </EngagementItem>
              </Grid>
            </Grid>
          </EngagementsSection>

          {/* Related Products Section */}
          <RelatedProductsSection>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                borderBottom: `1px solid ${flipkartTheme.palette.divider}`,
                pb: 1,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <LocalOfferIcon fontSize="medium" />
              Related Products
            </Typography>
            <Grid container spacing={2}>
              {RelatedProducts && RelatedProducts.length > 0 ? (
                RelatedProducts.map((relatedProduct) => (
                  <Grid item key={relatedProduct.id} xs={6} sm={4} md={3} lg={2.4}>
                    <RelatedProductCard onClick={() => handleProductClick(relatedProduct.id)}>
                      <CardMedia
                        component="img"
                        sx={{
                          width: 100,
                          height: 100,
                          objectFit: "contain",
                          mx: "auto",
                          my: 1,
                          pointerEvents: "none",
                        }}
                        image={
                          relatedProduct.logo &&
                          (relatedProduct.logo.startsWith("http://example.com") ||
                          !relatedProduct.logo.startsWith("http")
                            ? soonImg
                            : relatedProduct.logo)
                        }
                        alt={relatedProduct?.name}
                      />
                      <CardContent sx={{ p: 1, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <Tooltip title={relatedProduct.name} arrow>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: 14,
                              color: "text.primary",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              minHeight: 40,
                            }}
                          >
                            {relatedProduct.name}
                          </Typography>
                        </Tooltip>
                        <Box sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>
                          <Typography sx={{ fontSize: 12 }}>SKU: {relatedProduct.sku_number}</Typography>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: 15, color: flipkartTheme.palette.secondary.main }}>
                            {relatedProduct.currency}{relatedProduct.price}
                          </Typography>
                          <Typography
                            sx={{
                              textDecoration: "line-through",
                              fontSize: 12,
                              color: "text.disabled",
                            }}
                          >
                            {relatedProduct.was_price ? `${relatedProduct.currency}${relatedProduct.was_price}` : null}
                          </Typography>
                          {relatedProduct.discount && relatedProduct.discount !== "0%" && (
                            <Box
                              sx={{
                                color: flipkartTheme.palette.error.main,
                                fontWeight: 600,
                                fontSize: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <LocalOfferIcon fontSize="inherit" />
                              {relatedProduct.discount} OFF
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </RelatedProductCard>
                  </Grid>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", width: "100%", mt: 2 }}
                >
                  No related products found
                </Typography>
              )}
            </Grid>
          </RelatedProductsSection>
          <ToastContainer
            position="bottom-right"
            autoClose={2000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Box>
      </ProductContainer>
    </ThemeProvider>
  );
};

export default ProductDetail;