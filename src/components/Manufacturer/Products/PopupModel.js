import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import { useNavigate } from "react-router-dom";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: '90%', sm: 450 },
  bgcolor: "rgba(255, 255, 255, 0.7)", // More subtle glass effect
  backdropFilter: "blur(12px)", // Stronger blur
  boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.15)", // Enhanced shadow
  p: 4,
  borderRadius: "20px",
  textAlign: "center",
  outline: 'none',
  border: '1px solid rgba(255, 255, 255, 0.2)', // Light border for definition
};

const iconStyle = {
  fontSize: "48px", // Slightly larger icons
  color: "#3498db",
};

const cardStyle = {
  padding: "24px", // Increased padding
  borderRadius: "16px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.05)",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(.25,.8,.25,1)", // Smoother transition
  textAlign: "center",
  border: '1px solid #f0f0f0',
  '&:hover': {
    transform: "translateY(-5px)", // Lift on hover
    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)", // More prominent shadow
  },
};

const PopupModal = ({ open = false, onClose = () => {} }) => {
  const navigate = useNavigate();

  const handleGeneralImport = () => {
    onClose();
    window.open("/manufacturer/products/import", "_blank");
  };

  const handlePersonalImport = () => {
    onClose();
    navigate("/manufacturer/products/personalimport");
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Box sx={style}>
        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: '#666',
            '&:hover': {
              color: '#333',
              bgcolor: 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Typography
          id="modal-title"
          variant="h5"
          sx={{ fontWeight: "bold", mb: 4, color: '#333' }}
        >
          Import Files
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Box onClick={handleGeneralImport} sx={cardStyle}>
              <DescriptionIcon sx={iconStyle} />
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 600, color: '#555' }}>
                General Import
              </Typography>
              <Typography variant="caption" sx={{ color: '#888' }}>
                Import product data from a universal template.
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box onClick={handlePersonalImport} sx={cardStyle}>
              <LayersIcon sx={iconStyle} />
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 600, color: '#555' }}>
                Personal Import
              </Typography>
              <Typography variant="caption" sx={{ color: '#888' }}>
                Create a custom import template for your files.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default PopupModal;