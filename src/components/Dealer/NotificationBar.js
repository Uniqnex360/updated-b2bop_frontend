import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  IconButton, 
  Badge, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Avatar,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchIcon from '@mui/icons-material/Search';

const NotificationBar = ({ cartCount, userData, toggleSidebar }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Static random profile image from Unsplash (same as seller component)
  const profileImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}getManufactureUnitLogo/`,
        {
          params: {
            manufacture_unit_id: user.manufacture_unit_id,
          },
        }
      );
      if (response.data && response.data.data.logo) {
        setLogoPreview(response.data.data.logo);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
      alert('Error fetching logo');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate("/dealer/profile");
    handleMenuClose();
  };

  return (
    <Box sx={{
      backgroundColor: '#ffffff',
      color: '#333',
      padding: '12px 24px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      flexDirection: { xs: 'column', sm: 'row' },
      gap: { xs: 2, sm: 0 },
    }}>
      {/* Left - Brand Name and Logo */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: '20px', 
        width: { xs: '100%', sm: 'auto' }, 
        justifyContent: { xs: 'center', sm: 'flex-start' } 
      }}>
        <Typography 
          variant="h6" 
          fontSize={17} 
          fontWeight="bold" 
          sx={{ letterSpacing: '0.5px', whiteSpace: 'nowrap' }}
        >
          Buyer Dashboard
        </Typography>
        {logoPreview && (
          <img 
            src={logoPreview} 
            alt="Company Logo" 
            style={{ 
              width: 'auto', 
              height: '40px',
              maxWidth: '120px',
              objectFit: 'contain'
            }} 
          />
        )}
      </Box>

      {/* Center - Search Bar */}
      <Box sx={{ 
        flexGrow: 1, 
        mx: { xs: 0, sm: 2 }, 
        order: { xs: 3, sm: 2 }, 
        display: 'flex', 
        justifyContent: { xs: 'center', sm: 'flex-start' }
      }}>
        <TextField
          variant="outlined"
          placeholder="Search Brand, Category..."
          size="small"
          sx={{ width: '100%', maxWidth: 500 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '8px',
              bgcolor: '#f8fafc',
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: '1px solid #3b82f6' },
            }
          }}
        />
      </Box>

      {/* Right - Navigation Icons and Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, order: { xs: 2, sm: 3 } }}>
        <Tooltip title="WishList" arrow>
          <IconButton
            sx={{ color: '#333', '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' } }}
            onClick={() => navigate("/dealer/WishList")}
          >
            <FavoriteIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Cart" arrow>
          <IconButton
            sx={{ color: '#333', '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' } }}
            onClick={() => navigate("/dealer/cart")}
          >
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              padding: 0,
              borderRadius: '50%',
              overflow: 'hidden'
            }}
          >
            <Avatar 
              src={profileImage} 
              alt="User" 
              sx={{ width: 38, height: 38 }}
            />
          </IconButton>
          <Typography 
            variant="body1" 
            sx={{ fontSize: '16px', fontWeight: 500, color: '#333', cursor: 'pointer', display: { xs: 'none', sm: 'block' } }}
            onClick={handleMenuOpen}
          >
            {userData?.first_name || user.name}
          </Typography>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { mt: 1.5, minWidth: 160 }
            }}
          >
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default NotificationBar;