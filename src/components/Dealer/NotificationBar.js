// src/components/Dealer/NotificationBar.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Badge, Tooltip, Menu, MenuItem, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';

const NotificationBar = ({ cartCount, userData, toggleSidebar }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

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
    }}>
      {/* Left - Brand Name and Logo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: '20px' }}>
        <Typography 
          variant="h6" 
          fontSize={20} 
          fontWeight="bold" 
          sx={{ letterSpacing: '0.5px' }}
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

      {/* Right - Navigation Icons and Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            sx={{ fontSize: '16px', fontWeight: 500, color: '#333', cursor: 'pointer' }}
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