import React, { useEffect, useState } from "react";

import {

  Box,

  Button,

  TextField,

  Dialog,

  DialogContent,

  Table,

  TableBody,

  TableCell,

  TableContainer,

  TableHead,

  TableRow,

  MenuItem,

  Paper,

  Menu,

  IconButton,

  CircularProgress,

  Typography,

  InputAdornment,

  Breadcrumbs,

  Link,

  Tooltip,

  Tabs,

  Tab,

  DialogTitle,

  DialogActions,

} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import { MoreVert as MoreVertIcon } from "@mui/icons-material";

import AddNewDealer from "./AddNewDealer";

import axios from "axios";

import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";

import { styled } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

import BuyerDiscount from "./BuyerDiscount";

import Transactions from "./Transactions";

import EditIcon from "@mui/icons-material/Edit";

import DeleteIcon from "@mui/icons-material/Delete";



// Styled components

const StyledMenu = styled(Menu)(({ theme }) => ({

  "& .MuiMenu-paper": {

    padding: 0,

    maxHeight: "400px",

    width: "300px",

    overflowY: "hidden",

    fontSize: "12px",

    display: "flex",

    flexDirection: "column",

  },

  "& .MuiMenu-list": {

    paddingTop: 0,

    paddingBottom: 0,

    margin: "5px 0px",

  },

}));



const StyledPaper = styled(Paper)(({ theme }) => ({

  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",

  borderRadius: "12px",

  overflow: "hidden",

}));



// EditDealerDialog component

function EditDealerDialog({ open, onClose, dealer, onSave }) {

  const [form, setForm] = useState({

    _id: dealer?._id || dealer?.id || "",

    username: dealer?.username || "",

    email: dealer?.email || "",

    mobile_number: dealer?.contact || "",

  });

  const [saving, setSaving] = useState(false);



  useEffect(() => {

    setForm({

      _id: dealer?._id || dealer?.id || "",

      username: dealer?.username || "",

      email: dealer?.email || "",

      mobile_number: dealer?.contact || "",

    });

  }, [dealer]);



  const handleChange = (e) => {

    setForm({ ...form, [e.target.name]: e.target.value });

  };



  const handleSave = async () => {

    setSaving(true);

    try {

      await axios.patch(

        `${process.env.REACT_APP_IP}edit-dealer-details/`,

        form,

        { headers: { "Content-Type": "application/json" } }

      );

      onSave();

      onClose();

    } catch (error) {

      alert("Failed to update dealer");

    } finally {

      setSaving(false);

    }

  };



  return (

    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">

      <DialogContent sx={{ p: 4 }}>

        <Typography variant="h6" gutterBottom>Edit Buyer</Typography>

        <TextField

          margin="dense"

          label="Name"

          name="username"

          value={form.username}

          onChange={handleChange}

          fullWidth

        />

        <TextField

          margin="dense"

          label="Email"

          name="email"

          value={form.email}

          onChange={handleChange}

          fullWidth

        />

        <TextField

          margin="dense"

          label="Mobile Number"

          name="mobile_number"

          value={form.mobile_number}

          onChange={handleChange}

          fullWidth

        />

        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>

          <Button onClick={onClose} disabled={saving}>Cancel</Button>

          <Button

            variant="contained"

            onClick={handleSave}

            disabled={saving}

          >

            {saving ? <CircularProgress size={20} /> : "Save"}

          </Button>

        </Box>

      </DialogContent>

    </Dialog>

  );

}



