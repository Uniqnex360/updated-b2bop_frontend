import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import {
  Accordion, AccordionDetails, AccordionSummary, Typography, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, List, ListItem, ListItemText, Divider,
  Paper, TextField, IconButton, CircularProgress, Box, MenuItem, Select, FormControl, Checkbox, Button,
  TablePagination, Tooltip, Menu
} from '@mui/material';
import { Visibility, VisibilityOff, MoreVert as MoreVertIcon, Discount } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshIcon from '@mui/icons-material/Refresh';

// Define a theme-based color palette
const theme = {
  primary: '#1976d2', // Blue for primary elements
  secondary: '#f50057', // Pink for accents
  background: '#f5f5f5', // Light gray background
  textPrimary: '#333', // Dark text
  textSecondary: '#666', // Gray text for secondary info
};

const CategoryAccordion = ({ 
  category, 
  handleCategory, 
  parentCategoryId, 
  fetchData, 
  handleCategoryFalse 
}) => {
  const [expanded, setExpanded] = useState(null);
  const [open, setOpen] = useState(false);

  const handleExpandClick = (category, parentCategoryId = null) => {
    if (category.is_parent || (category.subCategories && category.subCategories.length > 0)) {
      setExpanded((prevExpanded) => (prevExpanded === category.id ? null : category.id));
    }
    if (category.is_parent || (category.subCategories && category.subCategories.length > 0)) {
      handleCategory(category.id, parentCategoryId);
    } else {
      console.log('Category is not a parent and has no subcategories:', category);
      handleCategoryFalse(category.id, parentCategoryId);
      setOpen(false);
    }
  };

  return (
    <Accordion
      expanded={expanded === category.id}
      sx={{
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        marginBottom: 1,
        '&:hover': { backgroundColor: theme.background },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: theme.primary }} />}
        onClick={() => handleExpandClick(category, category.id)}
        sx={{
          backgroundColor: expanded === category.id ? theme.background : 'white',
          '&:hover': { backgroundColor: theme.background },
          padding: '8px 16px',
        }}
      >
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: theme.textPrimary }}>
          {category.name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '8px 16px' }}>
        <List>
          {category.subCategories ? (
            category.subCategories.length > 0 ? (
              category.subCategories.map((subCategory) => (
                <Box key={subCategory.id}>
                  <CategoryAccordion
                    category={subCategory}
                    handleCategory={handleCategory}
                    handleCategoryFalse={handleCategoryFalse}
                    parentCategoryId={category.id}
                    fetchData={fetchData}
                  />
                  <Divider sx={{ my: 1 }} />
                </Box>
              ))
            ) : null
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
              <CircularProgress size={24} sx={{ color: theme.primary }} />
            </Box>
          )}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

