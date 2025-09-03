import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  TextField,
  FormGroup,
  Grid,
  Chip,
  Button,
  IconButton,
  Paper,
  InputAdornment,
  Collapse,
  CircularProgress
} from "@mui/material";
import {
  Close,
  Search,
  ExpandMore,
  ExpandLess,
  FilterAlt,
  FilterAltOff
} from "@mui/icons-material";

const ProductBrand = ({ industryId, onBrandChange, selectedCategoryId, isParent, selectedBrandsProp, detialSetBrand }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState(() => {
    const saved = localStorage.getItem('dealerBrand');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [productCountFilter, setProductCountFilter] = useState('all');

  useEffect(() => {
    if (selectedBrands.length > 0) {
      localStorage.setItem('dealerBrand', JSON.stringify(selectedBrands));
    }
  }, [selectedBrands]);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = localStorage.getItem("user");
        let manufactureUnitId = "";
        let role_name = "";

        if (userData) {
          const data = JSON.parse(userData);
          manufactureUnitId = data.manufacture_unit_id;
          role_name = data.role_name;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainbrandList/?manufacture_unit_id=${manufactureUnitId}&role_name=${role_name}&industry_id=${industryId || ""}&product_category_id=${selectedCategoryId || ""}&is_parent=${isParent || ""}&filters=all`
        );

        const responseData = response.data?.data || [];
        const filteredBrands = responseData.filter(
          (item, index, self) =>
            item.name &&
            item.name !== "null" &&
            index === self.findIndex((t) => t.name === item.name)
        );

        setBrands(filteredBrands);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load brands. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [industryId, selectedCategoryId]);

  useEffect(() => {
    if (selectedBrandsProp) {
      const updatedSelectedBrands = brands.filter((brand) =>
        selectedBrandsProp.includes(brand.id)
      );
      setSelectedBrands(updatedSelectedBrands);
    }
  }, [selectedBrandsProp, brands]);

  const handleBrandSelection = (brandId) => {
    const selectedBrand = brands.find((brand) => brand.id === brandId);
    const updatedBrands = selectedBrands.some((brand) => brand.id === brandId)
      ? selectedBrands.filter((brand) => brand.id !== brandId)
      : [...selectedBrands, { id: selectedBrand.id, name: selectedBrand.name }];

    setSelectedBrands(updatedBrands);

    if (onBrandChange) {
      onBrandChange({ updatedBrands });
    }
  };

  const handleClearAll = () => {
    setSelectedBrands([]);
    if (onBrandChange) {
      onBrandChange({ updatedBrands: [] });
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(brand => {
    if (productCountFilter === 'high') return (brand.products_count || 0) > 50;
    if (productCountFilter === 'medium') return (brand.products_count || 0) > 10 && (brand.products_count || 0) <= 50;
    if (productCountFilter === 'low') return (brand.products_count || 0) <= 10;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'count') return (b.products_count || 0) - (a.products_count || 0);
    return 0;
  });

  const groupBrandsByLetter = () => {
    const grouped = {};
    filteredBrands.forEach((brand) => {
      const firstLetter = brand.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(brand);
    });
    return grouped;
  };

  const sortedGroups = Object.keys(groupBrandsByLetter()).sort();

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
          Brands
        </Typography>
        {selectedBrands.length > 0 && (
          <Button
            size="small"
            color="error"
            startIcon={<FilterAltOff />}
            onClick={handleClearAll}
            sx={{ textTransform: 'none' }}
          >
            Clear ({selectedBrands.length})
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : brands.length > 0 ? (
        <>
          <Box mb={2}>
            <FormGroup>
              {brands.slice(0, 5).map((brand) => {
                return (
                  <FormControlLabel
                    key={brand.id}
                    control={
                      <Checkbox
                        checked={selectedBrands.some((b) => b.id === brand.id)}
                        onChange={() => handleBrandSelection(brand.id)}
                        size="small"
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2">{brand.name}</Typography>
                        <Chip
                          label={brand.products_count || 0}
                          size="small"
                          sx={{ ml: 1, height: 18 }}
                        />
                      </Box>
                    }
                    sx={{
                      '& .MuiTypography-root': { fontSize: '14px' },
                      mb: 0.5
                    }}
                  />
                );
              })}
            </FormGroup>

            {brands.length > 5 && (
              <Button
                variant="text"
                size="small"
                endIcon={<ExpandMore />}
                onClick={() => setOpen(true)}
                sx={{
                  textTransform: 'none',
                  color: '#1976d2',
                  mt: 1,
                  fontSize: '14px'
                }}
              >
                View all brands ({brands.length})
              </Button>
            )}
          </Box>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 2 } }}
          >
            <DialogTitle sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Select Brands
                </Typography>
                <IconButton onClick={() => setOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>

            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search brands..."
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box mt={1} display="flex" justifyContent="space-between">
                <Button
                  size="small"
                  startIcon={<FilterAlt />}
                  endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ textTransform: 'none' }}
                >
                  Filters
                </Button>

                <Box display="flex" gap={1}>
                  <Button
                    size="small"
                    variant={sortBy === 'name' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('name')}
                    sx={{ textTransform: 'none' }}
                  >
                    Sort by Name
                  </Button>
                  <Button
                    size="small"
                    variant={sortBy === 'count' ? 'contained' : 'outlined'}
                    onClick={() => setSortBy('count')}
                    sx={{ textTransform: 'none' }}
                  >
                    Sort by Count
                  </Button>
                </Box>
              </Box>

              <Collapse in={showFilters}>
                <Box mt={2} display="flex" gap={2} alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Product Count:
                  </Typography>
                  <Button
                    size="small"
                    variant={productCountFilter === 'all' ? 'contained' : 'outlined'}
                    onClick={() => setProductCountFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="small"
                    variant={productCountFilter === 'high' ? 'contained' : 'outlined'}
                    onClick={() => setProductCountFilter('high')}
                  >
                    High (&gt;50)
                  </Button>
                  <Button
                    size="small"
                    variant={productCountFilter === 'medium' ? 'contained' : 'outlined'}
                    onClick={() => setProductCountFilter('medium')}
                  >
                    Medium (10-50)
                  </Button>
                  <Button
                    size="small"
                    variant={productCountFilter === 'low' ? 'contained' : 'outlined'}
                    onClick={() => setProductCountFilter('low')}
                  >
                    {`Low (<10)`}
                  </Button>
                </Box>
              </Collapse>
            </Box>

            <DialogContent dividers sx={{ p: 0, maxHeight: '60vh' }}>
              {sortedGroups.length > 0 ? (
                sortedGroups.map((letter) => (
                  <Box key={letter}>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {letter}
                      </Typography>
                    </Box>
                    <Divider />
                    <Grid container spacing={0}>
                      {groupBrandsByLetter()[letter].map((brand) => {
                        return (
                          <Grid item xs={12} sm={6} key={brand.id}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedBrands.some((b) => b.id === brand.id)}
                                  onChange={() => handleBrandSelection(brand.id)}
                                  color="primary"
                                />
                              }
                              label={
                                <Box display="flex" alignItems="center">
                                  <Box>
                                    <Typography variant="body2">{brand.name}</Typography>
                                    <Chip
                                      label={`${brand.products_count || 0} products`}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: '0.7rem',
                                        mt: 0.5
                                      }}
                                    />
                                  </Box>
                                </Box>
                              }
                              sx={{
                                px: 2,
                                py: 1.5,
                                width: '100%',
                                m: 0,
                                '&:hover': { backgroundColor: '#f5f5f5' }
                              }}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))
              ) : (
                <Box p={3} textAlign="center">
                  <Typography>No brands match your search criteria</Typography>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Typography variant="body2">No brands available</Typography>
      )}
    </Paper>
  );
};

export default ProductBrand;