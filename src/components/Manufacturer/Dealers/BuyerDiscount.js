import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";

// Placeholder data
const mockDiscounts = [
  { id: 1, buyerName: "Global Sourcing Inc.", discount: "5%", type: "Volume", startDate: "2024-01-01", endDate: "2024-12-31" },
  { id: 2, buyerName: "Northstar Industries", discount: "10%", type: "Promotional", startDate: "2025-03-15", endDate: "2025-04-15" },
  { id: 3, buyerName: "Tech Solutions Co.", discount: "7.5%", type: "Tiered", startDate: "2024-11-01", endDate: "2025-10-31" },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  borderRadius: "12px",
  overflow: "hidden",
}));

function BuyerDiscount() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [discounts, setDiscounts] = useState(mockDiscounts);

  const filteredDiscounts = discounts.filter(
    (discount) =>
      discount.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discount.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { label: "Buyer Name" },
    { label: "Discount" },
    { label: "Type" },
    { label: "Start Date" },
    { label: "End Date" },
  ];

  return (
    <Box className="p-4 sm:p-6">
      <StyledPaper className="mb-6 p-4 md:p-6">
        <Box className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Typography variant="h6" className="font-medium text-gray-700">
            Buyer Discount Management
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full sm:w-auto">
            <TextField
              variant="outlined"
              value={searchTerm}
              size="small"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search discounts"
              className="w-full sm:w-80"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-gray-400" />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Export" arrow>
              <IconButton sx={{ padding: 0 }}>
                <FileUploadOutlinedIcon sx={{ fontSize: "40px", color: "#1976d2" }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add New Discount" arrow>
              <IconButton sx={{ padding: 0 }}>
                <AddIcon sx={{ fontSize: "40px", color: "#4caf50" }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </StyledPaper>

      <TableContainer component={StyledPaper} sx={{ maxHeight: 520 }}>
        <Table stickyHeader className="min-w-full">
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  align="left"
                  className="bg-gray-100 text-gray-600 font-semibold px-4 py-3"
                  sx={{ top: 0, zIndex: 2 }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" className="py-12">
                  <CircularProgress className="text-blue-500" />
                </TableCell>
              </TableRow>
            ) : filteredDiscounts.length > 0 ? (
              filteredDiscounts.map((discount) => (
                <TableRow key={discount.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{discount.buyerName}</TableCell>
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{discount.discount}</TableCell>
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{discount.type}</TableCell>
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{discount.startDate}</TableCell>
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{discount.endDate}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" className="py-12">
                  <span className="text-gray-500 text-lg">No Discounts Found</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default BuyerDiscount;