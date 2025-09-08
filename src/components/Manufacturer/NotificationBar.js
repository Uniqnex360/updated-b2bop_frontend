import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  TextField,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';

const NotificationBar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [anchorEl, setAnchorEl] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      flexDirection: { xs: 'column', sm: 'row' },
      gap: { xs: 2, sm: 0 },
    }}>
      {/* Left - Brand Name and Search Bar */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: '20px',
        width: { xs: '100%', sm: 'auto' },
        justifyContent: { xs: 'center', sm: 'flex-start' },
        flexGrow: { sm: 1 },
      }}>
        <Typography
          variant="h6"
          fontSize={18}
          fontWeight="bold"
          sx={{ letterSpacing: '0.5px', whiteSpace: 'nowrap' }}
        >
          Seller Dashboard
        </Typography>

        <TextField
          variant="outlined"
          placeholder="Search Brand, Category, Buyer..."
          size="small"
          sx={{ 
            width: '100%', 
            maxWidth: { xs: 'none', sm: 300, md: 500 },
          }}
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

      {/* Right - Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, order: { xs: 2, sm: 3 } }}>
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