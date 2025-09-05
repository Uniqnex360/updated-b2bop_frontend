import React, { useState } from 'react';

import {

  Box,

  Button,

  TextField,

  Typography,

  Paper,

  IconButton,

  Divider,

  CircularProgress,

  Alert,

  AlertTitle

} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import CancelIcon from '@mui/icons-material/Cancel';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import ValidatePopup from './ValidatePopup'; // Duplicate products popup
 
function Import() {

  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const [validationMessage, setValidationMessage] = useState('');

  const [canSubmit, setCanSubmit] = useState(false);

  const [xlData, setXlData] = useState(null);

  const [duplicateProducts, setDuplicateProducts] = useState([]);

  const [openPopup, setOpenPopup] = useState(false);
 
  const handleFileChange = (event) => {

    const selectedFile = event.target.files[0];

    if (selectedFile) {

      const fileType = selectedFile.type;

      const fileName = selectedFile.name;
 
      if (!isValidExcelFile(fileType, fileName)) {

        setError('Please select a valid Excel file (.xls or .xlsx)');

        setFile(null);

      } else {

        setError('');

        setFile(selectedFile);

      }

    }

  };
 
  const isValidExcelFile = (fileType, fileName) => {

    return (

      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||

      fileType === 'application/vnd.ms-excel' ||

      fileName.endsWith('.xls') ||

      fileName.endsWith('.xlsx')

    );

  };
 
  const handleCancel = () => {

    resetState();

    navigate('/manufacturer/products');

  };
 
  const resetState = () => {

    setFile(null);

    setError('');

    setValidationMessage('');

    setCanSubmit(false);

    setXlData(null);

  };
 
  const getManufactureUnitId = () => {

    const userData = localStorage.getItem('user');

    return userData ? JSON.parse(userData).manufacture_unit_id : '';

  };
 
  // --- Validate Excel File ---

  const handleValidate = async () => {

    if (!file) return;
 
    setLoading(true);

    setValidationMessage('');

    setCanSubmit(false);
 
    try {

      const formData = new FormData();

      formData.append('file', file);
 
      const response = await axios.post(

        `${process.env.REACT_APP_IP}upload_file/`,

        formData,

        { headers: { 'Content-Type': 'multipart/form-data' } }

      );
 
      if (response.data.status) {

        const { xl_contains_error, xl_data } = response.data.data;

        if (xl_contains_error) {

          setValidationMessage('File contains errors. Please correct and revalidate.');

          setCanSubmit(false);

        } else {

          setValidationMessage('File is valid and ready for submission.');

          setCanSubmit(true);

          setXlData(xl_data); // Store parsed Excel data for submission

        }

      } else {

        setValidationMessage('Validation failed: ' + response.data.message);

      }

    } catch (err) {

      setError('Failed to validate the file: ' + err.message);

    } finally {

      setLoading(false);

    }

  };
 
  // --- Submit Excel Data to Backend ---

  const handleSubmit = async () => {

    if (!xlData) return;
 
    const manufactureUnitId = getManufactureUnitId();
 
    setLoading(true);

    try {

      const response = await axios.post(

        `${process.env.REACT_APP_IP}save_file/`,

        {

          xl_data: xlData,

          manufacture_unit_id: manufactureUnitId,

        }

      );
 
      if (response.data.status) {

        const duplicates = response.data.duplicate_products || [];
 
        if (duplicates.length > 0) {

          setDuplicateProducts(duplicates);

          setOpenPopup(true);

        } else {

          navigate("/manufacturer/products");

        }

      } else {

        setError('Failed to save file: ' + response.data.message);

      }

    } catch (err) {

      setError('Error submitting file: ' + err.message);

    } finally {

      setLoading(false);

    }

  };
 
  return (
<Paper elevation={3} sx={{ padding: 4, maxWidth: 600, height: '400px', margin: 'auto', mt: 5, position: 'relative' }}>
<Typography variant="h5" gutterBottom>

        General Import File
</Typography>
 
      <IconButton color="error" onClick={handleCancel} sx={{ position: 'absolute', top: 16, right: 16 }}>
<CancelIcon />
</IconButton>
 
      <Divider sx={{ mb: 3 }} />
 
      <Box display="flex" alignItems="center" gap={2} mb={3}>
<label htmlFor="file-upload" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
<CloudUploadIcon sx={{ fontSize: '2rem', color: (theme) => theme.palette.primary.main, mr: 2 }} />
<span style={{ color: 'grey', fontSize: '12px' }}>Please upload an Excel file (.xls or .xlsx)</span>
<input

            id="file-upload"

            type="file"

            style={{ display: 'none' }}

            onChange={handleFileChange}

          />
</label>
</Box>
 
      <Box sx={{ marginTop: '56px' }}>
<TextField

          disabled

          fullWidth

          placeholder="No file selected"

          value={file ? file.name : ''}

          sx={{ flexGrow: 1 }}

        />
</Box>
 
      {error && (
<Alert severity="error" sx={{ mb: 2 }}>
<AlertTitle>Error</AlertTitle>

          {error}
</Alert>

      )}
 
      {validationMessage && (
<Alert severity={canSubmit ? "success" : "error"} sx={{ mb: 2 }}>
<AlertTitle>{canSubmit ? "Success" : "Error"}</AlertTitle>

          {validationMessage}
</Alert>

      )}
 
      <Box display="flex" justifyContent="center" mt={3}>

        {!canSubmit && (
<Button

            variant="outlined"

            color="warning"

            onClick={handleValidate}

            disabled={loading}

            sx={{ textTransform: 'capitalize' }}
>

            {loading ? <CircularProgress size={24} color="inherit" /> : 'Validate'}
</Button>

        )}

        {canSubmit && (
<Button

            variant="contained"

            color="primary"

            onClick={handleSubmit}

            disabled={loading}

            sx={{ textTransform: 'capitalize' }}
>

            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
</Button>

        )}
</Box>
 
      <ValidatePopup

        open={openPopup}

        onClose={() => setOpenPopup(false)}

        data={duplicateProducts}

        sx={{

          '& .MuiDialog-paper': {

            height: '80%',

            maxHeight: 'none',

          },

        }}

      />
</Paper>

  );

}
 
export default Import;

 