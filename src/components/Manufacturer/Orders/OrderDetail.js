import React, { useState, useEffect } from "react";
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarToday as DateIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./OrderDetail.css"; // We'll create this file for some custom styles

const OrderDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState("");
  const [expandedItems, setExpandedItems] = useState({});

  const userData = localStorage.getItem("user");
  const userId = userData ? JSON.parse(userData).manufacture_unit_id : "";

  const queryParams = new URLSearchParams(location.search);
  const currentPage = queryParams.get("page") || 0;

  useEffect(() => {
    const handleBackButton = () => {
      console.log("Back button pressed");
    };
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

  const handleCancel = () => {
    navigate(`/manufacturer/orders?page=${currentPage}`);
  };

  const handleConfirm = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}acceptOrRejectOrder/?order_id=${id}&user_id=${userData?.id}&status=${action}`
      );
      console.log("Order update:", categoryResponse.data);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const fetchOrderDetails = async () => {
    if (!id || !userId) return;
    try {
      const categoryResponse = await axios.get(
        `${process.env.REACT_APP_IP}getorderDetails/?order_id=${id}&manufacture_unit_id=${userId}&`
      );
      setOrderDetails(categoryResponse.data.data.order_obj);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id, userId]);

  const generateInvoice = () => {
    const element = document.getElementById("invoice-container"); // Use a specific ID for the section you want to download
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

  const toggleItemExpand = (productId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Processing":
        return "bg-yellow-100 text-yellow-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const orderSteps = [
    { label: "Order Placed", status: "Placed", icon: <InventoryIcon /> },
    { label: "Processing", status: "Processing", icon: <CheckCircleIcon /> },
    { label: "Shipped", status: "Shipped", icon: <ShippingIcon /> },
    { label: "Delivered", status: "Delivered", icon: <CheckCircleIcon /> },
  ];

  const activeStepIndex = orderDetails?.status ? orderSteps.findIndex(step => step.status === orderDetails.status) : 0;
  const normalizedActiveStep = activeStepIndex === -1 ? 0 : activeStepIndex;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6" id="invoice-container">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 text-sm">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center font-medium text-gray-700 hover:text-blue-600"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Home
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => navigate("/manufacturer/orders")}
                  className="ml-1 font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Orders
                </button>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <span className="ml-1 font-medium text-gray-500 md:ml-2">
                  Order #{orderDetails?.order_id}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap mb-4 border-b pb-4">
            <div className="flex items-start mb-3 sm:mb-0">
              <button
                onClick={handleCancel}
                className="p-2 mr-4 text-gray-700 rounded-full hover:bg-gray-100"
              >
                <ArrowBackIcon />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                  Order #{orderDetails?.order_id}
                </h1>
                <span className="text-sm text-gray-500">
                  Placed on {new Date(orderDetails?.placed_on).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                  orderDetails?.status
                )}`}
              >
                {orderDetails?.status || "Processing"}
              </span>
              <button
                onClick={generateInvoice}
                className="flex items-center px-3 py-1.5 text-xs sm:text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <DownloadIcon className="w-4 h-4 mr-1" />
                Download Invoice
              </button>
            </div>
          </div>

          {/* Order progress tracker */}
          <div className="w-full relative py-4 mb-6">
            <div className="flex justify-between items-center relative z-10 px-0 sm:px-0">
              {orderSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center flex-1 min-w-[70px] relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      index <= normalizedActiveStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`mt-2 text-xs sm:text-sm font-medium text-center transition-colors duration-300 ${
                      index <= normalizedActiveStep ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index < orderSteps.length - 1 && (
                    <div
                      className={`absolute left-[calc(50%+20px)] right-[calc(50%+20px)] top-5 h-0.5 transition-colors duration-300 ${
                        index < normalizedActiveStep ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ordered items and Price Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ordered Items List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center">
              <InventoryIcon className="text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Ordered Items ({orderDetails?.product_list?.length})
              </h3>
            </div>
            {orderDetails?.product_list.map((product, index) => (
              <React.Fragment key={index}>
                <div className="p-4 flex items-center border-b border-gray-200 last:border-b-0">
                  <img
                    src={product.primary_image}
                    alt={product.product_name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-md object-cover cursor-pointer mr-4"
                    onClick={() => handlePreview(product.primary_image)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {product.product_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Quantity: {product.quantity}
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {product.currency}
                      {(product.price * product.quantity).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleItemExpand(product.product_id)}
                    aria-label="Toggle product details"
                    className="ml-auto p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-transform"
                  >
                    <ExpandMoreIcon
                      className={`transform transition-transform duration-300 ${
                        expandedItems[product.product_id] ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                </div>
                {expandedItems[product.product_id] && (
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Product Details</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Category: {product.category || "N/A"}</p>
                          <p>Brand: {product.brand || "N/A"}</p>
                          <p>Color: {product.color || "N/A"}</p>
                          <p>Size: {product.size || "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Images</h4>
                        <div className="flex flex-wrap gap-2">
                          {[product.primary_image, ...(product.additional_images || [])].map((img, imgIndex) => (
                            // eslint-disable-next-line jsx-a11y/img-redundant-alt
                            <img
                              key={imgIndex}
                              src={img}
                              alt={`Product image ${imgIndex + 1}`}
                              className="w-12 h-12 rounded-md object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
                              onClick={() => handlePreview(img)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Right sidebar with Order Summary, Address, and Payment */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center mb-4">
                <LocationIcon className="text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Shipping Address</h3>
              </div>
              <div className="space-y-1 text-gray-600 text-sm">
                <p className="font-semibold">{orderDetails?.name}</p>
                <p>{orderDetails?.shipping_address?.shipping_address?.street}</p>
                <p>
                  {orderDetails?.shipping_address?.shipping_address?.city},{" "}
                  {orderDetails?.shipping_address?.shipping_address?.state}{" "}
                  {orderDetails?.shipping_address?.shipping_address?.postal_code}
                </p>
                <p>Phone: {orderDetails?.mobile_number}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center mb-4">
                <PaymentIcon className="text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Payment</h3>
              </div>
              <div className="flex items-center justify-between">
                {/* <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-medium text-sm">
                      {orderDetails?.payment_method?.charAt(0) || "N"}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {orderDetails?.payment_method || "N/A"}
                  </span>
                </div> */}
                <span className="inline-block px-2 py-1 text-xs text-green-800 bg-green-100 rounded font-semibold">
                  Paid
                </span>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="flex items-center mb-4">
                <ReceiptIcon className="text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Price Details</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({orderDetails?.product_list.length} item)</span>
                  <span className="font-medium text-gray-800">
                    {orderDetails?.currency}
                    {orderDetails?.total_amount}
                  </span> 
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div> */}
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Tax (6%)</span>
                  <span className="font-medium text-gray-800">
                    {orderDetails?.currency}
                    {(orderDetails?.total_amount * 0.06).toFixed(2)}
                  </span>
                </div> */}
                <div className="border-t border-dashed border-gray-300 my-4"></div>
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-gray-800">
                    {orderDetails?.currency}
                    {(orderDetails?.total_amount + orderDetails?.total_amount * 0.06).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons footer */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={() => {
              setAction("cancel");
              setDialogOpen(true);
            }}
            className="flex items-center justify-center px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <CancelIcon className="mr-2" />
            Cancel Order
          </button>
          <button
            onClick={() => {
              // Assuming you want to accept the order
              setAction("accept");
              setDialogOpen(true);
            }}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <CheckCircleIcon className="mr-2" />
            Accept Order
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-auto relative">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-900 focus:outline-none"
              aria-label="Close preview"
            >
              <CloseIcon />
            </button>
            <div className="p-4 flex justify-center">
              <img
                src={previewImage}
                alt="Preview"
                className="max-h-[80vh] max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {dialogOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Action</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to {action} this order?</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;