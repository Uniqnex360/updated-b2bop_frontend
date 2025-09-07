import React, { useState } from "react";
import {
  ShoppingCart as ShoppingCartIcon,
  ArrowUpward as ArrowUpwardIcon,
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  Filler,
  ArcElement
);

// Custom background plugin
const backgroundPlugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const { ctx } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || '#ffffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  },
};

const DashboardHome = () => {
  const navigate = useNavigate();

  // Static data for dashboard sections
  const staticDashboardData = {
    total_spend: 154500.75,
    total_order_count: 520,
    pending_order_count: 15,
    re_order_count: 78,
    top_selling_brands: [
      { brand_name: "Brand A", units_sold: 1250 },
      { brand_name: "Brand B", units_sold: 980 },
      { brand_name: "Brand C", units_sold: 760 },
      { brand_name: "Brand D", units_sold: 550 },
      { brand_name: "Brand E", units_sold: 420 },
    ],
    top_selling_categorys: [
      { category_name: "Electrical Supplies", units_sold: 2100 },
      { category_name: "Hardware Supplies", units_sold: 1850 },
      { category_name: "Plumbing Supplies", units_sold: 1500 },
      { category_name: "Cleaning Supplies", units_sold: 1100 },
      { category_name: "Safety Supplies", units_sold: 900 },
    ],
    recent_orders: [
      { id: 1, order_id: "ORD-98765", amount: 2500.50, order_date: "2025-09-01T10:00:00Z", payment_status: "Paid", order_status: "Delivered", product_category: "Electrical Supplies" },
      { id: 2, order_id: "ORD-98764", amount: 1200.00, order_date: "2025-08-30T15:30:00Z", payment_status: "Pending", order_status: "Pending", product_category: "Hardware Supplies" },
      { id: 3, order_id: "ORD-98763", amount: 500.25, order_date: "2025-08-28T11:45:00Z", payment_status: "Paid", order_status: "Delivered", product_category: "Plumbing Supplies" },
      { id: 4, order_id: "ORD-98762", amount: 3000.75, order_date: "2025-08-25T09:10:00Z", payment_status: "Overdue", order_status: "Cancelled", product_category: "Cleaning Supplies" },
      { id: 5, order_id: "ORD-98761", amount: 850.00, order_date: "2025-08-22T14:20:00Z", payment_status: "Paid", order_status: "Delivered", product_category: "Safety Supplies" },
    ],
    top_selling_products: [
      {
        id: 1,
        product_id: "PROD-001",
        primary_image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D",
        product_name: "Solar Lantern",
        sku_number: "SKU-001",
        brand_name: "Aervoe",
        brand_logo: "https://via.placeholder.com/32",
        category_name: "Electrical Supplies",
        last_updated: "2025-09-05T08:30:00Z",
        units_sold: 150,
        total_sales: 7500.00
      },
      {
        id: 2,
        product_id: "PROD-002",
        primary_image: "https://images.unsplash.com/photo-1549049950-48d5887197a0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
        product_name: "Capacitor Set",
        sku_number: "SKU-002",
        brand_name: "Thorlabs",
        brand_logo: "https://via.placeholder.com/32",
        category_name: "Electrical Supplies",
        last_updated: "2025-09-04T12:00:00Z",
        units_sold: 220,
        total_sales: 4400.00
      },
      {
        id: 3,
        product_id: "PROD-003",
        primary_image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDZ8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
        product_name: "Solar Collector",
        sku_number: "SKU-003",
        brand_name: "A.Y. McDonald",
        brand_logo: "https://via.placeholder.com/32",
        category_name: "Heating and Cooling Supplies",
        last_updated: "2025-09-03T10:15:00Z",
        units_sold: 90,
        total_sales: 9000.00
      },
      {
        id: 4,
        product_id: "PROD-004",
        primary_image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzV8fHByb2R1Y3R8ZW58MHx8MHx8fDA%3D",
        product_name: "Safety Goggles",
        sku_number: "SKU-004",
        brand_name: "Michigan Pneumatic",
        brand_logo: "https://via.placeholder.com/32",
        category_name: "Safety Supplies",
        last_updated: "2025-09-02T16:20:00Z",
        units_sold: 300,
        total_sales: 6000.00
      },
    ],
  };

  const [loading] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const handleOrderStatusChange = (event) => setOrderStatus(event.target.value);
  const handleProductCategoryChange = (event) => setProductCategory(event.target.value);
  const handlePaymentStatusChange = (event) => setPaymentStatus(event.target.value);
  const handleFromDateChange = (newDate) => setFromDate(newDate);
  const handleToDateChange = (newDate) => setToDate(newDate);

  const filteredRecentOrders = staticDashboardData.recent_orders.filter(order => {
    if (orderStatus && order.order_status !== orderStatus) return false;
    if (productCategory && order.product_category !== productCategory) return false;
    if (paymentStatus && order.payment_status !== paymentStatus) return false;
    // Date range filtering
    const orderDate = dayjs(order.order_date);
    if (fromDate && orderDate.isBefore(dayjs(fromDate), 'day')) return false;
    if (toDate && orderDate.isAfter(dayjs(toDate), 'day')) return false;
    return true;
  });

  // KPI cards
  const analyticsData = [
    {
      title: 'Total Orders',
      value: '1,247',
      change: '+8.2%',
      icon: <ShoppingCartIcon fontSize="large" />,
      color: '#22c55e',
      bgColor: '#dcfce7',
      onClick: () => navigate("/dealer/orders"),
    },
    {
      title: 'Orders in Progress',
      value: '22',
      change: '+5.5%',
      icon: <AccessTimeIcon fontSize="large" />,
      color: '#f59e0b',
      bgColor: '#fef3c7',
      onClick: () => navigate("/dealer/orders", { state: { filter: { order_status: "Pending" } } }),
    },
    {
      title: 'Delivered Orders',
      value: '1,225',
      change: '+10.2%',
      icon: <CheckCircleOutlineIcon fontSize="large" />,
      color: '#3b82f6',
      bgColor: '#dbeafe',
      onClick: () => navigate("/dealer/orders", { state: { filter: { order_status: "Delivered" } } }),
    },
    {
      title: 'Pending Payments',
      value: '15',
      change: '+2.1%',
      icon: <HourglassEmptyIcon fontSize="large" />,
      color: '#ef4444',
      bgColor: '#fee2e2',
      onClick: () => navigate("/dealer/orders", { state: { filter: { payment_status: "Pending" } } }),
    },
  ];

  // Bar chart (Top 5 Products by Units Sold)
  const barChartLabels = ['Air Brake Hoses', 'Adhesives', 'Solar Lanterns', 'Bushings', 'Capacitors'];
  const barChartDataValues = [250, 190, 175, 150, 140];

  const barChartData = {
    labels: barChartLabels,
    datasets: [
      {
        label: "Units Spend",
        data: barChartDataValues,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 197, 253, 0.8)',
          'rgba(191, 219, 254, 0.8)',
          'rgba(219, 234, 254, 0.8)',
          'rgba(239, 246, 255, 0.8)',
        ],
        borderColor: [
          'rgba(29, 78, 216, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(147, 197, 253, 1)',
          'rgba(191, 219, 254, 1)',
          'rgba(219, 234, 254, 1)',
        ],
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: [
          'rgba(29, 78, 216, 0.9)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(147, 197, 253, 0.9)',
          'rgba(191, 219, 254, 0.9)',
          'rgba(219, 234, 254, 0.9)',
        ],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#1e293b',
          font: { size: 14, weight: '600' },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Top 5 Products Brands',
        color: '#1e293b',
        font: { size: 18, weight: '700' },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(59, 130, 246, 0.95)',
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        titleColor: '#ffffff',
        bodyColor: '#f8fafc',
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} units`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#475569', font: { size: 12, weight: '500' }, maxRotation: 45, minRotation: 0 },
        offset: true,
      },
      y: {
        grid: { color: 'rgba(203, 213, 225, 0.5)', drawBorder: false },
        ticks: { color: '#475569', font: { size: 12, weight: '500' }, stepSize: 1 },
        beginAtZero: true,
      },
    },
    layout: { padding: 20 },
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: 'easeOutQuart' },
  };

  // Line/Area chart (Key Business Trends over Time)
  const trendsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const totalSpendData = [9500, 11000, 10500, 13000, 14500, 15800, 14900, 16200, 17500, 18800, 20100, 22500];

  const lineTrendChartData = {
    labels: trendsLabels,
    datasets: [
      {
        label: "Total Spend",
        data: totalSpendData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        fill: true,
      },
    ]
  };

  const lineTrendChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#1e293b', font: { size: 14, weight: '600' }, padding: 20 },
      },
      title: {
        display: true,
        text: 'Total Order Value Over Time',
        color: '#1e293b',
        font: { size: 18, weight: '700' },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: "#f1f5fd",
        titleColor: "#1e293b",
        bodyColor: "#3b82f6",
        borderColor: "#bae6fd",
        borderWidth: 2,
        cornerRadius: 12,
        padding: 14,
        callbacks: {
          title: (context) => `Month: ${context[0].label}`,
          label: (context) => {
            const value = context.raw;
            return `Total Spend: $${Number(value).toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Time Period (Months)', color: '#475569', font: { size: 14, weight: '600' }, padding: { top: 10 } },
        grid: { display: false, drawBorder: false },
        ticks: { color: "#64748b", font: { size: 13, weight: "500" } },
      },
      y: {
        title: { display: true, text: 'Value', color: '#475569', font: { size: 14, weight: '600' }, padding: { bottom: 10 } },
        grid: { color: "rgba(203,213,225,0.5)", drawBorder: false },
        ticks: {
          color: "#64748b",
          font: { size: 13, weight: "500" },
          callback: (value) => (value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value}`),
        },
        beginAtZero: true,
      }
    },
    layout: { padding: { top: 20, left: 10, right: 10, bottom: 10 } },
    maintainAspectRatio: false,
    animation: { duration: 1200, easing: "easeOutQuart" }
  };

  // Pie chart data and options for buyer's perspective
  const spendingData = [45000, 35000, 25000, 15000, 10000];
  const totalSpending = spendingData.reduce((sum, value) => sum + value, 0);

  const pieChartData = {
    labels: staticDashboardData.top_selling_categorys.map(category => category.category_name),
    datasets: [
      {
        label: 'Total Spend',
        data: spendingData,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 16,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#1e293b',
          font: { size: 14, weight: '600' },
          boxWidth: 20,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Spending Distribution by Category',
        color: '#1e293b',
        font: { size: 18, weight: '700' },
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(59, 130, 246, 0.95)',
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        titleColor: '#ffffff',
        bodyColor: '#f8fafc',
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = ((value / totalSpending) * 100).toFixed(1);
            return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    cutout: '40%',
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000,
    },
  };

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      {/* Filter Dropdowns */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          p: 2,
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: 'center',
          position: 'sticky',
          top: 72,
          zIndex: 1100,
          width: '100%',
          backgroundClip: 'padding-box',
        }}
      >
        <FormControl size="small" sx={{ flexGrow: 1, minWidth: 280 }}>
          <InputLabel>Order Status</InputLabel>
          <Select
            value={orderStatus}
            onChange={handleOrderStatusChange}
            label="Order Status"
            sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
          >
            <MenuItem value="">All Status</MenuItem>
            {['Pending', 'Delivered', 'Cancelled'].map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ flexGrow: 1, minWidth: 280 }}>
          <InputLabel>Product Category</InputLabel>
          <Select
            value={productCategory}
            onChange={handleProductCategoryChange}
            label="Product Category"
            sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
          >
            <MenuItem value="">All Categories</MenuItem>
            {staticDashboardData.top_selling_categorys.map((category) => (
              <MenuItem key={category.category_name} value={category.category_name}>
                {category.category_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ flexGrow: 1, minWidth: 280 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select
            value={paymentStatus}
            onChange={handlePaymentStatusChange}
            label="Payment Status"
            sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
          >
            <MenuItem value="">All Status</MenuItem>
            {['Paid', 'Pending', 'Overdue'].map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={handleFromDateChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  flexGrow: 1,
                  minWidth: 40,
                  '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#e2e8f0' } }
                }
              }
            }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={handleToDateChange}
            minDate={fromDate}
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  flexGrow: 1,
                  minWidth: 40,
                  '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#e2e8f0' } }
                }
              }
            }}
          />
        </LocalizationProvider>
      </Box>

      <Fade in={!loading} timeout={600}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 3 }}>
            Quick Summary
          </Typography>

          {/* Analytics Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {analyticsData.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  onClick={item.onClick}
                  sx={{
                    bgcolor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.title}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', my: 0.5, color: '#1e293b' }}>
                        {item.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ArrowUpwardIcon sx={{ color: '#16a34a', fontSize: '1rem' }} />
                        <Typography variant="caption" color="text.secondary">
                          <Box component="span" sx={{ color: '#16a34a', fontWeight: 'medium' }}>
                            {item.change}
                          </Box>
                          {' vs last period'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: item.bgColor,
                      }}
                    >
                      {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 28 } })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  p: 3,
                  height: '400px',
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': { boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' },
                }}
              >
                <Bar data={barChartData} options={barChartOptions} plugins={[backgroundPlugin]} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, alignSelf: 'flex-start' }}>
                  Total Order Value Over Time
                </Typography>
                <Box sx={{ width: "100%", height: 260 }}>
                  <Line
                    data={lineTrendChartData}
                    options={lineTrendChartOptions}
                    plugins={[backgroundPlugin]}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Selling Products Table */}
          <Box sx={{ mb: 4 }}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                p: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Top Selling Products
                </Typography>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Table aria-label="top selling products">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell />
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }} align="center">SKU</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Brand</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }} align="center">Last Purchase</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }} align="center">Units Sold</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }} align="right">Total Sales ($)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staticDashboardData.top_selling_products.length > 0 ? (
                      staticDashboardData.top_selling_products.map((product) => (
                        <TableRow
                          key={product.id}
                          hover
                          onClick={() => handleProductClick(product.product_id)}
                        >
                          <TableCell>
                            <Box sx={{ width: 44, height: 44, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src={product.primary_image} alt={product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#212121', fontSize: 15 }}>
                            {product.product_name}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500, color: '#3b82f6', fontSize: 14 }}>
                            {product.sku_number}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, color: '#6366f1', fontSize: 14 }}>
                            {product.brand_name}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500, color: '#64748b', fontSize: 14 }}>
                            {product.category_name}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500, color: '#475569', fontSize: 14 }}>
                            {new Date(product.last_updated).toLocaleDateString()}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: '#10b981', fontSize: 15 }}>
                            {product.units_sold}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#3b82f6', fontSize: 15 }}>
                            ${product.total_sales.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">No products found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>

          {/* Next row: Recent Orders and Pie Chart */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <ShoppingCartIcon sx={{ color: '#3b82f6' }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      Your Recent Orders
                    </Typography>
                  </Box>
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {filteredRecentOrders.length === 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center' }}>No Recent Orders available</Typography>
                      </Box>
                    ) : (
                      filteredRecentOrders.map((order) => (
                        <Card
                          key={order.id}
                          onClick={() => navigate(`/dealer/OrderDetail/${order.id}`)}
                          sx={{
                            mb: 2,
                            bgcolor: '#f8fafc',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            borderLeft: '4px solid #3b82f6',
                            transition: 'all 0.3s ease',
                            '&:hover': { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', transform: 'translateY(-2px)', cursor: 'pointer' },
                            p: 2,
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                            Order #{order.order_id}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Order Value:
                                <Typography component="span" sx={{ fontWeight: 700, color: '#1e293b', ml: 0.5 }}>
                                  ${order.amount.toFixed(2)}
                                </Typography>
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" sx={{ color: '#64748b' }}>
                                Date:
                                <Typography component="span" sx={{ fontWeight: 500, color: '#1e293b', ml: 0.5 }}>
                                  {new Date(order.order_date).toLocaleDateString()}
                                </Typography>
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      ))
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, alignSelf: 'flex-start' }}>
                  Spending Distribution by Category
                </Typography>
                <Box sx={{ width: "100%", height: 350, display: 'flex', justifyContent: 'center' }}>
                  <Pie data={pieChartData} options={pieChartOptions} plugins={[backgroundPlugin]} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default DashboardHome;