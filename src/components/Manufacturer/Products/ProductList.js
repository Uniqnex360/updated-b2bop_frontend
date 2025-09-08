// src\components\Manufacturer\Products\ProductList.js
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  Box,
  MenuItem,
  Select,
  FormControl,
  Checkbox,
  Button,
  Snackbar,
  Alert,
  TablePagination,
  Tooltip,
  Menu,
  Grid,
  Typography,
  Card,
  Modal,
  CardContent,
  Pagination,
  Autocomplete, // Import Autocomplete
} from "@mui/material";
import Chip from '@mui/material/Chip';
import CloseIcon from "@mui/icons-material/Close";

import {
  Visibility,
  VisibilityOff,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ViewList from "@mui/icons-material/ViewList";
import ViewModule from "@mui/icons-material/ViewModule";
import PopupModal from "./PopupModel";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS file
import { ToastContainer, toast } from "react-toastify";
import soonImg from "../../assets/soon-img.png";
import ProductBrand from "./ProductBrands";
import PriceRangeFilter from './PriceRangeFilter';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear'; // Make sure to import this
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from '@mui/icons-material/Edit';

function ProductList() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openSnackbarforreset, setOpenSnackbarforreset] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filter, setFilter] = useState("");
  const [categories, setCategories] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [editedVisibility, setEditedVisibility] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filters, setFilters] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentColumn, setCurrentColumn] = useState("");
  const [open, setOpen] = useState(false); // Track the dropdown open state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [isBulkEditing, setIsBulkEditing] = useState(false); // State for Bulk Edit mode
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filteredItems, setFilteredItems] = useState([]);
  const [discountUnit, setDiscountUnit] = useState("%");
  const [data, setCategorySearch] = useState([]); // Initialize data state
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isSomeSelected, setIsSomeSelected] = useState(false);
  const searchTimeout = useRef(null);
  const [industryList, setIndustryList] = useState([]); // Stores all available industries
  const [industry, setIndustry] = useState(null);
  const [value, setValue] = useState(-1);
  const [selectedParent, setSelectedParent] = useState(""); // Selected parent category ID
  const [childCategories, setChildCategories] = useState([]); // Child categories
  const [selectedChild, setSelectedChild] = useState(""); // Selected child category ID
  const [priceRange, setPriceRange] = useState({ price_from: 0, price_to: '' });
  const [noProductsFound, setNoProductsFound] = useState(false); // No products found state
  const [priceClearFunction, setPriceClearFunction] = useState(null);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);
  const [CategoriesTag, setSelectedCategoryChild] = useState(''); // Selected child category ID
  const [CategoriesparentTag, setSelectedCategoryParent] = useState(""); // Selected child category ID
  const [IndustryTag, setSelectedIndustryName] = useState(''); // Selected child category ID
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedparentfull, setSelectedParentFull] = useState();
  const [CategoriesTagApply, setSelectedCategoryChildApply] = useState(''); // Selected child category ID
  const [CategoriesparentTagApply, setSelectedCategoryParentApply] = useState(""); // Selected child category ID
  const [IndustryTagApply, setSelectedIndustryNameApply] = useState('');
  const initialPage = parseInt(queryParams.get('page'), 10) || 0; // Default to 0 if no page param exists
  const [page, setPage] = useState(initialPage);

  const userData = localStorage.getItem("user");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'card'
  const toggleView = (mode) => {
    setViewMode(mode);
  };

  // New states for autosuggestion
  const [suggestions, setSuggestions] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const [industryIdFor, setIndustryIdFor] = useState(() => {
    const savedIndustryId = localStorage.getItem("industryId");
    if (savedIndustryId) {
      try {
        return JSON.parse(savedIndustryId);
      } catch (e) {
        console.error("Error parsing industryId from localStorage:", e);
        return "";
      }
    }
    return "";
  });

  useEffect(() => {
    console.log("IndustryIdFor:", industryIdFor);
    console.log(industry, 'industry');
    localStorage.setItem("industryId", JSON.stringify(industryIdFor));
  }, [industryIdFor]);

  const [selectedBrandNames, setSelectedBrandNames] = useState(() => {
    const saved = localStorage.getItem("selectBrandNew");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedBrandApplyNames, setSelectedBrandApplyNames] = useState([]);

  useEffect(() => {
    if (selectedBrandNames.length > 0) {
      localStorage.setItem('selectBrandNew', JSON.stringify(selectedBrandNames));
    } else {
      localStorage.removeItem('selectBrandNew');
    }
  }, [selectedBrandNames]);

  const [selectedBrandIds, setSelectedBrandIds] = useState(() => {
    const savedIds = localStorage.getItem('selectedBrandIds');
    return savedIds ? JSON.parse(savedIds) : [];
  });

  useEffect(() => {
    if (selectedBrandIds.length > 0) {
      localStorage.setItem('selectedBrandIds', JSON.stringify(selectedBrandIds));
    } else {
      localStorage.removeItem('selectedBrandIds');
    }
  }, [selectedBrandIds]);

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const catSaved = localStorage.getItem('selectCategory');
    return catSaved ? JSON.parse(catSaved) : "All Categories";
  });

  useEffect(() => {
    console.log(selectedParent, 'selectedParent');
    console.log(selectedChild, 'selectedChild');
    console.log(selectedparentfull, 'selectedparentfull');
  }, [selectedChild, selectedParent, selectedparentfull]);

  useEffect(() => {
    if (selectedCategory !== "All Categories") {
      localStorage.setItem('selectCategory', JSON.stringify(selectedCategory));
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (industryIdFor || selectedCategory) {
      setSelectedBrandNames([]);
      setSelectedBrandIds([]);
    }
  }, [industryIdFor]);

  const handleReload = () => {
    setOpenSnackbarforreset(true);
    setSelectedBrandNames([]);
    setSelectedBrandIds([]);
    setSelectedCategoryChildApply('');
    setSelectedCategoryParentApply('');
    setSelectedIndustryNameApply('');
    setSelectedBrandApplyNames([]);
    localStorage.removeItem("selectBrandNew");
    localStorage.removeItem("selectedBrandIds");
    localStorage.removeItem("dealerBrand")
    setIndustry('')
    setPriceRange({ price_from: 0, price_to: '' });
    localStorage.removeItem("industryId")
    window.location.reload();
  };

  const handleClearAll = () => {
    setSelectedBrandIds([]);

    if (searchTerm) {
      setSearchTerm("");
    } else {
      setSelectedCategory("");
      setSelectedParent("");
      setSelectedChild("");
      setIndustry(null);
      refreshData();
    }
    setFilteredItems(items);
    setPage(0);

    navigate(location.pathname, {
      replace: true,
      state: {
        ...location.state,
        searchQuery: "",
      },
    });
  };

  const refreshData = async () => {
    try {
      const userData = localStorage.getItem("user");
      let manufactureUnitId = "";
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
      );
      setCategories(categoryResponse.data.data || []);
    } catch (error) { }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const fetchData = async (
    filters = "all",
    selectedCategory = null,
    industry = null,
    updatedIds,
  ) => {
    console.log("Selected Brand IDs inside fetchData:", selectedBrandIds);
    const savedIndustry = localStorage.getItem('industryId');
    let industryId = "";
    console.log(savedIndustry, 'savedIndustry');
    if (savedIndustry) {
      industryId = JSON.parse(savedIndustry);
      industryId = industry?.id || industryId;
    }
    const categoryId = selectedCategory?.id || "";
    const isParent = selectedCategory?.is_parent || false;
    setLoading(true);
    setError("");
    try {
      const userData = localStorage.getItem("user");
      let manufactureUnitId = "";
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
      const payload = {
        manufacture_unit_id: manufactureUnitId,
        product_category_id: categoryId,
        industry_id: industryId ? industryId : '',
        filters: filters,
        sort_by: sortConfig.key,
        sort_by_value: sortConfig.direction === "asc" ? 1 : -1,
        is_parent: isParent,
        price_from: priceRange.price_from,
        price_to: priceRange.price_to,
        brand_id_list: updatedIds
      };
      console.log("Payload being sent to server:", payload);
      const response = await axios.post(
        `${process.env.REACT_APP_IP}obtainProductsList/`,
        payload
      );
      console.log("Response from server:", response);
      const products = response.data.data || [];
      setItems(products);
      setFilteredItems(products);
    } catch (err) {
      setError("Failed to load items");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandChange = ({ updatedBrands }) => {
    setPage(0);
    const ids = updatedBrands.map((brand) => brand.id);
    const names = updatedBrands.map((brand) => brand.name);
    setSelectedBrandIds(ids);
    setSelectedBrandNames(names);
    fetchData(filters, selectedCategory, industry, ids);
  };

  const handleTagRemove = (id) => {
    const updatedIds = selectedBrandIds.filter((brandId) => brandId !== id);
    const updatedNames = selectedBrandNames.filter(
      (_, index) => selectedBrandIds[index] !== id
    );
    console.log(updatedNames, 'updatedNames');
    console.log(updatedIds, 'updatedIds');
    setSelectedBrandIds(updatedIds);
    setSelectedBrandNames(updatedNames);
    fetchData(filters, selectedCategory, industry, updatedIds);
  };

  const handleCategoryTagRemove = () => {
    setSelectedCategoryChild('');
    setSelectedChild('');
    fetchData(filters, selectedparentfull, industry, selectedBrandIds);
  };

  const handleCategoryTagparentRemove = () => {
    setSelectedCategoryParent('');
    setSelectedCategoryChild('');
    setSelectedChild('');
    setSelectedParent('');
    fetchData(filters, null, industry, selectedBrandIds);
  };

  const handleIndustryTagRemove = () => {
    setSelectedIndustryName('');
    setIndustryIdFor('');
    localStorage.removeItem("industryId");
    fetchData(filters, selectedCategory, null, selectedBrandIds);
  }

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
      } catch (err) {
        console.error("Error fetching Industry:", err);
      }
    };
    fetchIndustry();
  }, [userData]);

  const handleIndustryChange = (event) => {
    if (priceClearFunction) {
      priceClearFunction();
    }
    setValue(-1);
    const selectedIndustryId = event.target.value;
    const selectedIndustry = industryList.find(
      (item) => item.id === selectedIndustryId
    );
    setIndustryIdFor(selectedIndustryId);
    localStorage.setItem('industryId', JSON.stringify(selectedIndustryId));
    setSelectedIndustryName(selectedIndustry?.name);
    setIndustry(selectedIndustry);
    setSelectedBrandIds([]);
    refreshData(selectedIndustryId);
    setSelectedCategory(null);
    setSelectedParent("");
    setSelectedChild("");
    setSelectedBrandNames([]);
    setPriceRange({ minPrice: "", maxPrice: "" });
  };


  const getValidationMessage = (wasPrice, price) => {
    if (Number(price) > Number(wasPrice)) {
      return "Price cannot be greater than Was Price";
    }
    return "";
  };

  useEffect(() => {
    if (location.state && location.state.searchQuery) {
      setSearchTerm(location.state.searchQuery);
    }
  }, [location.state]);

  useEffect(() => {
    console.log("Updated searchTerm:", searchTerm);
    if (searchTerm) {
      handleSearchChange({ target: { value: searchTerm } });
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }
        if (priceClearFunction) {
          priceClearFunction();
        }
        const categoryResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
        );
        const parentCategories = categoryResponse.data.data.filter(
          (category) => category.is_parent
        );
        setCategories(parentCategories);
        setPriceRange({ minPrice: "", maxPrice: "" });
        await fetchData();
      } catch (error) { }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchChildCategories = async () => {
      if (priceClearFunction) {
        priceClearFunction();
      }
      if (!selectedParent) {
        setChildCategories([]);
        return;
      }
      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }
        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}&product_category_id=${selectedParent}&is_parent=true`
        );
        setChildCategories(response.data.data || []);
        setSelectedBrandIds([]);
        setSelectedBrandNames([]);
        setPriceRange({ minPrice: "", maxPrice: "" });
      } catch (error) {
        console.error("Error fetching child categories:", error);
      }
    };
    fetchChildCategories();
  }, [selectedParent]);

  const handleOpenBulkEdit = async () => {
    if (selectedCategory && !searchTerm) {
      setSelectedCategory("All Categories");
      const userData = localStorage.getItem("user");
      let manufactureUnitId = "";
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
      );
      if (categoryResponse.data) {
        console.log("iiii", categoryResponse.data);
        setCategories(categoryResponse.data.data || []);
        fetchData();
      }
    }
    setIsBulkEditing(!isBulkEditing);
    if (!isBulkEditing) {
      setSelectedItems(new Set());
      setIsAllSelected(false);
      setIsSomeSelected(false);
    } else {
      setDiscountValue("");
      if (searchTerm) {
        try {
          const userData = localStorage.getItem("user");
          let manufactureUnitId = "";
          if (userData) {
            const data = JSON.parse(userData);
            manufactureUnitId = data.manufacture_unit_id;
          }
          const response = await axios.post(
            `${process.env.REACT_APP_IP}productSearch/`,
            {
              manufacture_unit_id: manufactureUnitId,
              search_query: searchTerm,
            }
          );
          const result = response.data.data || [];
          setFilteredItems(result);
          setPage(0);
        } catch (error) {
          console.error("Error searching products:", error);
        }
      }
    }
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  // Re-written handleSearchChange to work with Autocomplete
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchTerm(query);
    
    if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
    }

    if (query.length === 0) {
        fetchData(); // Fetch all data when search is cleared
        return;
    }

    // Search for items locally when the user types
    const filtered = items.filter(item =>
        item.product_name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
    setPage(0);
  };

  // Debounced function to fetch suggestions from the API
  const fetchSuggestions = (query) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const newTimeout = setTimeout(async () => {
      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_IP}productSuggestions/?search_query=${query}&role_name=super_admin&manufacture_unit_id=${manufactureUnitId}&limit=10`
        );

        setSuggestions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce delay
    setDebounceTimeout(newTimeout);
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
  };

  const handleSearchBlur = () => {
    if (searchTerm.trim() === "") {
      setIsSearchOpen(false);
      setSelectedCategory("All Categories");
    }
  };

  const handleOpenMenu = (event, column) => {
    setAnchorEl(event.currentTarget);
    setCurrentColumn(column);
  };

  const handleFilterChange = async (event) => {
    const selectedCategory = event.target.value;
    setFilter(selectedCategory);
    await fetchData(selectedCategory);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems(new Set());
      setIsAllSelected(false);
      setIsSomeSelected(false);
    } else {
      const allItemIds = new Set(filteredItems.map((item) => item.id));
      setSelectedItems(allItemIds);
      setIsAllSelected(true);
      setIsSomeSelected(false);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      setIsAllSelected(updated.size === filteredItems.length);
      setIsSomeSelected(
        updated.size > 0 && updated.size < filteredItems.length
      );
      return updated;
    });
  };

  const handleFieldChange = (id, field, value) => {
    setEditedValues((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleToggleVisibility = (id) => {
    setEditedVisibility((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectSort = (key, direction) => {
    console.log('army', key, direction)
    setSortConfig({ key, direction });
    setPage(0);
    setAnchorEl(null);
  };

  const handleSelectAvailability = (status) => {
    setFilters(status);
    fetchData(status);
    setAnchorEl(null);
  };

  const handleBulkEditSubmit = async (key, direction) => {
    try {
      const hasError = Array.from(selectedItems).some((id) => {
        const editedFields = editedValues[id] || {};
        const originalItem = items.find((item) => item.id === id) || {};
        const wasPrice = Number(
          editedFields.was_price ?? originalItem.was_price ?? 0
        );
        const price = Number(editedFields.price ?? originalItem.price ?? 0);
        return price > wasPrice;
      });

      if (hasError) {
        setIsBulkEditing(!isBulkEditing);
        toast.error("Price is Greater than Was Price.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const productList = Array.from(selectedItems)
        .map((id) => {
          const editedFields = editedValues[id] || {};
          const originalItem = items.find((item) => item.id === id) || {};
          const updatedItem = { id };
          if (discountValue) {
            if (discountUnit === "%") {
              updatedItem.discount_percentage = Number(discountValue);
            } else if (discountUnit === "$") {
              updatedItem.discount_price = Number(discountValue);
            }
          }
          updatedItem.list_price =
            editedFields.price !== undefined && editedFields.price !== ""
              ? Number(editedFields.price)
              : Number(originalItem.price ?? 0);
          updatedItem.was_price =
            editedFields.was_price !== undefined &&
              editedFields.was_price !== ""
              ? Number(editedFields.was_price)
              : Number(originalItem.was_price ?? 0);
          updatedItem.msrp =
            editedFields.msrp !== undefined && editedFields.msrp !== ""
              ? Number(editedFields.msrp)
              : Number(originalItem.msrp ?? 0);
          const visibility = direction === "asc" ? true : direction === "desc" ? false : "";
          console.log('Visibility', visibility);
          updatedItem.visible = visibility ? visibility : originalItem.visible;
          return Object.keys(updatedItem).length > 1 ? updatedItem : null;
        })
        .filter((item) => item !== null);

      if (productList.length === 0 && !discountValue) {
        toast.info("No changes were made.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_IP}updateBulkProduct/`,
        {
          ...(discountUnit === "%" && discountValue
            ? { discount_percentage: Number(discountValue) }
            : {}),
          ...(discountUnit === "$" && discountValue
            ? { discount_price: Number(discountValue) }
            : {}),
          product_list: productList,
        }
      );

      if (response.data.data.is_updated === true) {
        console.log("Bulk edit successful, updating product list");
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }
        const payload = {
          manufacture_unit_id: manufactureUnitId,
          product_category_id: "",
          filters: "all",
          sort_by: "",
          sort_by_value: "",
          is_parent: "",
        };
        const productListResponse = await axios.post(
          `${process.env.REACT_APP_IP}obtainProductsList/`,
          payload
        );
        const products = productListResponse.data.data || [];
        setItems(products);
        setFilteredItems(products);
        if (searchTerm) {
          const searchResponse = await axios.post(
            `${process.env.REACT_APP_IP}productSearch/`,
            {
              manufacture_unit_id: manufactureUnitId,
              search_query: searchTerm,
            }
          );
          const searchResults = searchResponse.data.data || [];
          const matchedItems = products.filter((product) =>
            searchResults.some((searchItem) => searchItem.id === product.id)
          );
          setFilteredItems(matchedItems);
        }
      }
      setSelectedItems(new Set());
      setIsAllSelected(false);
      setIsSomeSelected(false);
    } catch (err) {
      setError("Failed to update products");
      console.error("Error during bulk edit:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountValueChange = (e) => {
    const { value } = e.target;
    setDiscountValue(value);
  };

  const handleDiscountUnitChange = (e) => {
    setDiscountUnit(e.target.value);
  };

  const handleSelectVisible = (key, direction) => {
    console.log('Selected Items:', selectedItems, items);
    const updatedItems = items.map((item) => {
      if (selectedItems.has(item.id)) {
        if (direction === "visibleOff" && item.visible) {
          return { ...item, visible: false };
        }
        if (direction === "visibleOn" && !item.visible) {
          return { ...item, visible: true };
        }
      }
      return item;
    });
    setItems(updatedItems);
    const updatedVisibility = { ...editedVisibility };
    selectedItems.forEach(id => {
      updatedVisibility[id] = direction === "visibleOff" ? false : true;
    });
    setEditedVisibility(updatedVisibility);
    setPage(0);
    setAnchorEl(null);
  };

  const handlePriceChange = (newRange) => {
    setPriceRange(newRange);
  };

  const handleOpenFilter = () => setFilterOpen(true);
  const handleCloseFilter = () => setFilterOpen(false);

const hasMounted = useRef(false);

// ✅ Keep this effect to sync the filters
useEffect(() => {
  const applyFilters = () => {
    fetchData(filters, selectedCategory, industry, selectedBrandIds);
    setSelectedCategoryChildApply(CategoriesTag);
    setSelectedCategoryParentApply(CategoriesparentTag);
    setSelectedIndustryNameApply(IndustryTag);
    setSelectedBrandApplyNames(selectedBrandNames);
  };

  const timeout = setTimeout(() => {
    applyFilters();
    hasMounted.current = true; // ✅ Moved alone here
  }, 500);

  return () => clearTimeout(timeout);
}, [selectedCategory, industry, selectedBrandIds, priceRange, filters]);

// ✅ Separate effect for showing filter toast AFTER mount
useEffect(() => {
  if (!hasMounted.current) return;

  // If filters applied
  const filtersChanged = (
    (selectedCategory && selectedCategory !== "All Categories") ||
    industryIdFor ||
    selectedBrandIds.length > 0 ||
    priceRange.price_from !== 0 ||
    priceRange.price_to !== ''
  );

  if (filtersChanged) {
    console.log("✅ Showing snackbar because filters changed");
    setOpenSnackbar(true);
  }
}, [selectedCategory, industryIdFor, selectedBrandIds, priceRange]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);

  if (error) return <div>{error}</div>;

  return (
    <div>
      <Grid container spacing={1}>
        <Grid item xs={12} md={3} lg={2}>
          <Box
            sx={{
              position: { xs: "static", md: "sticky" },
              top: { xs: "auto", md: "56px" },
              height: {
                xs: "auto",
                md: "calc(100vh - 56px)"
              },
              overflowY: { xs: "visible", md: "auto" },
              overflowX: "hidden",
              boxShadow: {
                xs: "0px 2px 8px rgba(0, 0, 0, 0.06)",
                md: "0px 0px 8px rgba(0, 0, 0, 0.08)"
              },
              backgroundColor: "white",
              borderRadius: { xs: "12px", md: "0" },
              border: {
                xs: "1px solid rgba(0, 0, 0, 0.06)",
                md: "none"
              },
              marginBottom: { xs: "20px", md: "0" },
              padding: {
                xs: "16px 12px",
                sm: "18px 16px",
                md: "20px 16px"
              },
              typography: 'body2',
              '& *': {
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                lineHeight: 1.5,
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: 'rgba(17, 24, 39, 0.95)',
              },
              '& h3': {
                fontSize: { xs: '0.95rem', sm: '1rem', md: '0.925rem' },
                marginBottom: '12px',
                marginTop: 0,
              },
              '& h4': {
                fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.85rem' },
                marginBottom: '8px',
                marginTop: 0,
              },
              '& p, & span, & div': {
                fontSize: { xs: '0.85rem', sm: '0.875rem', md: '0.825rem' },
                color: 'rgba(55, 65, 81, 0.9)',
                fontWeight: 400,
              },
              '& label': {
                fontSize: { xs: '0.8rem', sm: '0.825rem', md: '0.8rem' },
                fontWeight: 500,
                color: 'rgba(75, 85, 99, 0.95)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                '& .brand-name': {
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingRight: '8px',
                },
                '& .brand-count': {
                  flexShrink: 0,
                }
              },
              '& input, & select, & textarea': {
                fontSize: { xs: '0.8rem', sm: '0.825rem', md: '0.8rem' },
                fontFamily: 'inherit',
              },
              '& a, & button[type="button"]': {
                fontSize: { xs: '0.775rem', sm: '0.8rem', md: '0.775rem' },
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.2s ease-in-out',
              },
              '& .MuiChip-label, & small': {
                fontSize: { xs: '0.7rem', sm: '0.725rem', md: '0.7rem' },
                fontWeight: 400,
              },
              '& > *': {
                marginBottom: { xs: "20px", sm: "22px", md: "18px" },
              },
              '& > *:last-child': {
                marginBottom: 0,
              },
              '& .filter-section': {
                '& > *:not(:last-child)': {
                  marginBottom: { xs: "12px", md: "10px" },
                }
              },
              '& ul, & ol': {
                margin: 0,
                padding: 0,
                listStyle: 'none',
                '& li': {
                  marginBottom: { xs: "8px", md: "6px" },
                  padding: { xs: "6px 0", md: "4px 0" },
                  '&:last-child': {
                    marginBottom: 0,
                  }
                }
              },
              '& .form-group, & .filter-group': {
                marginBottom: { xs: "16px", md: "14px" },
                '& > label': {
                  marginBottom: { xs: "6px", md: "4px" },
                },
                '& > input, & > select': {
                  marginBottom: { xs: "4px", md: "2px" },
                }
              },
              '& input[type="checkbox"], & input[type="radio"]': {
                marginRight: { xs: "8px", md: "6px" },
                marginBottom: 0,
                flexShrink: 0,
              },
              '& .brand-item': {
                display: 'flex',
                alignItems: 'center',
                minWidth: 0,
                padding: { xs: "8px 4px", md: "6px 2px" },
                borderRadius: '4px',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
                '& .brand-checkbox': {
                  flexShrink: 0,
                  marginRight: { xs: "8px", md: "6px" },
                },
                '& .brand-text': {
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  paddingRight: '8px',
                  fontSize: { xs: '0.8rem', sm: '0.825rem', md: '0.8rem' },
                },
                '& .brand-count': {
                  flexShrink: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: 'rgba(75, 85, 99, 0.8)',
                }
              },
              '@media (max-width: 768px)': {
                '& button, & a, & label, & input[type="checkbox"], & input[type="radio"]': {
                  minHeight: '44px',
                  minWidth: '44px',
                },
                '& label': {
                  paddingVertical: '8px',
                }
              },
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
                '&:hover': {
                  background: 'rgba(0, 0, 0, 0.15)',
                },
              },
              '& *': {
                transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease',
              },
              '& *:focus-visible': {
                outline: '2px solid #3B82F6',
                outlineOffset: '2px',
                borderRadius: '2px',
              },
            }}
          >
            <Box className="filter-section">
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Categories</Typography>
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <Select
                    id="parent-category-select"
                    value={selectedParent}
                    onChange={(e) => {
                      const selectedParentCategory = categories.find(
                        (category) => category.id === e.target.value
                      );
                      setSelectedParent(e.target.value);
                      setSelectedChild("");
                      setSelectedCategory(selectedParentCategory);
                      setSelectedCategoryParent(selectedParentCategory?.name || "");
                      setSelectedCategoryChild('');
                      setPage(0);
                    }}
                    displayEmpty
                  >
                    <MenuItem disabled value="">Category Level 1</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl fullWidth>
                  <Select
                    id="child-category-select"
                    value={selectedChild || ""}
                    onChange={(e) => {
                      setSelectedChild(e.target.value);
                      const selectedId = e.target.value;
                      const selectedChildCategory = childCategories.find(
                        (category) => category.id === selectedId
                      );
                      setSelectedCategoryChild(selectedChildCategory?.name || "");
                      setSelectedCategory(selectedChildCategory);
                      setPage(0);
                    }}
                    displayEmpty
                    disabled={!selectedParent}
                  >
                    <MenuItem disabled value="">End Category</MenuItem>
                    {childCategories.map((category) => (
                      <MenuItem key={category.id} value={category.id} >
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box className="filter-section">
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Industry</Typography>
              <FormControl fullWidth>
                <Select
                  id="industry-select"
                  value={industryIdFor}
                  onChange={(e) => {
                    const selectedIndustryId = e.target.value;
                    const selectedIndustry = industryList.find(
                      (item) => item.id === selectedIndustryId
                    );
                    setIndustryIdFor(selectedIndustryId);
                    localStorage.setItem('industryId', JSON.stringify(selectedIndustryId));
                    setSelectedIndustryName(selectedIndustry?.name);
                    setIndustry(selectedIndustry);
                    setSelectedBrandIds([]);
                    refreshData(selectedIndustryId);
                    setSelectedCategory(null);
                    setSelectedParent("");
                    setSelectedChild("");
                    setSelectedBrandNames([]);
                    setPriceRange({ price_from: 0, price_to: '' });
                    if (priceClearFunction) {
                      priceClearFunction();
                    }
                    setPage(0);
                    setOpenSnackbar(true);
                  }}
                  displayEmpty
                >
                  <MenuItem value="">Select Industry</MenuItem>
                  {industryList.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box className="filter-section">
              <ProductBrand
                industryId={industry?.id}
                onBrandChange={handleBrandChange}
                selectedCategoryId={selectedCategory?.id}
                isParent={selectedCategory?.is_parent || false}
                selectedBrandsProp={selectedBrandIds}
              />
            </Box>

            <Box className="filter-section">
              <PriceRangeFilter
                onPriceChange={(newRange) => {
                  setPriceRange(newRange);
                  setPage(0);
                }}
                PriceClear={(func) => setPriceClearFunction(() => func)}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedBrandNames([]);
                  setSelectedBrandIds([]);
                  localStorage.removeItem("selectBrandNew");
                  localStorage.removeItem("selectedBrandIds");
                  localStorage.removeItem("dealerBrand");
                  setIndustry('');
                  localStorage.removeItem("industryId");
                  setSelectedChild('');
                  setSelectedParent('');
                  setSelectedCategoryChild('');
                  setSelectedCategoryParent('');
                  setSelectedIndustryName('');
                  setIndustryIdFor('');
                  setSelectedCategoryChildApply('');
                  setSelectedCategoryParentApply('');
                  setSelectedIndustryNameApply('');
                  setSelectedBrandApplyNames([]);
                  setPriceRange({ price_from: 0, price_to: '' });
                  setSelectedCategory("All Categories");
                  localStorage.removeItem("selectCategory");
                  if (priceClearFunction) priceClearFunction();
                  fetchData("all", null, null, null);
                  setOpenSnackbarforreset(true);
                }}
                sx={{ textTransform: 'none' }}
              >
                Clear All
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={10} p={0}>
          <div style={{ marginBottom: "25px", minWidth: '800px' }}>
            <Box
              sx={{
                backgroundColor: "white",
                position: "sticky",
                top: "55px",
                padding: "10px 15px",
                zIndex: 9,
                borderBottom: "1px solid #f0f0f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  {/* AUTOSUGGESTION BAR */}
                  <Autocomplete
                    id="product-search-bar"
                    size="small"
                    freeSolo
                    options={suggestions}
                    getOptionLabel={(option) => option.product_name || ""}
                    filterOptions={(x) => x}
                    onInputChange={(event, newInputValue) => {
                      setSearchTerm(newInputValue);
                      fetchSuggestions(newInputValue);
                    }}
                    onChange={(event, value) => {
                      if (value) {
                        navigate(`/manufacturer/products/details/${value.id}`);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search..."
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ fontSize: "20px", color: "action.active" }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              {loading && <CircularProgress color="inherit" size={20} />}
                              {searchTerm && (
                                <IconButton size="small" onClick={() => handleSearchChange({ target: { value: '' } })}>
                                  <ClearIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              )}
                            </InputAdornment>
                          ),
                          style: { fontSize: "14px" }
                        }}
                        sx={{ width: 250, '& .MuiOutlinedInput-root': { borderRadius: '4px', fontSize: '14px' } }}
                      />
                    )}
                  />
                  {/* END OF AUTOSUGGESTION BAR */}
                  <Tooltip title="Refresh">
                    <IconButton onClick={handleReload} sx={{ p: 1 }}>
                      <RefreshIcon sx={{ fontSize: "24px", color: "action.active" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box display="flex" alignItems="center" gap={1} sx={{ ml: 1 }}>
                  <Tooltip title="Bulk Edit">
                    <IconButton onClick={handleOpenBulkEdit} sx={{ p: 1 }}>
                      <EditIcon sx={{ fontSize: "24px", color: "action.active" }} />
                    </IconButton>
                  </Tooltip>
                  <TextField
                    variant="outlined"
                    placeholder="Discount"
                    size="small"
                    disabled={!isBulkEditing}
                    value={discountValue}
                    onChange={handleDiscountValueChange}
                    sx={{
                      width: "100px",
                      '& .MuiOutlinedInput-root': {
                        fontSize: '14px'
                      }
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 70 }}>
                    <Select
                      value={discountUnit}
                      onChange={handleDiscountUnitChange}
                      disabled={!isBulkEditing}
                      sx={{ fontSize: '14px' }}
                    >
                      <MenuItem value="%">%</MenuItem>
                      <MenuItem value="$">$</MenuItem>
                    </Select>
                  </FormControl>
                  {selectedItems.size > 0 && !loading && isBulkEditing &&
                    <Button
                      onClick={handleBulkEditSubmit}
                      variant="contained"
                      color="primary"
                      size="small"
                      sx={{
                        fontSize: "12px",
                        textTransform: "capitalize",
                        px: 2,
                        ml: 1
                      }}
                      disabled={selectedItems.size === 0 || loading}
                    >
                      Save Edit
                    </Button>
                  }
                </Box>
                <Tooltip title="Import File">
                  <IconButton onClick={handleOpenPopup} sx={{ p: 1, ml: 1 }}>
                    <FileDownloadOutlinedIcon sx={{ fontSize: "28px", color: "primary.main" }} />
                  </IconButton>
                </Tooltip>
                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: 2,
                  px: 1.5,
                  py: 0.5,
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  <Typography variant="body2">
                    Total Products: <strong>{filteredItems.length}</strong>
                  </Typography>
                  <IconButton
                    onClick={() => toggleView("list")}
                    color={viewMode === "list" ? "primary" : "default"}
                  >
                    <ViewList />
                  </IconButton>
                  <IconButton
                    onClick={() => toggleView("card")}
                    color={viewMode === "card" ? "primary" : "default"}
                  >
                    <ViewModule />
                  </IconButton>
                  <IconButton
                    onClick={() => navigate("/dealer/products?fromseller=true")}
                    color="default"
                  >
                    <Visibility />
                  </IconButton>
                </Box>
              </Box>
              {(CategoriesparentTag || CategoriesTag || IndustryTag || selectedBrandNames.length > 0) && (
                <Box sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: 2,
                  pt: 1,
                  borderTop: '1px solid #f0f0f0'
                }}>
                  {CategoriesparentTag && (
                    <Chip
                      label={`Category Level 1: ${CategoriesparentTag}`}
                      onDelete={() => {
                        setSelectedParent('');
                        setSelectedChild('');
                        setSelectedCategoryChild('');
                        setSelectedCategoryParent('');
                        fetchData(filters, null, industry, selectedBrandIds);
                        setOpenSnackbar(true);
                      }}
                      size="small"
                      sx={{
                        backgroundColor: '#e0e0e0',
                        fontSize: '12px'
                      }}
                    />
                  )}
                  {CategoriesTag && (
                    <Chip
                      label={`End Category: ${CategoriesTag}`}
                      onDelete={() => {
                        setSelectedChild('');
                        setSelectedCategoryChild('');
                        fetchData(filters, selectedparentfull, industry, selectedBrandIds);
                        setOpenSnackbar(true);
                      }}
                      size="small"
                      sx={{
                        backgroundColor: '#e0e0e0',
                        fontSize: '12px'
                      }}
                    />
                  )}
                  {IndustryTag && (
                    <Chip
                      label={`Industry: ${IndustryTag}`}
                      onDelete={() => {
                        setSelectedIndustryName('');
                        setIndustryIdFor('');
                        localStorage.removeItem("industryId");
                        fetchData(filters, selectedCategory, null, selectedBrandIds);
                        setOpenSnackbar(true);
                      }}
                      size="small"
                      sx={{
                        backgroundColor: '#ffcdd2',
                        fontSize: '12px'
                      }}
                    />
                  )}
                  {selectedBrandNames.map((name, index) => (
                    <Chip
                      key={selectedBrandIds[index]}
                      label={`Brand: ${name}`}
                      onDelete={() => {
                        const updatedIds = selectedBrandIds.filter((_, i) => i !== index);
                        const updatedNames = selectedBrandNames.filter((_, i) => i !== index);
                        setSelectedBrandIds(updatedIds);
                        setSelectedBrandNames(updatedNames);
                        fetchData(filters, selectedCategory, industry, updatedIds);
                        setOpenSnackbar(true);
                      }}
                      size="small"
                      sx={{
                        backgroundColor: '#bbdefb',
                        fontSize: '12px'
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
            <Box sx={{ margin: "0px 15px" }}>
              {viewMode === "list" ? (
                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    mt: 2,
                    maxHeight: 'calc(100vh - 250px)',
                    overflow: 'auto',
                  }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ background: "#f7fafc" }}>
                        {isBulkEditing && (
                          <TableCell sx={{ fontWeight: 700, color: "#050505", width: '3%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                            <Checkbox
                              checked={isAllSelected}
                              indeterminate={isSomeSelected}
                              onChange={handleSelectAll}
                              disabled={!isBulkEditing}
                              sx={{ p: 0.5, color: 'primary.main' }}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '5%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          Image
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '8%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          MPN
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '15%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          Product Name
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '10%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          Brand
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '12%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          Category
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '7%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          Price
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '8%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          Availability
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '5%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          Units
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '7%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          MSRP
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '7%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          Was Price
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: "#050505", width: '5%', fontFamily: 'Roboto', fontSize: '10px', textAlign: 'center', p: 1 }}>
                          Visibility
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={12} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={12} align="center" sx={{ color: 'red' }}>
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : filteredItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} align="center" sx={{ color: 'text.secondary' }}>
                            No Products Found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredItems
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((item) => {
                            if (!item) return null;
                            const editedFields = editedValues[item.id] || {};
                            const wasPrice = editedFields.was_price ?? item.was_price;
                            const price = editedFields.price ?? item.price;
                            const errorMessage = Number(price) > Number(wasPrice) ? "Price cannot exceed Was Price" : "";

                            return (
                              <TableRow key={item.id} hover sx={{ "&:hover": { background: "#f5f5f5" }, cursor: "pointer" }}>
                                {isBulkEditing && (
                                  <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                    <Checkbox
                                      checked={selectedItems.has(item.id)}
                                      onChange={() => handleSelectItem(item.id)}
                                      disabled={!isBulkEditing}
                                      sx={{ p: 0.5, color: 'primary.main' }}
                                    />
                                  </TableCell>
                                )}
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  <Link
                                    to={`/manufacturer/products/details/${item.id}?page=${page}`}
                                    state={{ searchQuery: searchTerm }}
                                  >
                                    <img
                                      src={item.logo && (item.logo.startsWith("http://example.com") ? soonImg : item.logo.startsWith("http") || item.logo.startsWith("https") ? item.logo : soonImg)}
                                      alt={item.product_name}
                                      style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8 }}
                                    />
                                  </Link>
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  <Link to={`/manufacturer/products/details/${item.id}?page=${page}`} state={{ searchQuery: searchTerm }} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Typography variant="body2" sx={{ fontSize: '12px' }}>{item.mpn}</Typography>
                                  </Link>
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  <Link to={`/manufacturer/products/details/${item.id}?page=${page}`} state={{ searchQuery: searchTerm }} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Typography variant="body2" sx={{ fontSize: '12px' }}>{item.product_name}</Typography>
                                  </Link>
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  <Typography variant="body2" sx={{ fontSize: '12px' }}>{item.brand_name}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  <Typography variant="body2" sx={{ fontSize: '12px' }}>{item.end_level_category}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  {isBulkEditing && selectedItems.has(item.id) ? (
                                    <TextField
                                      type="number"
                                      value={editedValues[item.id]?.price ?? item.price}
                                      onChange={(e) => handleFieldChange(item.id, "price", e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      size="small"
                                      sx={{ width: 80 }}
                                    />
                                  ) : (
                                    <Typography variant="body2" sx={{ fontSize: '12px' }}>${item.price?.toFixed(2)}</Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  <Tooltip title={item.availability ? 'In-stock' : 'Out of stock'}>
                                    <Box>{item.availability ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}</Box>
                                  </Tooltip>
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  <Typography variant="body2" sx={{ fontSize: '12px' }}>{item.quantity}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  {isBulkEditing && selectedItems.has(item.id) ? (
                                    <TextField
                                      type="number"
                                      value={editedValues[item.id]?.msrp ?? item.msrp}
                                      onChange={(e) => handleFieldChange(item.id, "msrp", e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      size="small"
                                      sx={{ width: 80 }}
                                    />
                                  ) : (
                                    <Typography variant="body2" sx={{ fontSize: '12px' }}>${item.msrp?.toFixed(2)}</Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  {isBulkEditing && selectedItems.has(item.id) ? (
                                    <TextField
                                      type="number"
                                      value={editedValues[item.id]?.was_price ?? item.was_price}
                                      onChange={(e) => handleFieldChange(item.id, "was_price", e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      size="small"
                                      sx={{ width: 80 }}
                                      error={!!errorMessage}
                                      helperText={errorMessage}
                                    />
                                  ) : (
                                    <Typography variant="body2" sx={{ fontSize: '12px' }}>${item.was_price?.toFixed(2)}</Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center" sx={{ fontSize: '12px', p: 1 }}>
                                  {isBulkEditing && selectedItems.has(item.id) ? (
                                    <IconButton
                                      onClick={(e) => { e.stopPropagation(); handleToggleVisibility(item.id); }}
                                      disabled={!selectedItems.has(item.id)}
                                    >
                                      {editedVisibility[item.id] !== undefined ? (
                                        editedVisibility[item.id] ? <Visibility /> : <VisibilityOff />
                                      ) : item.visible ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                  ) : (
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleToggleVisibility(item.id); }}>
                                      {item.visible ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                // Card View
                <Grid container spacing={4} sx={{ my: 2 }}>
                  {filteredItems
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={item.id}>
                        <Card
                          sx={{
                            borderRadius: 2,
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            background: "#fff",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            transition: "box-shadow 0.2s",
                            "&:hover": {
                              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                            },
                            cursor: "pointer",
                            minHeight: 390,
                            height: "100%",
                          }}
                        >
                          {/* Visibility Toggle Button - positioned at the top right */}
                          <Box
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              zIndex: 10,
                            }}
                          >
                            {isBulkEditing && (
                              <Checkbox
                                checked={selectedItems.has(item.id)}
                                onChange={() => handleSelectItem(item.id)}
                                sx={{ p: 0.5, color: 'primary.main' }}
                              />
                            )}
                            <IconButton
                              sx={{
                                color: item.visible ? "grey.500" : "grey.400",
                                background: 'rgba(255,255,255,0.8)',
                                '&:hover': {
                                  background: 'rgba(255,255,255,0.9)',
                                },
                                ml: isBulkEditing ? 1 : 0
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVisibility(item.id);
                              }}
                              disabled={isBulkEditing && !selectedItems.has(item.id)}
                            >
                              {item.visible ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </Box>

                          {/* Product Image and Discount Chip */}
                          <Box
                            sx={{
                              p: 2,
                              pb: 0,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              position: "relative",
                              minHeight: 180
                            }}
                            onClick={() =>
                              !isBulkEditing &&
                              navigate(`/manufacturer/products/details/${item.id}?page=${page}`, {
                                state: { searchQuery: searchTerm },
                              })
                            }
                          >
                            <img
                              src={
                                item.logo && (item.logo.startsWith("http://example.com") ? soonImg : item.logo.startsWith("http") || item.logo.startsWith("https") ? item.logo : soonImg)
                              }
                              alt={item.product_name}
                              style={{
                                maxWidth: "100%",
                                maxHeight: 160,
                                objectFit: "contain",
                                borderRadius: 4,
                                transition: "transform 0.3s ease-in-out",
                              }}
                            />
                            {item.price < item.was_price && (
                              <Chip
                                label={`${Math.round(((item.was_price - item.price) / item.was_price) * 100)}% off`}
                                size="small"
                                sx={{
                                  position: "absolute",
                                  bottom: -10,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  bgcolor: "#388e3c",
                                  color: "#fff",
                                  fontWeight: 600,
                                  fontSize: "12px",
                                  height: 24,
                                }}
                              />
                            )}
                          </Box>

                          {/* Product Details and Actions */}
                          <CardContent
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                              p: 2,
                              pt: 3,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                                noWrap
                                sx={{ fontFamily: 'Roboto' }}
                              >
                                {item.brand_name || "-"}
                              </Typography>
                              <Tooltip title={item.product_name}>
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  sx={{
                                    fontFamily: 'Roboto',
                                    color: "#212121",
                                    lineHeight: "1.3",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 2,
                                    mb: 1,
                                  }}
                                >
                                  {item.product_name}
                                </Typography>
                              </Tooltip>

                              {/* Price and Stock info */}
                              <Box sx={{ mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                  <Typography variant="h6" fontWeight={700} sx={{ fontFamily: 'Roboto' }}>
                                    ${item.price ? item.price.toFixed(2) : "N/A"}
                                  </Typography>
                                  {item.price < item.was_price && (
                                    <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                                      ${item.was_price ? item.was_price.toFixed(2) : ""}
                                    </Typography>
                                  )}
                                </Box>
                                <Typography variant="caption" sx={{ color: item.availability ? '#388e3c' : '#d32f2f' }}>
                                  {item.availability ? 'In Stock' : 'Out of Stock'}
                                </Typography>
                              </Box>
                            </Box>
                            {/* Bulk Edit Inputs */}
                            {isBulkEditing && selectedItems.has(item.id) && (
                              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <TextField
                                  label="MSRP"
                                  type="number"
                                  variant="outlined"
                                  size="small"
                                  value={editedValues[item.id]?.msrp ?? item.msrp}
                                  onChange={(e) => handleFieldChange(item.id, "msrp", e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  fullWidth
                                />
                                <TextField
                                  label="Was Price"
                                  type="number"
                                  variant="outlined"
                                  size="small"
                                  value={editedValues[item.id]?.was_price ?? item.was_price}
                                  onChange={(e) => handleFieldChange(item.id, "was_price", e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  fullWidth
                                />
                                <TextField
                                  label="Price"
                                  type="number"
                                  variant="outlined"
                                  size="small"
                                  value={editedValues[item.id]?.price ?? item.price}
                                  onChange={(e) => handleFieldChange(item.id, "price", e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  fullWidth
                                  error={Number(editedValues[item.id]?.price ?? item.price) > Number(editedValues[item.id]?.was_price ?? item.was_price)}
                                  helperText={
                                    Number(editedValues[item.id]?.price ?? item.price) > Number(editedValues[item.id]?.was_price ?? item.was_price)
                                      ? "Price cannot be greater than Was Price"
                                      : ""
                                  }
                                />
                              </Box>
                            )}

                            {/* Action Buttons */}
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              sx={{
                                fontFamily: 'Roboto',
                                fontWeight: 600,
                                textTransform: "none",
                                borderRadius: 2,
                                boxShadow: "none",
                                mt: 2,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isBulkEditing) {
                                  console.log("Quick view for product:", item.id);
                                }
                              }}
                              disabled={isBulkEditing}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              )}
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3
              }}
            >
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(event, newPage) => handleChangePage(event, newPage - 1)}
                color="primary"
                shape="rounded"
                size="large"
              />
            </Box>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              {currentColumn === "price" && (
                <>
                  <MenuItem onClick={() => handleSelectSort("price", "asc")}>
                    Sort Low to High
                  </MenuItem>
                  <MenuItem onClick={() => handleSelectSort("price", "desc")}>
                    Sort High to Low
                  </MenuItem>
                </>
              )}
              {currentColumn === "availability" && (
                <>
                  <MenuItem
                    sx={{ fontSize: "12px" }}
                    onClick={() => handleSelectAvailability("all")}
                  >
                    All
                  </MenuItem>
                  <MenuItem
                    sx={{ fontSize: "12px" }}
                    onClick={() => handleSelectAvailability("In-stock")}
                  >
                    In Stock
                  </MenuItem>
                  <MenuItem
                    sx={{ fontSize: "12px" }}
                    onClick={() => handleSelectAvailability("Out of stock")}
                  >
                    Out of Stock
                  </MenuItem>
                </>
              )}
              {currentColumn === "brand_name" && (
                <>
                  <MenuItem
                    onClick={() => handleSelectSort("brand_name", "asc")}
                  >
                    Sort A-Z
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSelectSort("brand_name", "desc")}
                  >
                    Sort Z-A
                  </MenuItem>
                </>
              )}
              {currentColumn === "product_name" && (
                <>
                  <MenuItem
                    onClick={() => handleSelectSort("product_name", "asc")}
                  >
                    Sort A-Z
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleSelectSort("product_name", "desc")}
                  >
                    Sort Z-A
                  </MenuItem>
                </>
              )}
              {currentColumn === "sku_number_product_code_item_number" && (
                <>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort(
                        "sku_number_product_code_item_number",
                        "asc"
                      )
                    }
                  >
                    Sort A-Z
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort(
                        "sku_number_product_code_item_number",
                        "desc"
                      )
                    }
                  >
                    Sort Z-A
                  </MenuItem>
                </>
              )}
              {currentColumn === "end_level_category" && (
                <>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort("end_level_category", "asc")
                    }
                  >
                    Sort A-Z
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      handleSelectSort("end_level_category", "desc")
                    }
                  >
                    Sort Z-A
                  </MenuItem>
                </>
              )}
              {currentColumn === "visible" && (
                <>
                  <MenuItem onClick={() => handleSelectVisible("visible", "visibleOff")}>
                    Hide
                  </MenuItem>
                  <MenuItem onClick={() => handleSelectVisible("visible", "visibleOn")}>
                    Unhide
                  </MenuItem>
                </>
              )}
            </Menu>
            <PopupModal open={isPopupOpen} onClose={handleClosePopup} />
          </div>
        </Grid>
      </Grid>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ backgroundColor: '#26cb26', color: 'white' }}
        >
          Filter applied successfully
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={openSnackbarforreset}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbarforreset(false)}
      >
        <Alert
          onClose={() => setOpenSnackbarforreset(false)}
          severity="success"
          sx={{ backgroundColor: '#26cb26', color: 'white' }}
        >
          Filters reset successfully
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ProductList;