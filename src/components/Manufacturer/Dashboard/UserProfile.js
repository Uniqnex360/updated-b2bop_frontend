import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Input,
  Paper,
  Tooltip,
  FormControlLabel,
  Radio,
  IconButton,
  Avatar,
  Divider,
  Chip,
  Fade,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { CameraAlt, Save, Delete, Edit, Cancel, Add } from "@mui/icons-material";
import axios from "axios";
import DEFAULT_LOGO from "../../assets/user-logo.jpg";
import "react-toastify/dist/ReactToastify.css";

// 3D icons from react-icons
import { FaBuilding, FaMapMarkedAlt, FaGlobeAmericas, FaLaptopCode } from "react-icons/fa";
import { GiMailbox, GiSmartphone, GiBank } from "react-icons/gi";
import { MdEmail, MdAccountBalance, MdCode } from "react-icons/md";
import { BsBank, BsFillPeopleFill } from "react-icons/bs";

const UserProfile = () => {
  const [userImage, setUserImage] = useState(null);
  const [bankDetailsList, setBankDetailsList] = useState([]);
  const [imageError, setImageError] = useState("");
  const [originalUserDetails, setOriginalUserDetails] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    company_name: "",
    website: "", // Added for the new UI
  });
  const [userDetails, setUserDetails] = useState({ ...originalUserDetails });
  const [defaultAddressIndex, setDefaultAddressIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [warehouse, setWarehouse] = useState([]);
  const [isEditable, setIsEditable] = useState(false);
  const [defaultwarehouseIndex, setDefaultwarehouseIndex] = useState(0);
  const [addresses, setAddresses] = useState([]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem("user");
      const userId = userData ? JSON.parse(userData).id : "";
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainUserDetailsForProfile/?user_id=${userId}`
      );
      const data = response.data?.data || {};
      setUserDetails(data.user_obj || {});
      const bankDetails = data.user_obj?.bank_details_obj_list || [];
      setBankDetailsList(bankDetails);
      const warehouseList = data.user_obj?.ware_house_obj_list || [];
      setWarehouse(warehouseList);
      const addressList = data.user_obj?.address_obj_list || [];
      const defaultAddressIndex = addressList.findIndex((address) => address.is_default);
      setAddresses(addressList);
      setDefaultAddressIndex(defaultAddressIndex !== -1 ? defaultAddressIndex : null);
    } catch (err) {
      console.error("Error fetching user details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const toggleEdit = () => setIsEditable(!isEditable);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...userDetails,
      [name]: value,
    });
  };

  const handleBankDetailsChange = (index, field, value) => {
    setBankDetailsList((prev) => {
      const updatedList = [...prev];
      updatedList[index][field] = value;
      return updatedList;
    });
  };

  const handleRemoveBankDetails = async (index, bankId, isDefault) => {
    const userData = localStorage.getItem("user");
    const userId = userData ? JSON.parse(userData).id : "";
    try {
      const deleteResponse = await axios.post(
        `${process.env.REACT_APP_IP}deleteBankDetails/`,
        {
          bank_id: bankId,
          user_id: userId,
          is_default: isDefault,
        }
      );
      if (deleteResponse.data.message === "success") {
        setBankDetailsList((prev) => prev.filter((_, idx) => idx !== index));
        fetchUserDetails();
      }
    } catch (error) {
      console.error("Error deleting bank details:", error);
    }
  };

  const handleAddBankDetails = () => {
    setBankDetailsList((prevBankDetails) => [
      ...prevBankDetails,
      {
        bank_name: "",
        account_number: "",
        ifsc_code: "",
        iban: "",
        swift_code: "",
        branch: "",
        currency: "",
        is_default: prevBankDetails.length === 0,
        isEditing: true,
      },
    ]);
  };

  const handleDefaultBankDetails = (index) => {
    setBankDetailsList((prev) =>
      prev.map((bank, i) => ({
        ...bank,
        is_default: i === index,
      }))
    );
  };

  const handleImageToBase64 = (file, setImageCallback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageCallback(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleUserImageChange = (event) => {
    const file = event.target.files[0];
    setImageError("");
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      setImageError("Please upload a valid image (JPG, JPEG, PNG, or SVG).");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setImageError("Please upload an image smaller than 1MB.");
      return;
    }
    handleImageToBase64(file, setUserImage);
  };

  const handleAddressChange = (index, event) => {
    const { name, value } = event.target;
    setAddresses((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleDefaultAddressChange = (index) => {
    setAddresses((prev) =>
      prev.map((address, idx) => ({
        ...address,
        is_default: idx === index,
      }))
    );
    setDefaultAddressIndex(index);
  };

  const handleAddAddress = () => {
    setAddresses((prev) => [
      ...prev,
      {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        is_default: prev.length === 0,
        isEditing: true,
      },
    ]);
  };

  const handleRemoveAddress = async (index, addressId, isDefault, address) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
    const userData = localStorage.getItem("user");
    const userId = userData ? JSON.parse(userData).id : "";
    try {
      await axios.post(`${process.env.REACT_APP_IP}deleteAddress/`, {
        address_id: addressId,
        user_id: userId,
        is_default: isDefault,
        ware_house: address,
      });
      fetchUserDetails();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleSaveAddress = (index) => {
    setAddresses((prev) => {
      const updated = [...prev];
      updated[index].isEditing = false;
      return updated;
    });
  };

  const handleCancelEditAddress = (index) => {
    setAddresses((prev) => {
      const updated = [...prev];
      updated[index].isEditing = false;
      return updated;
    });
  };

  const handleEditAddress = (index) => {
    setAddresses((prev) => {
      const updated = [...prev];
      updated[index].isEditing = true;
      return updated;
    });
  };

  const handleWareHouseChange = (index, e) => {
    const { name, value } = e.target;
    setWarehouse((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleAddwarehouse = () => {
    setWarehouse((prev) => [
      ...prev,
      {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        isEditing: true,
        is_default: prev.length === 0,
      },
    ]);
  };

  const handleEditWarehouse = (index) => {
    setWarehouse((prev) => {
      const updated = [...prev];
      updated[index].isEditing = true;
      return updated;
    });
  };

  const handleSaveWarehouse = (index) => {
    setWarehouse((prev) => {
      const updated = [...prev];
      updated[index].isEditing = false;
      return updated;
    });
  };

  const handleRemovewarehouse = async (
    index,
    addressId,
    isDefault,
    warehouseObj
  ) => {
    const userData = localStorage.getItem("user");
    const userId = userData ? JSON.parse(userData).id : "";
    try {
      await axios.post(`${process.env.REACT_APP_IP}deleteAddress/`, {
        address_id: addressId,
        user_id: userId,
        is_default: isDefault,
        ware_house: warehouseObj,
      });
      setWarehouse((prev) => prev.filter((_, i) => i !== index));
      fetchUserDetails();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
    }
  };

  const handleCancelEditWarehouse = (index) => {
    setWarehouse((prev) => {
      const updated = [...prev];
      updated[index].isEditing = false;
      return updated;
    });
  };

  const handleDefaultwarehouseChange = (index) => {
    setWarehouse((prev) =>
      prev.map((wh, i) => ({
        ...wh,
        is_default: i === index,
      }))
    );
    setDefaultwarehouseIndex(index);
  };

  const handleSave = async () => {
    setLoading(true);
    const userData = localStorage.getItem("user");
    const userId = userData ? JSON.parse(userData).id : "";
    const user_obj = {
      first_name: userDetails.first_name,
      last_name: userDetails.last_name,
      email: userDetails.email,
      mobile_number: userDetails.mobile_number,
      company_name: userDetails.company_name,
      website: userDetails.website,
      profile_image: userImage || userDetails.profile_image,
    };
    const address_obj_list = addresses
      .filter(
        (address) =>
          address.street ||
          address.city ||
          address.state ||
          address.zipCode ||
          address.country
      )
      .map((address, index) => ({
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        country: address.country || "",
        is_default: index === defaultAddressIndex,
        id: address.address_id || undefined,
      }));
    const ware_house_obj_list = warehouse
      .filter(
        (address) =>
          address.street ||
          address.city ||
          address.state ||
          address.zipCode ||
          address.country
      )
      .map((address, index) => ({
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        country: address.country || "",
        is_default: index === defaultwarehouseIndex,
        id: address.address_id || undefined,
      }));
    const bank_details_obj_list = bankDetailsList
      .map((bankDetail, index) => ({
        account_number: bankDetail.account_number || "",
        bank_name: bankDetail.bank_name || "",
        branch: bankDetail.branch || "",
        iban: bankDetail.iban || "",
        ifsc_code: bankDetail.ifsc_code || "",
        swift_code: bankDetail.swift_code || "",
        images: bankDetail.images || [],
        is_default: bankDetail.is_default,
        bank_id: bankDetail.bank_id || undefined,
      }))
      .filter(
        (bankDetail) =>
          bankDetail.account_number ||
          bankDetail.bank_name ||
          bankDetail.branch ||
          bankDetail.iban ||
          bankDetail.ifsc_code ||
          bankDetail.swift_code ||
          (bankDetail.images && bankDetail.images.length > 0)
      );
    const payload = {
      user_id: userId,
      user_obj,
      address_obj_list,
      bank_details_obj_list,
      ware_house_obj_list,
    };
    try {
      await axios.post(`${process.env.REACT_APP_IP}updateUserProfile/`, payload);
      fetchUserDetails();
      setIsEditable(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankDetails = (index) => {
    setBankDetailsList((prev) => {
      const updated = [...prev];
      updated[index].isEditing = false;
      return updated;
    });
  };

  const handleEditBankDetails = (index) => {
    setBankDetailsList((prev) => {
      const updated = [...prev];
      updated[index].isEditing = true;
      return updated;
    });
  };

  const handleCancelEditBankDetails = (index) => {
    setBankDetailsList((prev) => {
      const updated = [...prev];
      updated[index].isEditing = false;
      return updated;
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Fade in={loading} unmountOnExit>
          <Typography variant="h6" color="primary">
            Loading...
          </Typography>
        </Fade>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.200",
        p: { xs: 1, md: 4 },
      }}
    >
      <Box
        sx={{
          bgcolor: "white",
          maxWidth: "980px",
          mx: "auto",
          boxShadow: 4,
          borderRadius: 3,
          mt: 4,
          overflow: "hidden",
        }}
      >
        {/* Profile Header Section */}
        <Box
          sx={{
            height: "200px",
            background: `linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            position: "relative",
            mb: 10,
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
                src={userImage || userDetails.profile_image || DEFAULT_LOGO}
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
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleUserImageChange}
                    sx={{ display: "none" }}
                  />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>

        {/* Profile Details and Actions */}
        <Box sx={{ p: { xs: 2, md: 4 }, pt: 2, textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            {userDetails.first_name} {userDetails.last_name}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <FaBuilding size={20} style={{ marginBottom: -3 }} />{" "}
            {userDetails.company_name}
          </Typography>
          {/* Action Buttons */}
          <Box sx={{ my: 4, display: "flex", justifyContent: "center", gap: 2 }}>
            {!isEditable ? (
              <Button
                onClick={toggleEdit}
                variant="contained"
                startIcon={<Edit />}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                variant="contained"
                color="success"
                startIcon={<Save />}
              >
                Save Changes
              </Button>
            )}
          </Box>

          <Grid container spacing={4} sx={{ mt: 2 }}>
            {/* User Information Card */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ boxShadow: 2, p: 3, borderRadius: 3, minHeight: 340 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <FaBuilding size={22} /> Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      name="first_name"
                      value={userDetails.first_name || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      name="last_name"
                      value={userDetails.last_name || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={
                        <span>
                          <MdEmail style={{ marginRight: 6, color: "#1976d2" }} />
                          Email
                        </span>
                      }
                      name="email"
                      value={userDetails.email || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={
                        <span>
                          <GiSmartphone
                            style={{ marginRight: 6, color: "#1976d2" }}
                          />
                          Mobile Number
                        </span>
                      }
                      name="mobile_number"
                      value={userDetails.mobile_number || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={
                        <span>
                          <BsFillPeopleFill
                            style={{ marginRight: 6, color: "#1976d2" }}
                          />
                          Company Name
                        </span>
                      }
                      name="company_name"
                      value={userDetails.company_name || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label={
                        <span>
                          <FaLaptopCode
                            style={{ marginRight: 6, color: "#1976d2" }}
                          />
                          Website
                        </span>
                      }
                      name="website"
                      value={userDetails.website || ""}
                      onChange={handleChange}
                      fullWidth
                      disabled={!isEditable}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Address Information Card */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ boxShadow: 2, p: 3, borderRadius: 3, minHeight: 340 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#222", flexGrow: 1 }}
                  >
                    <FaMapMarkedAlt size={22} style={{ marginRight: 8 }} /> Your Addresses
                  </Typography>
                  {isEditable && (
                    <Button
                      onClick={handleAddAddress}
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                    >
                      Add Address
                    </Button>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TableContainer sx={{ maxHeight: 250, overflowY: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Address</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {addresses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} align="center">
                            No addresses added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        addresses.map((addressItem, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&.MuiTableRow-root": {
                                bgcolor: addressItem.is_default
                                  ? "#e3f2fd"
                                  : "inherit",
                              },
                              borderLeft: addressItem.is_default
                                ? "4px solid #1976d2"
                                : "none",
                            }}
                          >
                            {addressItem.isEditing ? (
                              <TableCell>
                                <Grid container spacing={1}>
                                  {[
                                    "street",
                                    "city",
                                    "state",
                                    "zipCode",
                                    "country",
                                  ].map((field) => (
                                    <Grid item xs={12} sm={6} key={field}>
                                      <TextField
                                        fullWidth
                                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                                        name={field}
                                        value={addressItem[field] || ""}
                                        onChange={(e) => handleAddressChange(index, e)}
                                        size="small"
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </TableCell>
                            ) : (
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {`${addressItem.street}, ${addressItem.city}, ${addressItem.state}, ${addressItem.zipCode}, ${addressItem.country}`}
                                  {addressItem.is_default && (
                                    <Chip
                                      label="Default"
                                      color="primary"
                                      size="small"
                                      sx={{ ml: 1, fontWeight: 600 }}
                                    />
                                  )}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                {isEditable && (
                                  <>
                                    {addressItem.isEditing ? (
                                      <>
                                        <Tooltip title="Save">
                                          <IconButton
                                            onClick={() => handleSaveAddress(index)}
                                            sx={{ color: "green" }}
                                          >
                                            <Save />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel">
                                          <IconButton
                                            onClick={() => handleCancelEditAddress(index)}
                                            sx={{ color: "gray" }}
                                          >
                                            <Cancel />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    ) : (
                                      <>
                                        <Tooltip title="Set as Default">
                                          <IconButton
                                            onClick={() =>
                                              handleDefaultAddressChange(index)
                                            }
                                            color={
                                              addressItem.is_default ? "primary" : "default"
                                            }
                                          >
                                            <Radio checked={addressItem.is_default} />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                          <IconButton
                                            onClick={() => handleEditAddress(index)}
                                            sx={{ color: "blue" }}
                                          >
                                            <Edit />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                          <IconButton
                                            onClick={() =>
                                              handleRemoveAddress(
                                                index,
                                                addressItem.address_id,
                                                addressItem.is_default,
                                                addressItem
                                              )
                                            }
                                            sx={{ color: "red" }}
                                          >
                                            <Delete />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    )}
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Warehouse Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ boxShadow: 2, p: 3, borderRadius: 3, minHeight: 340 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#222", flexGrow: 1 }}
                  >
                    <GiMailbox size={22} style={{ marginRight: 8 }} /> Warehouse Address
                  </Typography>
                  {isEditable && (
                    <Button
                      onClick={handleAddwarehouse}
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                    >
                      Add Warehouse
                    </Button>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TableContainer sx={{ maxHeight: 250, overflowY: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Address</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {warehouse.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} align="center">
                            No warehouse addresses added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        warehouse.map((warehouseItem, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&.MuiTableRow-root": {
                                bgcolor: warehouseItem.is_default
                                  ? "#e3f2fd"
                                  : "inherit",
                              },
                              borderLeft: warehouseItem.is_default
                                ? "4px solid #1976d2"
                                : "none",
                            }}
                          >
                            {warehouseItem.isEditing ? (
                              <TableCell>
                                <Grid container spacing={1}>
                                  {[
                                    "street",
                                    "city",
                                    "state",
                                    "zipCode",
                                    "country",
                                  ].map((field) => (
                                    <Grid item xs={12} sm={6} key={field}>
                                      <TextField
                                        fullWidth
                                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                                        name={field}
                                        value={warehouseItem[field] || ""}
                                        onChange={(e) =>
                                          handleWareHouseChange(index, e)
                                        }
                                        size="small"
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </TableCell>
                            ) : (
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {`${warehouseItem.street}, ${warehouseItem.city}, ${warehouseItem.state}, ${warehouseItem.zipCode}, ${warehouseItem.country}`}
                                  {warehouseItem.is_default && (
                                    <Chip
                                      label="Default"
                                      color="primary"
                                      size="small"
                                      sx={{ ml: 1, fontWeight: 600 }}
                                    />
                                  )}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell>
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                {isEditable && (
                                  <>
                                    {warehouseItem.isEditing ? (
                                      <>
                                        <Tooltip title="Save">
                                          <IconButton
                                            onClick={() => handleSaveWarehouse(index)}
                                            sx={{ color: "green" }}
                                          >
                                            <Save />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Cancel">
                                          <IconButton
                                            onClick={() =>
                                              handleCancelEditWarehouse(index)
                                            }
                                            sx={{ color: "gray" }}
                                          >
                                            <Cancel />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    ) : (
                                      <>
                                        <Tooltip title="Set as Default">
                                          <IconButton
                                            onClick={() =>
                                              handleDefaultwarehouseChange(index)
                                            }
                                            color={
                                              warehouseItem.is_default
                                                ? "primary"
                                                : "default"
                                            }
                                          >
                                            <Radio checked={warehouseItem.is_default} />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                          <IconButton
                                            onClick={() => handleEditWarehouse(index)}
                                            sx={{ color: "blue" }}
                                          >
                                            <Edit />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                          <IconButton
                                            onClick={() =>
                                              handleRemovewarehouse(
                                                index,
                                                warehouseItem.address_id,
                                                warehouseItem.is_default,
                                                warehouseItem
                                              )
                                            }
                                            sx={{ color: "red" }}
                                          >
                                            <Delete />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    )}
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Bank Details Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 2, borderRadius: 4, bgcolor: "#fff", boxShadow: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#222", flexGrow: 1 }}
                  >
                    <GiBank size={22} style={{ marginRight: 8 }} /> Bank Details
                  </Typography>
                  {isEditable && (
                    <Button
                      onClick={handleAddBankDetails}
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                    >
                      Add Bank Details
                    </Button>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Bank Name</TableCell>
                        <TableCell>Account No.</TableCell>
                        <TableCell>IFSC Code</TableCell>
                        <TableCell>Branch</TableCell>
                        <TableCell>SWIFT Code</TableCell>
                        <TableCell>IBAN</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bankDetailsList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No bank details added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bankDetailsList.map((bankDetails, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              "&.MuiTableRow-root": {
                                bgcolor: bankDetails.is_default ? "#e3f2fd" : "inherit",
                              },
                              borderLeft: bankDetails.is_default
                                ? "4px solid #1976d2"
                                : "none",
                            }}
                          >
                            {bankDetails.isEditing ? (
                              <>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    name="bank_name"
                                    value={bankDetails.bank_name || ""}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        index,
                                        "bank_name",
                                        e.target.value
                                      )
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    name="account_number"
                                    value={bankDetails.account_number || ""}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        index,
                                        "account_number",
                                        e.target.value
                                      )
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    name="ifsc_code"
                                    value={bankDetails.ifsc_code || ""}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        index,
                                        "ifsc_code",
                                        e.target.value
                                      )
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    name="branch"
                                    value={bankDetails.branch || ""}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        index,
                                        "branch",
                                        e.target.value
                                      )
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    name="swift_code"
                                    value={bankDetails.swift_code || ""}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        index,
                                        "swift_code",
                                        e.target.value
                                      )
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    name="iban"
                                    value={bankDetails.iban || ""}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        index,
                                        "iban",
                                        e.target.value
                                      )
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    name="currency"
                                    value={bankDetails.currency || ""}
                                    onChange={(e) =>
                                      handleBankDetailsChange(
                                        index,
                                        "currency",
                                        e.target.value
                                      )
                                    }
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: "flex", gap: 0.5 }}>
                                    <Tooltip title="Save">
                                      <IconButton
                                        onClick={() => handleSaveBankDetails(index)}
                                        sx={{ color: "green" }}
                                      >
                                        <Save />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Cancel">
                                      <IconButton
                                        onClick={() => handleCancelEditBankDetails(index)}
                                        sx={{ color: "gray" }}
                                      >
                                        <Cancel />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    {bankDetails.bank_name}
                                    {bankDetails.is_default && (
                                      <Chip label="Default" color="primary" size="small" />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell>{bankDetails.account_number}</TableCell>
                                <TableCell>{bankDetails.ifsc_code}</TableCell>
                                <TableCell>{bankDetails.branch}</TableCell>
                                <TableCell>{bankDetails.swift_code}</TableCell>
                                <TableCell>{bankDetails.iban}</TableCell>
                                <TableCell>{bankDetails.currency}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: "flex", gap: 0.5 }}>
                                    {isEditable && (
                                      <>
                                        <Tooltip title="Set as Default">
                                          <IconButton
                                            onClick={() =>
                                              handleDefaultBankDetails(index)
                                            }
                                            color={
                                              bankDetails.is_default
                                                ? "primary"
                                                : "default"
                                            }
                                          >
                                            <Radio checked={bankDetails.is_default} />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit">
                                          <IconButton
                                            onClick={() =>
                                              handleEditBankDetails(index)
                                            }
                                            sx={{ color: "blue" }}
                                          >
                                            <Edit />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                          <IconButton
                                            onClick={() =>
                                              handleRemoveBankDetails(
                                                index,
                                                bankDetails.bank_id,
                                                bankDetails.is_default
                                              )
                                            }
                                            sx={{ color: "red" }}
                                          >
                                            <Delete />
                                          </IconButton>
                                        </Tooltip>
                                      </>
                                    )}
                                  </Box>
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default UserProfile;