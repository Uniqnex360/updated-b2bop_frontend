import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Modal,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Breadcrumbs,
  Link,
  Typography,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./OrderDetail.css"; // Ensure this CSS file exists for Flipkart-like styling

const getButtonStyles = (paymentStatus) => {
  if (paymentStatus === "Paid" || paymentStatus === "Completed") {
    return {
      pointerEvents: "none",
      cursor: "not-allowed",
      borderColor: "lightgray",
      color: "rgba(0, 0, 0, 0.26)",
    };
  }
  return {};
};

const OrderDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReorderError, setIsReorderError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false);

  const userData = localStorage.getItem("user");
  const userId = userData ? JSON.parse(userData).manufacture_unit_id : "";
  const orderId = location.state?.orderId;
  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("page") || 0;

  useEffect(() => {
    const handleBackButton = () => {};
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  const handlePreview = (image) => {
    setPreviewImage(image);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setPreviewImage(null);
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}getorderDetails/?order_id=${orderId}&manufacture_unit_id=${userId}`
      );
      setOrderDetails(response.data.data.order_obj);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, userId]);

  const handleReorderClick = () => {
    setIsReorderDialogOpen(true);
  };

  const handleReorderCancel = () => {
    setIsReorderDialogOpen(false);
  };

  const handleReorder = async () => {
    setIsReorderDialogOpen(false);
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IP}createReorder/`,
        { order_id: orderId }
      );
      if (response.status === 200) {
        navigate("/dealer/checkoutRedirect");
      }
    } catch (error) {
      setIsReorderError(true);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = () => {
    const element = document.getElementById("flipkart-invoice");
    html2canvas(element, { scale: 2, useCORS: true }).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${orderDetails.order_id}.pdf`);
    });
  };

  const handlePayment = (orderId) => {
    navigate("/dealer/paymentConfirm", { state: { orderId } });
  };

  // 🐛 FIX: Add a check for orderDetails before destructuring
  if (!orderDetails) {
    return (
      <Box className="fk-loader">
        <CircularProgress />
      </Box>
    );
  }

  const {
    order_id,
    name,
    email,
    mobile_number,
    delivery_status,
    fulfilled_status,
    payment_status,
    placed_on,
    billing_address,
    shipping_address,
    total_items,
    total_amount,
    currency,
    product_list = [],
    transaction_list = [],
    payment_method,
    status,
  } = orderDetails;

  const breadcrumbs = [
    <Link component={RouterLink} underline="hover" key="2" color="inherit" to={`/dealer/orders?page=${currentPage}`}>
      My Orders
    </Link>,
    <Typography key="3" color="text.primary">
      Order #{order_id}
    </Typography>,
  ];

  return (
    <div className="fk-order-detail-bg">
      <div className="fk-order-detail-container">
        {/* Breadcrumbs */}
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {breadcrumbs}
          </Breadcrumbs>
        </Box>

        {/* Header */}
        <div className="fk-order-header" id="flipkart-invoice">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/dealer/orders?page=${currentPage}`)}
            variant="text"
            className="fk-back-btn"
          >
            Back to Orders
          </Button>
          <div>
            <h2 className="fk-order-title">Order #{order_id}</h2>
            <span className="fk-order-date">
              Placed on {new Date(placed_on).toLocaleDateString()}
            </span>
          </div>
          <div className="fk-order-actions">
            <Button
              variant="outlined"
              onClick={generateInvoice}
              color="primary"
              className="fk-action-btn"
              startIcon={<DownloadIcon />}
            >
              Download Invoice
            </Button>
            <Button
              variant="outlined"
              color="primary"
              className="fk-action-btn"
              sx={getButtonStyles(payment_status)}
              onClick={() => handlePayment(orderDetails.id)}
              disabled={payment_status === "Paid" || payment_status === "Completed"}
              startIcon={<PaymentIcon />}
            >
              Confirm Payment
            </Button>
            <Button
              variant="outlined"
              color="primary"
              className="fk-action-btn"
              onClick={handleReorderClick}
              startIcon={<ReceiptIcon />}
            >
              Reorder
            </Button>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="fk-status-tracker">
          <div className={`fk-status-step ${status === "Placed" ? "active" : ""}`}>
            <CheckCircleIcon />
            <span>Placed</span>
          </div>
          <div className={`fk-status-step ${status === "Processing" ? "active" : ""}`}>
            <ReceiptIcon />
            <span>Processing</span>
          </div>
          <div className={`fk-status-step ${status === "Shipped" ? "active" : ""}`}>
            <LocalShippingIcon />
            <span>Shipped</span>
          </div>
          <div className={`fk-status-step ${status === "Delivered" ? "active" : ""}`}>
            <CheckCircleIcon />
            <span>Delivered</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="fk-main-content">
          {/* Left: Items */}
          <div className="fk-items-section">
            <h3 className="fk-section-title">Ordered Items ({product_list.length})</h3>
            {product_list.map((product, idx) => (
              <div key={idx} className="fk-item-row">
                <img
                  src={product.primary_image}
                  alt={product.product_name}
                  className="fk-item-img"
                  onClick={() => handlePreview(product.primary_image)}
                />
                <div className="fk-item-info">
                  <div className="fk-item-name">{product.product_name}</div>
                  <div className="fk-item-details">
                    <span>SKU: {product.sku_number}</span>
                    <span>Quantity: {product.quantity}</span>
                  </div>
                  <div className="fk-item-price">
                    {product.currency}
                    {product.price}
                  </div>
                  <div className="fk-item-total">
                    Total: {product.currency}
                    {product.total_price}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Summary & Address */}
          <div className="fk-summary-section">
            <div className="fk-summary-card">
              <h4 className="fk-summary-title">
                <LocationOnIcon /> Shipping Address
              </h4>
              <div className="fk-summary-content">
                <div>{name}</div>
                <div>
                  {shipping_address?.shipping_address?.street},{" "}
                  {shipping_address?.shipping_address?.city},{" "}
                  {shipping_address?.shipping_address?.state},{" "}
                  {shipping_address?.shipping_address?.zipCode},{" "}
                  {shipping_address?.shipping_address?.country}
                </div>
                <div>Phone: {mobile_number}</div>
              </div>
            </div>
            <div className="fk-summary-card">
              <h4 className="fk-summary-title">
                <PaymentIcon /> Payment Method
              </h4>
              <div className="fk-summary-content">
                <div>{payment_method || "N/A"}</div>
                <div>
                  <span className={`fk-payment-status ${payment_status === "Paid" ? "paid" : ""}`}>
                    {payment_status}
                  </span>
                </div>
              </div>
            </div>
            <div className="fk-summary-card">
              <h4 className="fk-summary-title">
                <ReceiptIcon /> Price Details
              </h4>
              <div className="fk-summary-content">
                <div>
                  <span>Subtotal ({product_list.length} items):</span>
                  <span>
                    {currency}
                    {total_amount}
                  </span>
                </div>
                {/* <div>
                  <span>Shipping Fee:</span>
                  <span>Free</span>
                </div> */}
                <div>
                  <span>Tax (10%):</span>
                  <span>
                    {currency}
                    {(total_amount * 0.1).toFixed(2)}
                  </span>
                </div>
                <div className="fk-summary-total">
                  <span>Total:</span>
                  <span>
                    {currency}
                    {(total_amount * 1.1).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="fk-transactions-section">
          <h4 className="fk-section-title">Transaction History</h4>
          {transaction_list.length > 0 ? (
            transaction_list.map((transaction, idx) => (
              <div key={idx} className="fk-transaction-row">
                <div>
                  <strong>Payment Date:</strong>{" "}
                  {new Date(transaction.transaction_date).toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong> {transaction.status}
                </div>
                <div>
                  <strong>Reviewed Date:</strong>{" "}
                  {new Date(transaction.updated_date).toLocaleString()}
                </div>
                <div>
                  <strong>Payment Proof:</strong>
                  <Tooltip title="Click to Preview" arrow>
                    <img
                      src={`data:image/png;base64,${transaction.payment_proof}`}
                      alt="Payment Proof"
                      className="fk-transaction-img"
                      onClick={() =>
                        handlePreview(`data:image/png;base64,${transaction.payment_proof}`)
                      }
                    />
                  </Tooltip>
                </div>
              </div>
            ))
          ) : (
            <div className="fk-no-data">No Data Found</div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <Modal open={isModalOpen} onClose={handleClose}>
        <Box className="fk-modal-box">
          {previewImage && (
            <Box>
              <Box className="fk-modal-header">
                <Tooltip title="Download Image">
                  <IconButton
                    component="a"
                    href={previewImage}
                    download={`Payment_Proof_${new Date().toISOString()}.png`}
                    color="primary"
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Box className="fk-modal-img-box">
                <img src={previewImage} alt="Preview" className="fk-modal-img" />
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Reorder Dialog */}
      <Dialog open={isReorderDialogOpen} onClose={handleReorderCancel}>
        <DialogTitle>Confirm Reorder</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reorder this order? A new order will be placed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReorderCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleReorder} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reorder Error Modal */}
      <Modal
        open={isReorderError}
        onClose={() => setIsReorderError(false)}
        aria-labelledby="reorder-error-title"
      >
        <Box className="fk-modal-error">
          <span className="fk-error-title">Failed to place order!</span>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => setIsReorderError(false)}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;