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
import { styled } from "@mui/material/styles";

// Placeholder data
const mockTransactions = [
  { id: 101, buyerName: "Global Sourcing Inc.", amount: "$5,200", status: "Completed", date: "2025-08-20" },
  { id: 102, buyerName: "Northstar Industries", amount: "$1,850", status: "Pending", date: "2025-08-22" },
  { id: 103, buyerName: "Tech Solutions Co.", amount: "$12,400", status: "Completed", date: "2025-08-21" },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
  borderRadius: "12px",
  overflow: "hidden",
}));

function Transactions() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState(mockTransactions);

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { label: "Transaction ID" },
    { label: "Buyer Name" },
    { label: "Amount" },
    { label: "Status" },
    { label: "Date" },
  ];

  return (
    <Box className="p-4 sm:p-6">
      <StyledPaper className="mb-6 p-4 md:p-6">
        <Box className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Typography variant="h6" className="font-medium text-gray-700">
            Transaction History
          </Typography>
          <Box className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full sm:w-auto">
            <TextField
              variant="outlined"
              value={searchTerm}
              size="small"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions"
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
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-blue-50 transition-colors duration-150">
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{transaction.id}</TableCell>
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{transaction.buyerName}</TableCell>
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{transaction.amount}</TableCell>
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{transaction.status}</TableCell>
                  <TableCell align="left" className="text-sm text-gray-800 px-4 py-3">{transaction.date}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" className="py-12">
                  <span className="text-gray-500 text-lg">No Transactions Found</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Transactions;