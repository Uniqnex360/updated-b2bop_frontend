import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


const NotificationBar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [anchorEl, setAnchorEl] = useState(null);

  // Static random profile image from Unsplash
  const profileImage = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const handleUserProfile = () => {
    navigate('/manufacturer/userProfile');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
      {/* Left - Brand Name */}
      <Box sx={{ display: "flex", alignItems: "center", gap: '20px' }}>
        <Typography 
          variant="h6" 
          fontSize={20} 
          fontWeight="bold" 
          sx={{ letterSpacing: '0.5px' }}
        >
          Seller Dashboard
        </Typography>
      </Box>

      {/* Right - Profile */}
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
          {user?.name}
        </Typography>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { mt: 1.5, minWidth: 160 }
          }}
        >
          <MenuItem onClick={() => { handleUserProfile(); handleMenuClose(); }}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default NotificationBar;