function ManufactureProductList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [editedValues, setEditedValues] = useState({});
  const [editedVisibility, setEditedVisibility] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [filters, setFilters] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [currentColumn, setCurrentColumn] = useState("");
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [expanded, setExpanded] = useState(null);

  const fetchData = async (filters = 'all', selectedCategory = null, key, direction) => {
    console.log('Fetching data with filters:', filters, 'and selected category:', selectedCategory);
    const elementData = selectedCategory;
    const falseCondition = elementData?.is_parent;
    console.log('Every data:', falseCondition);
    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      let manufactureUnitId = '';
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
      const keyValue = key;
      const sort_by_value = direction === 'asc' ? 1 : direction === 'desc' ? -1 : '';
      const categoryId = selectedCategory ? selectedCategory.id : '';
      console.log('Category ID to be sent:', categoryId);
      const payload = {
        manufacture_unit_id: id,
        product_category_id: categoryId ? categoryId : elementData || '',
        filters: filters || 'all',
        sort_by: keyValue || '',
        sort_by_value: sort_by_value,
        is_parent: falseCondition ? true : false,
      };
      console.log('Request payload:', payload);
      const productResponse = await axios.post(
        `${process.env.REACT_APP_IP}obtainProductsList/`,
        payload
      );
      setItems(productResponse.data.data || []);
    } catch (err) {
      setError('Failed to load items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandClick = (category, parentCategoryId = null) => {
    if (category.is_parent || (category.subCategories && category.subCategories.length > 0)) {
      setExpanded((prevExpanded) => (prevExpanded === category.id ? null : category.id));
    }
    if (category.is_parent || (category.subCategories && category.subCategories.length > 0)) {
      handleCategory(category.id, parentCategoryId);
      fetchData('all', category);
    }
    if (!category.is_parent && (!category.subCategories || category.subCategories.length === 0)) {
      console.log('Product is parent:', category.is_parent);
      fetchData('all', category);
    }
  };

  const handleCategoryFalse = async (categoryId, parentCategoryId = null) => {
    console.log('Fetching data for category ID:', categoryId);
    if (!categoryId) {
      console.error('Invalid categoryId:', categoryId);
      return;
    }
    try {
      const userData = localStorage.getItem('user');
      let manufactureUnitId = '';
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
      const firstCategory = categoryId;
      console.log('Manufacture Unit ID:', firstCategory);
      fetchData('all', firstCategory);
      setOpen(false);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCategory = async (categoryId, parentCategoryId = null) => {
    console.log('Fetching data for category ID:', categoryId, 'Parent:', parentCategoryId);
    const userData = localStorage.getItem('user');
    let manufactureUnitId = '';
    if (userData) {
      const data = JSON.parse(userData);
      manufactureUnitId = data.manufacture_unit_id;
    }
    try {
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${id}&product_category_id=${categoryId}`
      );
      const categoryData = categoryResponse.data.data || [];
      console.log('Fetched category data:', categoryData);
      if (categoryData.length > 0) {
        if (!categoryData[0].is_parent && !(categoryData[0].subCategories?.length > 0)) {
          setOpen(false);
        }
        const updatedCategories = categoryData.map((category) => ({
          ...category,
          subCategories: category.is_parent ? category.subCategories || [] : undefined,
        }));
        setCategories(updatedCategories);
        const firstCategory = categoryData[0];
        if (categoryId) {
          console.log('Fetching data for first category:', firstCategory);
          fetchData('all', firstCategory);
        }
      } else {
        console.log('No categories found.');
      }
    } catch (error) {
      console.error('Error in handleCategory:', error);
    }
  };

  const updateCategoriesRecursively = (categories, categoryId, subCategories) => {
    return categories.map((category) => {
      if (category.id === categoryId) {
        return { ...category, subCategories };
      } else if (category.subCategories) {
        return { ...category, subCategories: updateCategoriesRecursively(category.subCategories, categoryId, subCategories) };
      }
      return category;
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const userData = localStorage.getItem('user');
        let manufactureUnitId = '';
        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
        }
        const categoryResponse = await axios.get(
          `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${id}`
        );
        setCategories(categoryResponse.data.data || []);
        await fetchData();
      } catch (error) {
        console.error('Error fetching initial data', error);
      }
    };
    fetchInitialData();
  }, []);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  const handleSearchChange = async (event) => {
    const query = event.target.value;
    setSearchTerm(query);
    const userData = localStorage.getItem('user');
    let manufactureUnitId = '';
    if (userData) {
      const data = JSON.parse(userData);
      manufactureUnitId = data.manufacture_unit_id;
    }
    try {
      if (query) {
        const categoryResponse = await axios.post(
          `${process.env.REACT_APP_IP}productSearch/`,
          {
            manufacture_unit_id: manufactureUnitId,
            search_query: query,
          }
        );
        console.log("Search Results:", categoryResponse.data);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleSearchIconClick = () => setIsSearchOpen(true);
  const handleSearchBlur = () => {
    if (searchTerm.trim() === "") setIsSearchOpen(false);
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

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleSelectItem = (id) => {
    setSelectedItems((prevSelected) => {
      const updatedSelected = new Set(prevSelected);
      if (updatedSelected.has(id)) {
        updatedSelected.delete(id);
      } else {
        updatedSelected.add(id);
      }
      return updatedSelected;
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

  const handleCloseMenu = () => setAnchorEl(null);

  const handleSelectSort = (key, direction) => {
    console.log('Sorting with:', key, direction);
    setSortConfig({ key, direction });
    setPage(0);
    fetchData('', '', key, direction);
    setAnchorEl(null);
  };

  const handleSelectAvailability = (status) => {
    setFilters(status);
    fetchData(status);
    setAnchorEl(null);
  };

  const refreshData = async () => {
    try {
      const userData = localStorage.getItem('user');
      let manufactureUnitId = '';
      if (userData) {
        const data = JSON.parse(userData);
        manufactureUnitId = data.manufacture_unit_id;
      }
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}obtainProductCategoryList/?manufacture_unit_id=${manufactureUnitId}`
      );
      setCategories(categoryResponse.data.data || []);
      fetchData('all');
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch =
      (item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.sku_number_product_code_item_number && item.sku_number_product_code_item_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand_name && item.brand_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter ? item.category === filter : true;
    return matchesSearch && matchesFilter;
  });

  if (error) return (
    <Box sx={{ textAlign: 'center', py: 4, color: theme.textSecondary }}>
      <Typography variant="h6">{error}</Typography>
    </Box>
  );

  return (
    <Box sx={{ padding: { xs: 2, md: 4 }, backgroundColor: theme.background, minHeight: '100vh' }}>
      <Box display="flex" alignItems="center" justifyContent="flex-end" mb={3} gap={2}>
        <FormControl
          sx={{
            minWidth: 120,
            width: "220px",
            height: "40px",
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: 'white',
              '&:hover fieldset': { borderColor: theme.primary },
            },
          }}
        >
          <Select
            value={filter}
            onChange={handleFilterChange}
            displayEmpty
            size="small"
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            sx={{ fontSize: '14px', color: theme.textPrimary }}
          >
            <MenuItem
              value=""
              sx={{
                fontSize: '14px',
                fontWeight: filter === "" ? 'bold' : 'normal',
                backgroundColor: filter === "" ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => {
                refreshData();
                setFilter("");
              }}
            >
              <span style={{ flex: 1 }}>All Categories</span>
              {open && <RefreshIcon sx={{ fontSize: 18, color: theme.primary }} />}
            </MenuItem>
            <Box sx={{ width: "220px", padding: 2, maxHeight: '300px', overflowY: 'auto' }}>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Box key={category.id} sx={{ marginBottom: 1 }}>
                    <CategoryAccordion
                      category={category}
                      handleCategoryFalse={handleCategoryFalse}
                      handleCategory={handleCategory}
                      parentCategoryId={null}
                      isParent={category.is_parent}
                      subCategories={category.subCategories || []}
                      handleExpandClick={handleExpandClick}
                      disabled={!category.is_parent && !(category.subCategories && category.subCategories.length > 0)}
                    />
                  </Box>
                ))
              ) : (
                <Typography sx={{ fontSize: '14px', color: theme.textSecondary }}>
                  No categories available
                </Typography>
              )}
            </Box>
          </Select>
        </FormControl>
        <TextField
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          size="small"
          onBlur={handleSearchBlur}
          autoFocus
          sx={{
            width: "220px",
            height: "40px",
            backgroundColor: 'white',
            borderRadius: '8px',
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': { borderColor: theme.primary },
              '&.Mui-focused fieldset': { borderColor: theme.primary },
            },
            '& .MuiInputBase-input': { fontSize: '14px' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: "20px", color: theme.textSecondary }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>
<TableContainer
  component={Paper}
  sx={{
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    maxHeight: '400px', // Adjusted for testing
    overflow: 'auto',
  }}
>
  <Table stickyHeader>
    <TableHead sx={{ zIndex: 1000 }}>
      <TableRow>
        {[
          { label: 'Image', key: '' },
          { label: 'SKU', key: 'sku_number_product_code_item_number' },
          { label: 'Product Name', key: 'product_name' },
          { label: 'Brand', key: 'brand_name' },
          { label: 'Category', key: 'end_level_category' },
          { label: 'Availability', key: 'availability' },
          { label: 'MPN', key: '' },
          { label: 'MSRP', key: '' },
          { label: 'Was Price', key: '' },
          { label: 'Price', key: 'price' },
          { label: 'Hide', key: '' },
        ].map((col) => (
          <TableCell
            key={col.label}
            sx={{
              backgroundColor: theme.primary,
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              textAlign: 'center',
              padding: '10px',
            }}
          >
            {col.label}
            {col.key && (
              <IconButton onClick={(e) => handleOpenMenu(e, col.key)} size="small">
                <MoreVertIcon sx={{ fontSize: '16px', color: 'white' }} />
              </IconButton>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredItems
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((item, index) => (
          <TableRow
            key={item.id}
            sx={{
              backgroundColor: index % 2 === 0 ? 'white' : theme.background,
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <TableCell sx={{ textAlign: 'center', padding: '8px' }}>
              <Link to={`/manufacturer/products/details/${item.id}`}>
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt="Product Logo"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #ddd',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f0f0f0',
                      color: theme.textSecondary,
                      fontSize: '10px',
                      borderRadius: '50%',
                      border: '1px solid #ddd',
                    }}
                  >
                    No Image
                  </Box>
                )}
              </Link>
            </TableCell>
            <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>
              <Link
                style={{ textDecoration: 'none', color: theme.textPrimary }}
                to={`/manufacturer/products/details/${item.id}`}
              >
                {item.sku_number_product_code_item_number}
              </Link>
            </TableCell>
            <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>
              <Link
                to={`/manufacturer/products/details/${item.id}`}
                style={{
                  textDecoration: 'none',
                  color: theme.textPrimary,
                  maxWidth: '150px',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.product_name}
              </Link>
            </TableCell>
            <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>{item.brand_name}</TableCell>
            <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>{item.end_level_category}</TableCell>
            <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>
              <Box
                sx={{
                  color: item.availability ? '#4caf50' : '#f44336',
                  fontWeight: 500,
                }}
              >
                {item.availability ? 'In-stock' : 'Out of stock'}
              </Box>
            </TableCell>
            <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>{item.mpn}</TableCell>
            <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>{item.msrp}</TableCell>
            <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>{item.was_price}</TableCell>
            <TableCell sx={{ textAlign: 'center', fontSize: '14px' }}>{item.price}</TableCell>
            <TableCell sx={{ textAlign: 'center' }}>
              <IconButton onClick={() => handleToggleVisibility(item.id)}>
                {item.visible ? (
                  <Visibility sx={{ color: theme.primary }} />
                ) : (
                  <VisibilityOff sx={{ color: theme.textSecondary }} />
                )}
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
    </TableBody>
  </Table>
</TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredItems.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
        sx={{
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: '14px',
            color: theme.textSecondary,
          },
          '& .MuiTablePagination-actions button': {
            color: theme.primary,
          },
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          },
        }}
      >
        {currentColumn === "price" && (
          <>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("price", "asc")}>
              Sort Low to High
            </MenuItem>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("price", "desc")}>
              Sort High to Low
            </MenuItem>
          </>
        )}
        {currentColumn === "availability" && (
          <>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectAvailability('all')}>
              All
            </MenuItem>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectAvailability('In-stock')}>
              In Stock
            </MenuItem>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectAvailability('Out of stock')}>
              Out of Stock
            </MenuItem>
          </>
        )}
        {currentColumn === "brand_name" && (
          <>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("brand_name", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("brand_name", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}
        {currentColumn === "product_name" && (
          <>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("product_name", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("product_name", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}
        {currentColumn === "sku_number_product_code_item_number" && (
          <>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("sku_number_product_code_item_number", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("sku_number_product_code_item_number", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}
        {currentColumn === "end_level_category" && (
          <>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("end_level_category", "asc")}>
              Sort A-Z
            </MenuItem>
            <MenuItem sx={{ fontSize: '14px' }} onClick={() => handleSelectSort("end_level_category", "desc")}>
              Sort Z-A
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}

export default ManufactureProductList;