function DealerList() {

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);



  const location = useLocation();

  const [loading, setLoading] = useState(true);

  const [dealers, setDealers] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const user = JSON.parse(localStorage.getItem("user"));

  const [currentColumn, setCurrentColumn] = useState("");

  const navigate = useNavigate();

  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  const [selectedTab, setSelectedTab] = useState(0);



  // Edit dialog state

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [selectedDealer, setSelectedDealer] = useState(null);



  // Delete dialog state

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [dealerToDelete, setDealerToDelete] = useState(null);

  const [deleting, setDeleting] = useState(false);



  useEffect(() => {

    if (selectedTab === 0) {

      fetchDealers();

    }

    // eslint-disable-next-line

  }, [user.manufacture_unit_id, sortConfig, selectedTab]);



  const fetchDealers = async () => {

    setLoading(true);

    const sort_by_value =

      sortConfig.direction === "asc" ? 1 : sortConfig.direction === "desc" ? -1 : "";

    try {

      const response = await axios.get(

        `${process.env.REACT_APP_IP}obtainDealerlist/`,

        {

          params: {

            manufacture_unit_id: user.manufacture_unit_id,

            sort_by: sortConfig.key,

            sort_by_value,

          },

        }

      );



      setDealers(

        response.data.data

          ? response.data.data.map((dealer) => ({

              id: dealer.id,

              _id: dealer.id, // for edit/delete dialog

              username: dealer.username || "N/A",

              email: dealer.email || "N/A",

              contact: dealer.mobile_number || "N/A",

              location1: dealer.address?.country || "N/A",

              location2: dealer.address?.city || "N/A",

              company_name: dealer.company_name || "N/A",

              website: dealer.website || "N/A",

              no_of_orders: dealer.no_of_orders || 0,

            }))

          : []

      );

    } catch (error) {

      console.error("Error fetching dealers:", error);

    } finally {

      setLoading(false);

    }

  };



  const handleRowClick = (id) => {

    navigate(`/manufacturer/dealer-details/${id}`);

  };



  const handleOpenMenu = (event, column) => {

    event.stopPropagation();

    setAnchorEl(event.currentTarget);

    setCurrentColumn(column);

  };



  const handleSelectSort = (key, direction) => {

    setSortConfig({ key, direction });

    setAnchorEl(null);

  };



  const handleCloseMenu = () => setAnchorEl(null);

  const reloadDealers = () => fetchDealers();



  const handleOpenExportMenu = (event) => {

    setExportAnchorEl(event.currentTarget);

  };



  const handleCloseExportMenu = () => {

    setExportAnchorEl(null);

  };



  const handleExport = async () => {

    const exportUrl = `${process.env.REACT_APP_IP}exportDealers/`;

    const params = {

      manufacture_unit_id: user.manufacture_unit_id,

    };



    try {

      const response = await axios.get(exportUrl, {

        params,

        responseType: "blob",

      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = blobUrl;

      link.setAttribute("download", `dealers.xlsx`);

      document.body.appendChild(link);

      link.click();

      link.remove();

    } catch (error) {

      console.error("Error exporting dealers:", error);

    }

    handleCloseExportMenu();

  };



  const columns = [

    { label: "Name", key: "username", sortable: true },

    { label: "Email", key: "email", sortable: true },

    { label: "Phone", key: "contact", sortable: false },

    { label: "Location", key: "location", sortable: false },

    { label: "Company Name", key: "company_name", sortable: true },

    { label: "Website", key: "website", sortable: false },

    { label: "No. of Orders", key: "no_of_orders", sortable: true },

    { label: "Edit", key: "edit", sortable: false },

  ];



  const filteredDealers = dealers.filter(

    (dealer) =>

      dealer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||

      dealer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||

      dealer.email.toLowerCase().includes(searchTerm.toLowerCase())

  );



  const breadcrumbs = [];



  const handleTabChange = (event, newValue) => {

    setSelectedTab(newValue);

  };



  // Edit dialog handlers

  const handleEditClick = (dealer) => {

    setSelectedDealer(dealer);

    setEditDialogOpen(true);

  };



  const handleEditDialogClose = () => {

    setEditDialogOpen(false);

    setSelectedDealer(null);

  };



  const handleEditSave = () => {

    fetchDealers();

  };



  // Delete dialog handlers

  const handleDeleteClick = (dealer) => {

    setDealerToDelete(dealer);

    setDeleteDialogOpen(true);

  };



  const handleDeleteDialogClose = () => {

    setDeleteDialogOpen(false);

    setDealerToDelete(null);

  };



  const handleDeleteConfirm = async () => {

    if (!dealerToDelete) return;

    setDeleting(true);

    try {

      await axios.delete(

        `${process.env.REACT_APP_IP}delete-dealer-details/`,

        {

          data: { _id: dealerToDelete._id },

          headers: { "Content-Type": "application/json" },

        }

      );

      fetchDealers();

      handleDeleteDialogClose();

    } catch (error) {

      alert("Failed to delete dealer");

    } finally {

      setDeleting(false);

    }

  };



  return (

    <Box className="p-4 sm:p-6 bg-gray-50 min-h-screen">

      <Box sx={{ mb: 3 }}>

        <Breadcrumbs

          separator={<NavigateNextIcon fontSize="small" />}

          aria-label="breadcrumb"

        >

          {breadcrumbs}

        </Breadcrumbs>

      </Box>



      <Paper

        elevation={3}

        sx={{

          marginBottom: "20px",

          boxShadow: "none",

          backgroundColor: "white",

          position: "sticky",

          top: "56px",

          padding: "10px 0px",

          zIndex: 9,

        }}

      >

        <Tabs

          value={selectedTab}

          onChange={handleTabChange}

          textColor="primary"

          indicatorColor="primary"

          variant="fullWidth"

          sx={{ textTransform: "capitalize" }}

        >

          <Tab sx={{ textTransform: "capitalize" }} label="Buyer Management" />

          <Tab sx={{ textTransform: "capitalize" }} label="Buyer Discount" />

          <Tab sx={{ textTransform: "capitalize" }} label="Transactions" />

        </Tabs>

      </Paper>



      {selectedTab === 0 && (

        <>

          <StyledPaper className="rounded-xl overflow-hidden mb-6 p-4 md:p-6">

            <Box className="flex flex-col sm:flex-row justify-between items-center gap-4">

              <Box className="flex flex-col sm:flex-row items-center justify-start gap-4 w-full">

                <Typography variant="h6" className="font-medium text-gray-700">

                  Buyer Management

                </Typography>

              </Box>

              <Box className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full sm:w-auto">

                <TextField

                  variant="outlined"

                  value={searchTerm}

                  size="small"

                  onChange={(e) => setSearchTerm(e.target.value)}

                  placeholder="Search by Name, Company, or Email"

                  className="w-full sm:w-80"

                  InputProps={{

                    startAdornment: (

                      <InputAdornment position="start">

                        <SearchIcon className="text-gray-400" />

                      </InputAdornment>

                    ),

                  }}

                  onKeyPress={(event) => {

                    if (

                      event.key === " " &&

                      (searchTerm.trim() === "" ||

                        searchTerm.startsWith(" ") ||

                        searchTerm.endsWith(" "))

                    ) {

                      event.preventDefault();

                    }

                  }}

                />

                <Tooltip title="Export" arrow>

                  <IconButton onClick={handleOpenExportMenu} sx={{ padding: 0 }}>

                    <FileUploadOutlinedIcon

                      sx={{

                        fontSize: "40px",

                        color: "#1976d2",

                      }}

                    />

                  </IconButton>

                </Tooltip>

                <Button

                  variant="contained"

                  onClick={handleOpen}

                  className="bg-[#2874f0] hover:bg-[#2455b5] capitalize rounded-lg shadow-none flex items-center gap-1"

                  sx={{ minWidth: "150px" }}

                >

                  <AddIcon />

                  Add Buyer

                </Button>

                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">

                  <DialogContent sx={{ p: 4 }}>

                    <AddNewDealer reloadDealers={reloadDealers} onClose={handleClose} />

                  </DialogContent>

                </Dialog>

              </Box>

            </Box>

          </StyledPaper>



          <TableContainer component={StyledPaper} sx={{ maxHeight: 520 }}>

            <Table stickyHeader className="min-w-full">

              <TableHead>

                <TableRow>

                  {columns.map((column) => (

                    <TableCell

                      key={column.key}

                      align="left"

                      className="bg-gray-100 text-gray-600 font-semibold px-4 py-3"

                      sx={{

                        position: "sticky",

                        top: 0,

                        zIndex: 2,

                      }}

                    >

                      <Box className="flex items-center justify-start gap-1">

                        <span className="whitespace-nowrap">{column.label}</span>

                        {column.sortable && (

                          <IconButton onClick={(e) => handleOpenMenu(e, column.key)} size="small">

                            <MoreVertIcon className="text-gray-500 w-4 h-4" />

                          </IconButton>

                        )}

                      </Box>

                    </TableCell>

                  ))}

                  {/* Actions column */}

                  <TableCell

                    align="left"

                    className="bg-gray-100 text-gray-600 font-semibold px-4 py-3"

                    sx={{

                      position: "sticky",

                      top: 0,

                      zIndex: 2,

                    }}

                  >

                    Actions

                  </TableCell>

                </TableRow>

              </TableHead>



              <TableBody>

                {loading ? (

                  <TableRow>

                    <TableCell colSpan={columns.length + 1} align="center" className="py-12">

                      <CircularProgress className="text-blue-500" />

                    </TableCell>

                  </TableRow>

                ) : filteredDealers.length > 0 ? (

                  filteredDealers.map((dealer) => (

                    <TableRow

                      key={dealer.id}

                      className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"

                      onClick={() => handleRowClick(dealer.id)}

                    >

                      <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">

                        {dealer.username}

                      </TableCell>

                      <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">

                        {dealer.email}

                      </TableCell>

                      <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">

                        {dealer.contact}

                      </TableCell>

                      <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">

                        {dealer.location1 !== "N/A" && dealer.location2 !== "N/A"

                          ? `${dealer.location2}, ${dealer.location1}`

                          : "N/A"}

                      </TableCell>

                      <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">

                        {dealer.company_name}

                      </TableCell>

                      <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">

                        {dealer.website}

                      </TableCell>

                      <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">

                        <Box

                          sx={{

                            backgroundColor: dealer.no_of_orders > 0 ? "#e3f2fd" : "#f5f5f5",

                            color: dealer.no_of_orders > 0 ? "#1976d2" : "#757575",

                            padding: "4px 8px",

                            borderRadius: "12px",

                            fontWeight: "500",

                            display: "inline-block",

                            minWidth: "24px",

                            textAlign: "center",

                          }}

                        >

                          {dealer.no_of_orders}

                        </Box>

                      </TableCell>

                      {/* Edit Button */}

                      <TableCell align="left" className="text-sm text-gray-800 px-4 py-3" onClick={e => e.stopPropagation()}>

                        <Tooltip title="Edit Buyer">

                          <IconButton onClick={() => handleEditClick(dealer)}>

                            <EditIcon />

                          </IconButton>

                        </Tooltip>

                      </TableCell>

                      {/* Delete Button */}

                      <TableCell align="left" className="text-sm text-gray-800 px-4 py-3" onClick={e => e.stopPropagation()}>

                        <Tooltip title="Delete Buyer">

                          <IconButton color="error" onClick={() => handleDeleteClick(dealer)}>

                            <DeleteIcon />

                          </IconButton>

                        </Tooltip>

                      </TableCell>

                    </TableRow>

                  ))

                ) : (

                  <TableRow>

                    <TableCell colSpan={columns.length + 1} align="center" className="py-12">

                      <span className="text-gray-500 text-lg">No Buyers Found</span>

                    </TableCell>

                  </TableRow>

                )}

              </TableBody>

            </Table>

          </TableContainer>

        </>

      )}



      {selectedTab === 1 && <BuyerDiscount />}

      {selectedTab === 2 && <Transactions />}



      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>

        {currentColumn === "username" && (

          <>

            <MenuItem onClick={() => handleSelectSort("username", "asc")}>Sort A-Z</MenuItem>

            <MenuItem onClick={() => handleSelectSort("username", "desc")}>Sort Z-A</MenuItem>

          </>

        )}

        {currentColumn === "email" && (

          <>

            <MenuItem onClick={() => handleSelectSort("email", "asc")}>Sort A-Z</MenuItem>

            <MenuItem onClick={() => handleSelectSort("email", "desc")}>Sort Z-A</MenuItem>

          </>

        )}

        {currentColumn === "company_name" && (

          <>

            <MenuItem onClick={() => handleSelectSort("company_name", "asc")}>Sort A-Z</MenuItem>

            <MenuItem onClick={() => handleSelectSort("company_name", "desc")}>Sort Z-A</MenuItem>

          </>

        )}

        {currentColumn === "no_of_orders" && (

          <>

            <MenuItem onClick={() => handleSelectSort("no_of_orders", "asc")}>

              Sort Low to High

            </MenuItem>

            <MenuItem onClick={() => handleSelectSort("no_of_orders", "desc")}>

              Sort High to Low

            </MenuItem>

          </>

        )}

      </Menu>



      <Menu

        anchorEl={exportAnchorEl}

        open={Boolean(exportAnchorEl)}

        onClose={handleCloseExportMenu}

      >

        <MenuItem onClick={handleExport}>Export All Buyers</MenuItem>

      </Menu>



      {/* Edit Dealer Dialog */}

      <EditDealerDialog

        open={editDialogOpen}

        onClose={handleEditDialogClose}

        dealer={selectedDealer}

        onSave={handleEditSave}

      />



      {/* Delete Dealer Dialog */}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} fullWidth maxWidth="xs">

        <DialogTitle>Delete Buyer</DialogTitle>

        <DialogContent>

          <Typography>

            Are you sure you want to delete this buyer? This action cannot be undone.

          </Typography>

        </DialogContent>

        <DialogActions>

          <Button onClick={handleDeleteDialogClose} disabled={deleting}>Cancel</Button>

          <Button

            variant="contained"

            color="error"

            onClick={handleDeleteConfirm}

            disabled={deleting}

          >

            {deleting ? <CircularProgress size={20} /> : "Delete"}

          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );

}



export default DealerList;

