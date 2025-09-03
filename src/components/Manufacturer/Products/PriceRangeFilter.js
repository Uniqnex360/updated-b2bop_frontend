import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Slider, Button, TextField, Typography, Checkbox, FormControlLabel } from '@mui/material';

const PriceRangeFilter = ({ onPriceChange, PriceClear, currentRange }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState({ price_from: 0, price_to: '' });
  const [maxPrice, setMaxPrice] = useState(0);
  const [currency, setCurrency] = useState('$');
  const [quickFilters, setQuickFilters] = useState({
    low: false,
    mid: false,
    high: false
  });

  const MaxPrice = async () => {
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
        `${process.env.REACT_APP_IP}get_highest_priced_product/?manufacture_unit_id=${manufactureUnitId}&role_name=${role_name}`
      );

      const responseData = response.data?.data || {};
      const fetchedMaxPrice = responseData.price || 1000;
      setMaxPrice(fetchedMaxPrice);
      setCurrency(responseData.currency || '$');

      if (currentRange?.price_from !== undefined && currentRange?.price_to !== '') {
        setPriceRange(currentRange);
      } else {
        setPriceRange({ price_from: 0, price_to: fetchedMaxPrice });
      }

    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to load price range.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    MaxPrice();
  }, []);

  const handleSliderChange = (event, newValue) => {
    const [from, to] = newValue;
    setPriceRange({ price_from: from, price_to: to });
    // Reset quick filters when manually adjusting
    setQuickFilters({ low: false, mid: false, high: false });
  };

  const handleSliderChangeCommitted = (event, newValue) => {
    onPriceChange({ price_from: newValue[0], price_to: newValue[1] });
  };

  const handleQuickFilter = (type) => {
    let newRange;
    const newFilters = { low: false, mid: false, high: false };
    
    switch(type) {
      case 'low':
        newRange = { price_from: 0, price_to: maxPrice * 0.4 };
        newFilters.low = true;
        break;
      case 'mid':
        newRange = { price_from: maxPrice * 0.4, price_to: maxPrice * 0.7 };
        newFilters.mid = true;
        break;
      case 'high':
        newRange = { price_from: maxPrice * 0.7, price_to: maxPrice };
        newFilters.high = true;
        break;
      default:
        newRange = { price_from: 0, price_to: maxPrice };
    }
    
    setPriceRange(newRange);
    setQuickFilters(newFilters);
    onPriceChange(newRange);
  };

  const ClearPrice = () => {
    const newRange = { price_from: 0, price_to: maxPrice };
    setPriceRange(newRange);
    setQuickFilters({ low: false, mid: false, high: false });
    onPriceChange(newRange);
  };

  useEffect(() => {
    PriceClear(ClearPrice);
  }, [PriceClear, maxPrice]);

  return (
    <Box sx={{ 
      padding: 2, 
      maxWidth: '100%',
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      backgroundColor: '#fafafa'
    }}>
      <Typography variant="h6" gutterBottom sx={{ 
        fontSize: "14px", 
        fontWeight: 600,
        marginBottom: '16px'
      }}>
        Price Range
      </Typography>

      {/* Quick Filters */}
      <Box sx={{ marginBottom: '16px' }}>
        <Typography variant="body2" sx={{ marginBottom: '8px', fontWeight: 500 }}>
          Show all
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={quickFilters.low}
                onChange={() => handleQuickFilter('low')}
                size="small"
              />
            }
            label={`Low (${currency}0 - ${currency}${Math.floor(maxPrice * 0.4)})`}
            sx={{ '& .MuiTypography-root': { fontSize: '13px' } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={quickFilters.mid}
                onChange={() => handleQuickFilter('mid')}
                size="small"
              />
            }
            label={`Mid (${currency}${Math.floor(maxPrice * 0.4)} - ${currency}${Math.floor(maxPrice * 0.7)})`}
            sx={{ '& .MuiTypography-root': { fontSize: '13px' } }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={quickFilters.high}
                onChange={() => handleQuickFilter('high')}
                size="small"
              />
            }
            label={`High (${currency}${Math.floor(maxPrice * 0.7)} & above)`}
            sx={{ '& .MuiTypography-root': { fontSize: '13px' } }}
          />
        </Box>
      </Box>

      {/* Range Slider */}
      <Slider
        value={[priceRange.price_from, priceRange.price_to === '' ? maxPrice : priceRange.price_to]}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderChangeCommitted}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${currency}${value}`}
        min={0}
        max={maxPrice}
        step={Math.max(1, Math.floor(maxPrice / 100))}
        sx={{
          marginBottom: '16px',
          height: 4,
          '& .MuiSlider-thumb': {
            width: 14,
            height: 14,
            backgroundColor: '#fff',
            border: '2px solid #1976d2',
          },
          '& .MuiSlider-track': {
            backgroundColor: '#1976d2',
          },
          '& .MuiSlider-rail': {
            backgroundColor: '#e0e0e0',
          },
          '& .MuiSlider-valueLabel': {
            backgroundColor: '#1976d2',
            color: '#fff',
          },
        }}
      />

      {/* Range Inputs */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '16px'
      }}>
        <TextField
          size="small"
          value={priceRange.price_from}
          onChange={(e) => setPriceRange({...priceRange, price_from: Number(e.target.value)})}
          onBlur={() => onPriceChange(priceRange)}
          inputProps={{ min: 0, max: maxPrice }}
          sx={{ width: '80px' }}
        />
        <Typography variant="body2">to</Typography>
        <TextField
          size="small"
          value={priceRange.price_to}
          onChange={(e) => setPriceRange({...priceRange, price_to: Number(e.target.value)})}
          onBlur={() => onPriceChange(priceRange)}
          inputProps={{ min: 0, max: maxPrice }}
          sx={{ width: '80px' }}
        />
        <Button 
          variant="contained" 
          size="small"
          onClick={() => onPriceChange(priceRange)}
          sx={{ 
            marginLeft: '8px',
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          GO
        </Button>
      </Box>

      {/* Current Selection */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px',
        backgroundColor: '#e3f2fd',
        borderRadius: '4px'
      }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Current
        </Typography>
        <Typography variant="body2">
          {currency}{priceRange.price_from} - {currency}{priceRange.price_to === '' ? maxPrice : priceRange.price_to}
        </Typography>
      </Box>
    </Box>
  );
};

export default PriceRangeFilter;