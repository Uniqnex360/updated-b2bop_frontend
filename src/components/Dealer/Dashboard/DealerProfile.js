import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Card,
  CardContent,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
  Avatar,
  useTheme,
} from "@mui/material";
import { Edit, Delete, CameraAlt, Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 3D icons from react-icons (except user icons)
import { FaBuilding, FaMapMarkedAlt, FaGlobeAmericas } from "react-icons/fa";
import { GiMailbox, GiSmartphone } from "react-icons/gi";
import { MdEmail } from "react-icons/md";

const DealerProfile = ({ userData, fetchUserDetails, setUserData }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [errors, setErrors] = useState({});
  const [isEditable, setIsEditable] = useState(false);
  const [open, setOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    mobile_number: "", // Added new field
    is_default: false,
  });

  const theme = useTheme();

  useEffect(() => {
    if (!userData) {
      fetchUserDetails();
    }
  }, [userData, fetchUserDetails]);

  const validateFields = () => {
    const newErrors = {};

    if (!userData.first_name?.trim())
      newErrors.first_name = "First Name is required.";
    if (!userData.last_name?.trim())
      newErrors.last_name = "Last Name is required.";
    if (!userData.email?.trim() || !/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = "A valid Email is required.";
    }
    if (
      !userData.mobile_number?.trim() ||
      !/^\d{10}$/.test(userData.mobile_number)
    ) {
      newErrors.mobile_number = "A valid 10-digit Mobile Number is required.";
    }
    if (!userData.company_name?.trim())
      newErrors.company_name = "Company Name is required.";

    if (!userData?.address_obj_list || userData.address_obj_list.length === 0) {
      newErrors.address =
        "Address list is empty. Please add at least one address.";
      toast.error("Address list is empty. Please add at least one address.");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditable(true);
  };

  const handleSave = async () => {
    const isDefaultAddressPresent = userData.address_obj_list.some(
      (address) => address.is_default
    );

    if (!isDefaultAddressPresent) {
      toast.error("Please select a default address to save.");
      return;
    }

    if (!validateFields()) {
      toast.error("Please fill all mandatory fields.");
      return;
    }

    try {
      const filteredAddressList = userData.address_obj_list.map(
        ({ street, city, state, zipCode, country, mobile_number, is_default, address_id }) => ({
          street,
          city,
          state,
          zipCode,
          country,
          mobile_number, // Included new field
          is_default,
          id: address_id,
        })
      );

      await axios.post(
        `${process.env.REACT_APP_IP}updateUserProfile/`,
        {
          user_id: user.id,
          user_obj: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            mobile_number: userData.mobile_number,
            profile_image: userData.profile_image,
            company_name: userData.company_name,
            website: userData.website,
          },
          address_obj_list: filteredAddressList,
          bank_details_obj_list: userData.bank_details_obj_list,
          ware_house_obj_list: userData.ware_house_obj_list,
        }
      );
      toast.success("Profile updated successfully!");
      setIsEditable(false);
      fetchUserDetails();
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prevState) => ({
          ...prevState,
          profile_image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (index) => {
    setUserData((prevState) => {
      const updatedAddressList = [...prevState.address_obj_list];
      updatedAddressList.splice(index, 1);
      return { ...prevState, address_obj_list: updatedAddressList };
    });
  };

  const handleDelete = async (index, addressId, isDefault) => {
    if (isDefault) {
      toast.error("Cannot delete default address.");
      return;
    }

    const userId = JSON.parse(localStorage.getItem("user"))?.id;
    if (!userId) {
      console.error("No user data found in localStorage.");
      return;
    }

    const addressToDelete = addressId || userData.address_obj_list[index]?.address_id;

    if (!addressToDelete) {
      console.error("Address ID or index not found for deletion");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_IP}deleteAddress/`, {
        address_id: addressToDelete,
        user_id: userId,
        is_default: isDefault,
      });

      toast.success("Address deleted successfully!");
      fetchUserDetails();
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address. Please try again.");
    }
  };

  const handleDefaultChange = (index) => {
    setUserData((prevState) => {
      const updatedAddressList = prevState.address_obj_list.map((address, i) =>
        i === index
          ? { ...address, is_default: true }
          : { ...address, is_default: false }
      );
      return {
        ...prevState,
        address_obj_list: updatedAddressList,
      };
    });
  };

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.zipCode || !newAddress.country || !newAddress.state || !newAddress.mobile_number) {
      toast.error("Please fill out all required address fields.");
      return;
    }

    const newAddressWithDefault = {
      ...newAddress,
      id: Date.now().toString(),
      is_default: false,
    };

    setUserData((prevState) => ({
      ...prevState,
      address_obj_list: [...prevState.address_obj_list, newAddressWithDefault],
    }));

    setNewAddress({
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      mobile_number: "", // Reset new mobile number field
      is_default: false,
    });

    handleClose();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  if (!userData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.200" }}>
      <Box sx={{
        bgcolor: "white",
        maxWidth: "980px",
        mx: "auto",
        boxShadow: 4,
        borderRadius: 3,
        mt: 4,
        overflow: "hidden",
      }}>
        {/* Profile Header Section */}
        <Box
          sx={{
            height: "175px", // Reduced height, no blue/gradient background
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "relative",
            mb: 10,
            bgcolor: "white",
          }}
        >
          {/* Profile Picture and Edit Icon */}
          <Box
            sx={{
              position: "absolute",
              bottom: "-75px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={userData.profile_image || "https://via.placeholder.com/150"}
                alt="Profile"
                sx={{
                  width: 150,
                  height: 150,
                  border: "5px solid white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.13)",
                  bgcolor: "#e3f2fd",
                }}
              />
              {isEditable && (
                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    bgcolor: "white",
                    color: "primary.main",
                    border: "2px solid #e3f2fd",
                    "&:hover": { bgcolor: "#f5f5f5" },
                  }}
                >
                  <CameraAlt />
                  <Input type="file" accept="image/*" onChange={handleImageChange} sx={{ display: "none" }} />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>

        {/* Profile Details and Actions */}
        <Box sx={{ p: { xs: 2, md: 4 }, pt: 2, textAlign: "center" }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
            {userData.first_name} {userData.last_name}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <FaBuilding size={20} style={{ marginBottom: -3 }} /> {userData.company_name}
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ my: 4, display: "flex", justifyContent: "center", gap: 2 }}>
            {!isEditable ? (
              <Button onClick={handleEdit} variant="contained" startIcon={<Edit />}>
                Edit Profile
              </Button>
            ) : (
              <Button onClick={handleSave} variant="contained" color="success" startIcon={<Edit />}>
                Save Changes
              </Button>
            )}
            <Button
              onClick={handleClickOpen}
              variant="outlined"
              color="primary"
              disabled={!isEditable}
              startIcon={<FaMapMarkedAlt />}
            >
              Add New Address
            </Button>
          </Box>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            {/* User Information Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2, p: 3, borderRadius: 3, minHeight: 340 }}>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FaBuilding size={22} /> Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      name="first_name"
                      value={userData.first_name || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      error={!!errors.first_name}
                      helperText={errors.first_name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      name="last_name"
                      value={userData.last_name || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      error={!!errors.last_name}
                      helperText={errors.last_name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={<span><MdEmail style={{ marginRight: 6, color: "#1976d2" }} />Email</span>}
                      name="email"
                      value={userData.email || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={<span><GiSmartphone style={{ marginRight: 6, color: "#1976d2" }} />Mobile Number</span>}
                      name="mobile_number"
                      value={userData.mobile_number || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      error={!!errors.mobile_number}
                      helperText={errors.mobile_number}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={<span><FaBuilding style={{ marginRight: 6, color: "#1976d2" }} />Company Name</span>}
                      name="company_name"
                      value={userData.company_name || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      error={!!errors.company_name}
                      helperText={errors.company_name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={<span><FaGlobeAmericas style={{ marginRight: 6, color: "#1976d2" }} />Website</span>}
                      name="website"
                      value={userData.website || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                    />
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Address Information Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2, p: 3, borderRadius: 3, minHeight: 340 }}>
                <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FaMapMarkedAlt size={22} /> Your Addresses
                </Typography>
                <Box sx={{ maxHeight: "400px", overflowY: "auto", pr: 1 }}>
                  {userData?.address_obj_list && userData.address_obj_list.length > 0 ? (
                    <RadioGroup
                      value={userData.address_obj_list.find(addr => addr.is_default)?.address_id || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const index = userData.address_obj_list.findIndex(addr => (addr.address_id || addr.id) === selectedId);
                        if (index !== -1) {
                          handleDefaultChange(index);
                        }
                      }}
                    >
                      {userData.address_obj_list.map((address, index) => (
                        <Card
                          key={address.address_id || index}
                          sx={{
                            mb: 2,
                            border: address.is_default ? "2.5px solid #1976d2" : "1px solid #e0e0e0",
                            borderRadius: 2,
                            background: address.is_default
                              ? "linear-gradient(90deg, #e3f2fd 60%, #bbdefb 100%)"
                              : "#fff",
                            boxShadow: address.is_default ? 3 : 1,
                            transition: "box-shadow 0.2s, border 0.2s",
                          }}
                        >
                          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
                                <GiMailbox size={18} style={{ color: "#1976d2" }} />
                                {address.street}, {address.city}, {address.state} - {address.zipCode}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FaGlobeAmericas size={15} style={{ color: "#1976d2" }} />
                                {address.country}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <GiSmartphone size={15} style={{ color: "#1976d2" }} />
                                {address.mobile_number}
                              </Typography>
                              <FormControlLabel
                                value={address.address_id || address.id}
                                control={<Radio disabled={!isEditable} />}
                                label="Default Address"
                                sx={{ mt: 1 }}
                              />
                            </Box>
                            {isEditable && (
                              <Tooltip title={address.is_default ? "Cannot delete default address" : "Delete Address"}>
                                <span>
                                  <IconButton
                                    color="error"
                                    onClick={() => address.address_id ? handleDelete(index, address.address_id, address.is_default) : handleRemove(index)}
                                    disabled={address.is_default}
                                  >
                                    <Delete />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </RadioGroup>
                  ) : (
                    <Box textAlign="center" p={4}>
                      <Typography variant="body1" color="text.secondary">
                        No addresses found. Please add at least one address.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Add New Address Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FaMapMarkedAlt size={22} /> Add New Address
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<span><GiMailbox style={{ marginRight: 6, color: "#1976d2" }} />Street</span>}
                name="street"
                value={newAddress.street}
                onChange={handleAddressChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<span><FaMapMarkedAlt style={{ marginRight: 6, color: "#1976d2" }} />City</span>}
                name="city"
                value={newAddress.city}
                onChange={handleAddressChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<span><FaMapMarkedAlt style={{ marginRight: 6, color: "#1976d2" }} />State</span>}
                name="state"
                value={newAddress.state}
                onChange={handleAddressChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<span><GiMailbox style={{ marginRight: 6, color: "#1976d2" }} />Zip Code</span>}
                name="zipCode"
                value={newAddress.zipCode}
                onChange={handleAddressChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={<span><FaGlobeAmericas style={{ marginRight: 6, color: "#1976d2" }} />Country</span>}
                name="country"
                value={newAddress.country}
                onChange={handleAddressChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={<span><GiSmartphone style={{ marginRight: 6, color: "#1976d2" }} />Mobile Number</span>}
                name="mobile_number"
                value={newAddress.mobile_number}
                onChange={handleAddressChange}
                fullWidth
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" startIcon={<Close />}>
            Cancel
          </Button>
          <Button onClick={handleAddAddress} variant="contained" color="primary" startIcon={<FaMapMarkedAlt />}>
            Add Address
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DealerProfile;