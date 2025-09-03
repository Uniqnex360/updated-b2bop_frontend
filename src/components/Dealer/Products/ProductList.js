
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  TextField,
  CircularProgress,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Stack,
  Pagination,
  Chip,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Autocomplete, // Import Autocomplete
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ViewList from "@mui/icons-material/ViewList";
import ViewModule from "@mui/icons-material/ViewModule";
import RefreshIcon from "@mui/icons-material/Refresh";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import soonImg from "../../assets/soon-img.png";
import ProductBrand from "./ProductBrands";
import PriceRangeFilter from "./PriceRangeFilter";
import ProductModal from "./ProductModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductList = ({ fetchCartCount }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const userData = localStorage.getItem("user");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState({});
  const [cartItems, setCartItems] = useState([]);
  const [sortByValue, setSortByValue] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [industryList, setIndustryList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [industry, setIndustry] = useState(null);
  const [Category, setCategory] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const [productsCount, setProductsCount] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const productsPerPage = 100;
  const [debounceTimerRef] = [useRef(null)];
  const [priceRange, setPriceRange] = useState({ price_from: 0, price_to: "" });
  const [noProductsFound, setNoProductsFound] = useState(false);
  const [priceClearFunction, setPriceClearFunction] = useState(null);

  const initialPage = parseInt(queryParams.get("page"), 10) || 1;
  const [page, setPage] = useState(initialPage);
  const [viewMode, setViewMode] = useState("card");
  const toggleView = (mode) => setViewMode(mode);

  // Faceted filter states
  const [selectedBrandNames, setSelectedBrandNames] = useState(() => {
    const saved = localStorage.getItem("selectBrandNew");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    if (selectedBrandNames.length > 0) {
      localStorage.setItem("selectBrandNew", JSON.stringify(selectedBrandNames));
    }
  }, [selectedBrandNames]);

  // Brand Ids
  const [selectedBrandIds, setSelectedBrandIds] = useState(() => {
    const savedIds = localStorage.getItem("selectedBrandIds");
    return savedIds ? JSON.parse(savedIds) : [];
  });
  useEffect(() => {
    localStorage.setItem("selectedBrandIds", JSON.stringify(selectedBrandIds));
  }, [selectedBrandIds]);

  // Industry
  const [industryIdFor, setIndustryIdFor] = useState(() => {
    const savedIndustryId = localStorage.getItem("industryId");
    if (savedIndustryId) {
      try {
        return JSON.parse(savedIndustryId);
      } catch (e) {
        return "";
      }
    }
    return "";
  });
  useEffect(() => {
    localStorage.setItem("industryId", JSON.stringify(industryIdFor));
  }, [industryIdFor]);
  useEffect(() => {
    if (industryIdFor) {
      setSelectedBrandNames([]);
      setSelectedBrandIds([]);
      localStorage.removeItem("selectBrandNew");
      localStorage.removeItem("selectedBrandIds");
    }
  }, [industryIdFor]);

  // Category
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const catSaved = localStorage.getItem("selectCategory");
    return catSaved ? JSON.parse(catSaved) : "All Categories";
  });
  useEffect(() => {
    localStorage.setItem("selectCategory", JSON.stringify(selectedCategory));
  }, [selectedCategory]);

  // Sidebar price clear
  const memoizedPriceClearFunction = useCallback(
    (func) => setPriceClearFunction(() => func),
    []
  );

  // Handle brand selection changes from ProductBrand
  const handleBrandChange = ({ updatedBrands }) => {
    setIndustryIdFor("");
    const ids = updatedBrands.map((brand) => brand.id);
    const names = updatedBrands.map((brand) => brand.name);
    setIndustry("");
    setSelectedBrandIds(ids);
    setSelectedBrandNames(names);
    setPage(1);
  };

  // Handle tag removal
  const handleTagRemove = (id) => {
    const updatedIds = selectedBrandIds.filter((brandId) => brandId !== id);
    const updatedNames = selectedBrandNames.filter(
      (_, index) => selectedBrandIds[index] !== id
    );
    setSelectedBrandIds(updatedIds);
    setSelectedBrandNames(updatedNames);
  };

  // Reload
  const handleReload = () => {
    localStorage.removeItem("industryId");
    localStorage.removeItem("selectBrandNew");
    localStorage.removeItem("selectedBrandIds");
    window.location.reload();
  };

  // Fetch Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedIndustry = localStorage.getItem("industryId");
        let industryId = "";
        if (savedIndustry) industryId = JSON.parse(savedIndustry);
        industryId = industry?.id || industryId;
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }
        const requestData = {
          manufacture_unit_id: manufactureUnitId,
          product_category_id: selectedCategoryId || "",
          industry_id: industry?.id || "",
          skip: (page - 1) * productsPerPage,
          limit: productsPerPage,
          sort_by: "price",
          sort_by_value: sortByValue,
          filters: "all",
          brand_id_list: selectedBrandIds,
          price_from: priceRange.price_from,
          price_to: priceRange.price_to,
        };
        const productResponse = await axios.post(
          `${process.env.REACT_APP_IP}obtainProductsListForDealer/`,
          requestData
        );
        const products = productResponse.data.data || [];
        setProducts(products);
        setNoProductsFound(products.length === 0);
      } catch (err) {
        setError("Failed to load items");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    sortByValue,
    selectedCategoryId,
    industry,
    page,
    selectedBrandIds,
    priceRange,
  ]);

  // Product count
  useEffect(() => {
    const productCountForDealer = async () => {
      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }
        const requestData = {
          manufacture_unit_id: manufactureUnitId,
          product_category_id: selectedCategoryId || "",
          industry_id: industry?.id || "",
          filters: "all",
          price_from: priceRange.price_from,
          price_to: priceRange.price_to,
          brand_id_list: selectedBrandIds || [],
        };
        const productCountForDealerResponse = await axios.post(
          `${process.env.REACT_APP_IP}productCountForDealer/`,
          requestData
        );
        const productCount = productCountForDealerResponse.data.data || 0;
        setProductsCount(productCount);
        setTotalPages(Math.ceil(productCount / productsPerPage));
      } catch (err) {
        setError("Failed to load items");
      } finally {
        setLoading(false);
      }
    };
    productCountForDealer();
  }, [selectedCategoryId, industry, selectedBrandIds, priceRange]);

  // Fetch industries
  useEffect(() => {
    const fetchIndustry = async () => {
      try {
        let manufactureUnitId = "";
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }
        const IndustryResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainIndustryForManufactureUnit/?manufacture_unit_id=${manufactureUnitId}`
        );
        setIndustryList(IndustryResponse.data.data || []);
      } catch (err) {}
    };
    fetchIndustry();
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      let manufactureUnitId = "";
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
      const categoryResponse = await axios.get(
        `${
          process.env.REACT_APP_IP
        }obtainProductCategoryListForDealer/?manufacture_unit_id=${manufactureUnitId}&industry_id=${
          industry ? industry.id : ""
        }`
      );
      setCategories(categoryResponse.data.data || []);
    } catch (err) {}
  };
  useEffect(() => {
    if (industry || industry === null) fetchCategories();
  }, [industry]);

  // Search
  useEffect(() => {
    if (location.state && location.state.searchQuery) {
      setSearchQuery(location.state.searchQuery);
    }
  }, [location.state]);
  useEffect(() => {
    if (searchQuery) handleSearch(searchQuery, sortByValue);
  }, [searchQuery, sortByValue]);

  // Debounced function to fetch suggestions from the API
  const fetchSuggestions = (query) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setSearchLoading(true);
    const newTimeout = setTimeout(async () => {
      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";
        let roleName = "";
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
          roleName = data.role_name;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_IP}productSuggestions/?search_query=${query}&role_name=${roleName}&manufacture_unit_id=${manufactureUnitId}&limit=10`
        );

        setSuggestions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500); // 500ms debounce delay
    setDebounceTimeout(newTimeout);
  };

  const handleSearchChange = (event, newInputValue) => {
    setSearchQuery(newInputValue);
    setSelectedCategoryId(null);
    setPage(1);

    if (newInputValue === null || newInputValue.length === 0) {
      setSuggestions([]);
      setSearchResults([]);
      window.location.reload();
    } else {
      fetchSuggestions(newInputValue);
    }
  };

  const handleSearch = async (query, sortByValue) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setError("");
    setSearchResults([]);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const { manufacture_unit_id, role_name } = userData;
      const response = await axios.post(
        `${process.env.REACT_APP_IP}productSearch/`,
        {
          search_query: normalizedQuery,
          manufacture_unit_id,
          role_name,
          skip: 1,
          limit: 100,
          sort_by: "price",
          sort_by_value: sortByValue,
          filters: "all",
        }
      );
      if (
        response.data.status &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        setSearchResults(response.data.data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setError("Failed to fetch search results.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Card actions
  const handleOpen = (product) => {
    setSelectedProduct(product);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedProduct(null);
  };
  const handleQuantityChange = (productId, newQuantity) => {
    setQuantity((prevQuantity) => ({
      ...prevQuantity,
      [productId]: Math.max(1, newQuantity),
    }));
  };
  const handleAddToCart = async (product, quantity) => {
    try {
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData);
      const userId = user.id;
      const existingItem = cartItems.find(
        (item) => item.product_id === product.id
      );
      if (existingItem) {
        const updatedCartItems = cartItems.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        setCartItems(updatedCartItems);
        await axios.post(
          `${process.env.REACT_APP_IP}createOrUpdateUserCartItem/`,
          {
            user_id: userId,
            product_id: product.id,
            quantity: existingItem.quantity + quantity,
            price: product.price,
          }
        );
        toast.success("Product quantity updated.");
      } else {
        const newCartItem = {
          product_id: product.id,
          quantity: quantity,
          price: product.price,
        };
        setCartItems([...cartItems, newCartItem]);
        await axios.post(
          `${process.env.REACT_APP_IP}createOrUpdateUserCartItem/`,
          {
            user_id: userId,
            product_id: product.id,
            quantity: quantity,
            price: product.price,
          }
        );
        toast.success("Product added successfully.");
      }
      fetchCartCount();
    } catch (error) {}
  };

  // Wishlist
  const addToWishlist = async (productId) => {
    const user = JSON.parse(userData);
    const userId = user.id;
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}createWishList/`,
        { user_id: userId, product_id: productId }
      );
      const updatedProducts = products.map((product) =>
        product.id === productId
          ? {
              ...product,
              is_wishlist: true,
              wishlist_id: response.data.data.wishlist_id || null,
            }
          : product
      );
      setProducts(updatedProducts);
    } catch (err) {}
  };
  const removeFromWishlist = async (wishlistId, productId) => {
    try {
      await axios.get(`${process.env.REACT_APP_IP}deleteWishlist/`, {
        params: { wish_list_id: wishlistId },
      });
      const updatedProducts = products.map((product) =>
        product.id === productId
          ? { ...product, is_wishlist: false, wishlist_id: null }
          : product
      );
      setProducts(updatedProducts);
    } catch (err) {}
  };

  // A helper function to render the highlighted text
  const renderHighlightedText = (text, highlight) => {
    if (!highlight) {
      return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, "gi"));
    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} style={{ color: "#2874f0", fontWeight: "bold" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Grid container spacing={2}>
        {/* Sidebar */}
        <Grid item xs={12} md={2}>
          <Box
            sx={{
              position: "sticky",
              top: "56px",
              height: "calc(100vh - 56px)",
              overflowY: "auto",
              boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.1)",
              padding: "18px 12px 18px 0px",
              backgroundColor: "white",
              minHeight: "100vh",
            }}
          >
            {/* Removed static brand images and associated display logic */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Filter by Brand
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {selectedBrandNames.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No brands selected.
                    </Typography>
                  ) : (
                    selectedBrandNames.map((name, idx) => (
                      <Box
                        key={name}
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Chip
                          label={name}
                          onDelete={() => handleTagRemove(selectedBrandIds[idx])}
                          size="small"
                          sx={{
                            backgroundColor: "#e3f2fd",
                            fontSize: "12px",
                          }}
                        />
                      </Box>
                    ))
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
            <Divider sx={{ my: 2 }} />
            <ProductBrand
              industryId={industry?.id}
              onBrandChange={handleBrandChange}
              selectedCategoryId={selectedCategoryId}
              selectedBrandsProp={selectedBrandIds}
            />
            <PriceRangeFilter
              onPriceChange={setPriceRange}
              PriceClear={memoizedPriceClearFunction}
            />
          </Box>
        </Grid>
        {/* Main Content */}
        <Grid item xs={12} md={10} p={0}>
          <Box sx={{ marginBottom: "25px", minWidth: "800px" }}>
            {/* Sticky Header */}
            <Box
              sx={{
                backgroundColor: "white",
                position: "sticky",
                top: "55px",
                padding: "10px 15px",
                zIndex: 9,
                borderBottom: "1px solid #f0f0f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                gap={1}
              >
                {/* AUTOSUGGESTION BAR */}
                <Autocomplete
                  id="product-search-bar"
                  size="small"
                  freeSolo
                  options={suggestions}
                  getOptionLabel={(option) => option.product_name || ""}
                  filterOptions={(x) => x}
                  onInputChange={handleSearchChange}
                  onChange={(event, value) => {
                    if (value) {
                      navigate(`/dealer/products/${value.id}`);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search products..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon
                              sx={{
                                fontSize: "20px",
                                color: "action.active",
                              }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {searchLoading && (
                              <CircularProgress color="inherit" size={20} />
                            )}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                        style: { fontSize: "14px" },
                      }}
                      sx={{
                        width: 250,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "4px",
                          fontSize: "14px",
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      {renderHighlightedText(
                        option.product_name,
                        searchQuery
                      )}
                    </Box>
                  )}
                />
                {/* END OF AUTOSUGGESTION BAR */}

                <Tooltip title="Refresh">
                  <IconButton onClick={handleReload} sx={{ p: 1 }}>
                    <RefreshIcon
                      sx={{ fontSize: "24px", color: "action.active" }}
                    />
                  </IconButton>
                </Tooltip>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    ml: 2,
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                  }}
                >
                  <Typography variant="body2">
                    Total Products:{" "}
                    <strong>
                      {searchQuery ? searchResults.length : productsCount}
                    </strong>
                  </Typography>
                  <IconButton
                    onClick={() => toggleView("list")}
                    color={viewMode === "list" ? "primary" : "default"}
                    sx={{ ml: 1 }}
                  >
                    <ViewList />
                  </IconButton>
                  <IconButton
                    onClick={() => toggleView("card")}
                    color={viewMode === "card" ? "primary" : "default"}
                  >
                    <ViewModule />
                  </IconButton>
                </Box>
              </Box>
              {/* Filter Chips */}
              {selectedBrandNames.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 2,
                    pt: 1,
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  {selectedBrandNames.map((name, index) => (
                    <Chip
                      key={selectedBrandIds[index]}
                      label={`Brand: ${name}`}
                      onDelete={() =>
                        handleTagRemove(selectedBrandIds[index])
                      }
                      size="small"
                      sx={{
                        backgroundColor: "#bbdefb",
                        fontSize: "12px",
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
            {/* Product Table or Card */}
            {noProductsFound ? (
              <Typography
                variant="h6"
                color="text.secondary"
                align="center"
                justifyContent={"center"}
              >
                No products found
              </Typography>
            ) : searchLoading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
              >
                <CircularProgress />
              </Box>
            ) : searchQuery && searchResults.length === 0 ? (
              <Typography
                variant="h6"
                color="text.secondary"
                align="center"
                justifyContent={"center"}
              >
                No products found for "{searchQuery}"
              </Typography>
            ) : error ? (
              <Typography variant="h6" color="error" align="center">
                {error}
              </Typography>
            ) : viewMode === "list" ? (
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: 2,
                  boxShadow: 2,
                  mt: 2,
                  maxHeight: "calc(100vh - 250px)",
                  overflow: "auto",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ background: "#f7fafc" }}>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#050505", fontFamily: 'Roboto' }}>Image</TableCell>
                      <TableCell align="left" sx={{ fontWeight: 700, color: "#050505", fontFamily: 'Roboto' }}>MPN</TableCell>
                      <TableCell align="left" sx={{ fontWeight: 700, color: "#050505", fontFamily: 'Roboto' }}>Product Name</TableCell>
                      <TableCell align="left" sx={{ fontWeight: 700, color: "#050505", fontFamily: 'Roboto' }}>Brand</TableCell>
                      <TableCell align="left" sx={{ fontWeight: 700, color: "#050505", fontFamily: 'Roboto' }}>Category</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#050505", fontFamily: 'Roboto' }}>Price</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#050505", fontFamily: 'Roboto' }}>Availability</TableCell>
                      {/* <<< MODIFICATION: ADDED ACTIONS HEADER >>> */}
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#050505", fontFamily: 'Roboto', minWidth: '160px' }}>Quantity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(searchQuery ? searchResults : products).map((product) => (
                      <TableRow
                        key={product.id}
                        hover
                        sx={{
                          transition: "background 0.2s",
                          "&:hover": { background: "#e3f0fd" },
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          navigate(
                            `/dealer/products/${product.id}?page=${page}`,
                            {
                              state: {
                                searchQuery,
                                industry,
                                category: Category,
                              },
                            }
                          )
                        }
                      >
                        <TableCell align="center" sx={{ fontWeight: 500 }}>
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <img
                              src={
                                product.logo &&
                                (product.logo.startsWith("http://example.com")
                                  ? soonImg
                                  : product.logo.startsWith("http") ||
                                    product.logo.startsWith("https")
                                  ? product.logo
                                  : soonImg)
                              }
                              alt={product.name}
                              style={{
                                width: 44,
                                height: 44,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "1px solid #e3e6ef",
                                background: "#fff",
                              }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="left" sx={{ fontWeight: 500, fontFamily: 'Roboto' }}>{product.mpn}</TableCell>
                        <TableCell align="left" sx={{ fontWeight: 500, color: "#212121", fontFamily: 'Roboto' }}>{product.name}</TableCell>
                        <TableCell align="left" sx={{ color: "#555", fontFamily: 'Roboto' }}>{product.brand_name}</TableCell>
                        <TableCell align="left" sx={{ color: "#555", fontFamily: 'Roboto' }}>{product.end_level_category}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, color: "#2874f0", fontFamily: 'Roboto' }}>
                          {product.price ? `${product.currency}${product.price.toFixed(2)}` : "N/A"}
                        </TableCell>
                        <TableCell align="center">
                          <span
                            style={{
                              fontFamily: 'Roboto',
                              color: product.availability ? "#388e3c" : "#d32f2f",
                              fontWeight: 600,
                            }}
                          >
                            {product.availability ? "In Stock" : "Out of Stock"}
                          </span>
                        </TableCell>
                        {/* <<< MODIFICATION: ADDED ACTIONS CELL WITH QUANTITY AND ADD TO CART >>> */}
                        <TableCell align="center">
                           <Stack direction="row" spacing={1} alignItems="center" onClick={(e) => e.stopPropagation()}>
                                <TextField
                                  type="number"
                                  variant="outlined"
                                  size="small"
                                  value={quantity[product.id] || 1}
                                  onChange={(e) => {
                                      e.stopPropagation();
                                      handleQuantityChange(product.id, parseInt(e.target.value) || 1);
                                  }}
                                  inputProps={{
                                      min: 1,
                                      style: { padding: "4px 6px", fontSize: "14px", width: 40, height: 24, },
                                  }}
                                  sx={{ width: 60 }}
                                />
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  sx={{
                                      textTransform: "none",
                                      boxShadow: "none",
                                      height: 32,
                                  }}
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddToCart(product, quantity[product.id] || 1);
                                  }}
                                  startIcon={<ShoppingCartOutlinedIcon sx={{ fontSize: '16px' }} />}
                                >
                                  Add
                                </Button>
                           </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ width: "100%", mt: 2 }}>
                <Grid container spacing={2}>
                  {(searchQuery ? searchResults : products).map(
                    (product, idx) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        lg={2.4}
                        xl={2}
                        key={product.id}
                      >
                        <Card
                          sx={{
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
                            height: "100%",
                            maxWidth: 220,
                            margin: "0 auto",
                          }}
                          onClick={() =>
                            navigate(
                              `/dealer/products/${product.id}?page=${page}`,
                              {
                                state: {
                                  searchQuery,
                                  industry,
                                  category: Category,
                                },
                              }
                            )
                          }
                        >
                          <Box sx={{ position: "relative", p: 1, pb: 0 }}>
                            <CardMedia
                              component="img"
                              height="120"
                              image={
                                product.logo &&
                                (product.logo.startsWith("http://example.com")
                                  ? soonImg
                                  : product.logo.startsWith("http") ||
                                    product.logo.startsWith("https")
                                  ? product.logo
                                  : soonImg)
                              }
                              alt={product.name || "Product Image"}
                              sx={{
                                objectFit: "contain",
                                borderRadius: 1,
                                background: "#f8f8f8",
                                border: "1px solid #f0f0f0",
                                height: 120,
                              }}
                            />
                            {product.discount > 0 && (
                              <Chip
                                label={`${product.discount}% OFF`}
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  left: 8,
                                  bgcolor: "#d32f2f",
                                  color: "#fff",
                                  fontWeight: 600,
                                  fontSize: "10px",
                                  px: 0.5,
                                  zIndex: 2,
                                  height: 20,
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
                              p: 1.5,
                              pt: 0.5,
                              "&:last-child": {
                                paddingBottom: 1.5,
                              },
                            }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 500,
                                  color: "#212121",
                                  lineHeight: "18px",
                                  mb: 0.5,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                  fontSize: "0.85rem",
                                }}
                              >
                                {product.name}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "10px",
                                  color: "#878787",
                                  mb: 0.5,
                                }}
                              >
                                Brand: {product.brand_name || "-"}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "10px",
                                  color: "#878787",
                                  mb: 0.5,
                                }}
                              >
                                MPN: {product.mpn}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "10px",
                                  color: "#878787",
                                  mb: 0.5,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 1,
                                }}
                              >
                                Category: {product.end_level_category || "-"}
                              </Typography>
                              <Typography
                                sx={{
                                  mt: 0.5,
                                  fontSize: "10px",
                                  color: product.availability
                                    ? "#388e3c"
                                    : "#d32f2f",
                                }}
                              >
                                {product.availability
                                  ? "In Stock"
                                  : "Out of Stock"}
                              </Typography>
                              
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "baseline",
                                  mt: 1,
                                  mb: 1,
                                }}
                              >
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: "#212121",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                  }}
                                >
                                  {product.price
                                    ? `${
                                        product.currency || ""
                                      }${product.price.toFixed(2)}`
                                    : "N/A"}
                                </Typography>
                                {product.discount > 0 && product.price && (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: "#878787",
                                      textDecoration: "line-through",
                                      ml: 1,
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {`${product.currency || ""}${(
                                      product.price /
                                      (1 - product.discount / 100)
                                    ).toFixed(2)}`}
                                  </Typography>
                                )}
                              </Box>

                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                mt: 'auto',
                              }}
                            >
                              <TextField
                                type="number"
                                variant="outlined"
                                size="small"
                                value={quantity[product.id] || 1}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(
                                    product.id,
                                    parseInt(e.target.value) || 1
                                  );
                                }}
                                inputProps={{
                                  min: 1,
                                  style: {
                                    padding: "2px 4px",
                                    fontSize: "12px",
                                    width: 40,
                                    height: 24,
                                  },
                                }}
                                sx={{ width: 50, mr: 0.5 }}
                              />
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  textTransform: "none",
                                  borderRadius: 1,
                                  boxShadow: "none",
                                  minWidth: 0,
                                  px: 1,
                                  fontSize: "0.7rem",
                                  height: 24,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(
                                    product,
                                    quantity[product.id] || 1
                                  );
                                }}
                                startIcon={
                                  <ShoppingCartOutlinedIcon
                                    sx={{ fontSize: "14px" }}
                                  />
                                }
                              >
                                Add
                              </Button>
                              <Tooltip
                                title={
                                  product.is_wishlist
                                    ? "Remove from Wishlist"
                                    : "Add to Wishlist"
                                }
                              >
                                <IconButton
                                  sx={{
                                    color: product.is_wishlist
                                      ? "#f2419b"
                                      : "#2874f0",
                                    padding: 0.5,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (product.is_wishlist) {
                                      removeFromWishlist(
                                        product.wishlist_id,
                                        product.id
                                      );
                                    } else {
                                      addToWishlist(product.id);
                                    }
                                  }}
                                >
                                  {product.is_wishlist ? (
                                    <FavoriteIcon sx={{ fontSize: "18px" }} />
                                  ) : (
                                    <FavoriteBorderIcon
                                      sx={{ fontSize: "18px" }}
                                    />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  )}
                </Grid>
              </Box>
            )}
            {/* Pagination */}
            <Stack
              spacing={2}
              sx={{ mt: 3, justifyContent: "center", alignItems: "center" }}
            >
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Stack>
            <ToastContainer
              position="bottom-right"
              autoClose={1000}
              hideProgressBar
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            <ProductModal
              open={open}
              onClose={handleClose}
              product={selectedProduct}
              handleAddToCart={handleAddToCart}
            />
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default ProductList;
