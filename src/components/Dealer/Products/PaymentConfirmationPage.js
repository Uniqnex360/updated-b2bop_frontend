import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { styled } from '@mui/material/styles';

// Updated Flipkart-themed palette
const premiumPalette = {
  primary: {
    main: '#2874f0', // Flipkart's primary blue
    light: '#5393ff',
    dark: '#1c54b2',
  },
  secondary: {
    main: '#ee9b00',
    light: '#f9c74f',
    dark: '#bb7e00',
  },
  background: {
    default: '#f4f4f9',
    paper: '#ffffff',
  },
  text: {
    primary: '#1d2228',
    secondary: '#5c6b73',
  },
};

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: '24px',
  padding: '14px 28px',
  borderRadius: '12px',
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(8),
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  backgroundColor: premiumPalette.background.paper,
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 16px 50px rgba(0, 0, 0, 0.2)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#f9fafc',
    '& fieldset': {
      borderColor: '#e0e0e0',
      transition: 'border-color 0.2s ease-in-out',
    },
    '&:hover fieldset': {
      borderColor: premiumPalette.primary.light,
    },
    '&.Mui-focused fieldset': {
      borderColor: premiumPalette.primary.main,
      borderWidth: '2px',
    },
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.75rem',
  color: premiumPalette.primary.main,
  marginBottom: theme.spacing(2),
}));

const InfoBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '12px',
  backgroundColor: premiumPalette.background.default,
  border: `1px solid ${premiumPalette.text.secondary}20`,
  transition: 'border 0.2s ease-in-out',
  '&:hover': {
    border: `1px solid ${premiumPalette.primary.light}`,
  },
}));

function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [file, setFile] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [message, setMessage] = useState('');
  const [fileError, setFileError] = useState('');
  const [formError, setFormError] = useState('');
  const [manufactureBankDetails, setManufactureBankDetails] = useState(null);
  const userData = localStorage.getItem("user");
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchManufactureBankDetails = async () => {
      try {
        const manufacture_unit_id = userData ? JSON.parse(userData).manufacture_unit_id : null;
        if (manufacture_unit_id) {
          const response = await axios.get(
            `${process.env.REACT_APP_IP}getManufactureBankDetails/?manufacture_unit_id=${manufacture_unit_id}`
          );
          setManufactureBankDetails(response.data.data.user_obj);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchManufactureBankDetails();
  }, [userData]);

  const handleConfirmPayment = async () => {
    if (!file || !transactionId) {
      setFormError("Please upload payment proof and enter transaction ID before confirming payment.");
      return;
    }

    setLoading(true);
    setFormError('');
    
    try {
      const userId = userData ? JSON.parse(userData).id : null;
      const messageToSend = message.trim() === '' ? 'Nil' : message;
      const base64File = await convertFileToBase64(file);

      const bodyData = {
        user_id: userId,
        order_id: orderId,
        payment_proof: base64File,
        message: messageToSend,
        transaction_id: transactionId,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_IP}conformPayment/`,
        bodyData
      );

      if (response.status === 200 && response.data.status === true) {
        setIsPaymentConfirmed(true);
      } else {
        const errorMessage = response.data.is_saved || "There was an error processing your payment. Please try again.";
        setFormError(errorMessage);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setFormError("There was an error confirming your payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    const maxSizeInMB = 1;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (uploadedFile && uploadedFile.size > maxSizeInBytes) {
      setFileError(`File size should not exceed ${maxSizeInMB} MB.`);
      setFile(null);
    } else {
      setFileError('');
      setFile(uploadedFile);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const breadcrumbs = [
    <Link component={RouterLink} underline="hover" key="1" color="inherit" to="/dealer/products">
      Home
    </Link>,
    <Link component={RouterLink} underline="hover" key="2" color="inherit" to="/dealer/checkout">
      Checkout
    </Link>,
    <Typography key="3" color="text.primary">
      Payment Confirmation
    </Typography>,
  ];

  return (
    <Container maxWidth="md" sx={{ py: 6, minHeight: '100vh', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          {breadcrumbs}
        </Breadcrumbs>
      </Box>
      <StyledPaper>
        {!isPaymentConfirmed ? (
          <>
            <Typography variant="h4" align="center" sx={{ fontWeight: 700, color: premiumPalette.primary.dark, mb: 2 }}>
              Confirm Your Payment
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Complete the payment to proceed with your order.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Grid container spacing={5}>
              <Grid item xs={12} md={6}>
                <InfoBox>
                  <SectionTitle variant="h5">Payment Details</SectionTitle>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                      Bank Information
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Name:</strong> {manufactureBankDetails ? `${manufactureBankDetails.first_name} ${manufactureBankDetails.last_name}` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Bank:</strong> {manufactureBankDetails?.bank_details?.bank_name || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Account:</strong> {manufactureBankDetails?.bank_details?.account_number || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>IFSC Code:</strong> {manufactureBankDetails?.bank_details?.ifsc_code || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>SWIFT Code:</strong> {manufactureBankDetails?.bank_details?.swift_code || 'N/A'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>IBAN:</strong> {manufactureBankDetails?.bank_details?.iban || 'N/A'}
                    </Typography>
                  </Box>
                  <Alert severity="info" sx={{ mt: 3, borderRadius: '8px' }}>
                    Payment verification may take some time. We will notify you via email once it's confirmed.
                  </Alert>
                </InfoBox>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ p: 1 }}>
                  <SectionTitle variant="h5">Upload Proof of Payment</SectionTitle>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please provide the transaction ID and upload a clear screenshot of your payment.
                  </Typography>

                  <StyledTextField
                    label="Transaction ID"
                    variant="outlined"
                    fullWidth
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <StyledTextField
                    type="file"
                    onChange={handleFileUpload}
                    fullWidth
                    sx={{ mb: 2 }}
                    inputProps={{ accept: 'image/*' }}
                  />
                  {fileError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{fileError}</Alert>}

                  <StyledTextField
                    label="Message (Optional)"
                    variant="outlined"
                    multiline
                    rows={4}
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  {formError && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{formError}</Alert>}

                  <StyledButton
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                  >
                    {loading ? 'Confirming...' : 'Confirm Payment'}
                  </StyledButton>
                </Box>
              </Grid>
            </Grid>
          </>
        ) : (
          <Box textAlign="center" sx={{ p: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: premiumPalette.primary.dark, mb: 2 }}>
              Payment Confirmed!
            </Typography>
            <Typography variant="h6" sx={{ color: premiumPalette.text.secondary, mt: 2 }}>
              Thank you for your payment. Your order is now being processed.
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1rem', color: premiumPalette.text.secondary, mt: 1 }}>
              A confirmation email has been sent to your registered email address.
            </Typography>
            <StyledButton
              variant="contained"
              color="primary"
              onClick={() => navigate("/dealer/products")}
              sx={{ mt: 5 }}
            >
              Continue Shopping
            </StyledButton>
          </Box>
        )}
      </StyledPaper>
    </Container>
  );
}

export default PaymentConfirmationPage;