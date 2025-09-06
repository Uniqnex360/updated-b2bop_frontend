import React, { useState } from "react";
import {
  ShoppingCart as ShoppingCartIcon,
  LocalOffer as LocalOfferIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory2 as Inventory2Icon,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
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
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const DashboardHome = () => {
  const navigate = useNavigate();

  // Static data for all dashboard sections
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
        primary_image: "https://images.unsplash.com/photo-1542393545-10b5c8188189?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZWxlY3Ryb25pY3N8ZW58MHx8MHx8fDA%3D",
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
        primary_image: "https://images.unsplash.com/photo-1593642702749-bf233634125c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRvb2xzfGVufDB8fDB8fHww",
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
        primary_image: "https://images.unsplash.com/photo-1589218659123-c9cf7c40f5a7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNhZmV0eSUyMGdlYXJ8ZW58MHx8MHx8fDA%3D",
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

  const staticCategories = [
    { id: '1', name: 'Electrical Supplies' },
    { id: '2', name: 'Hardware Supplies' },
    { id: '3', name: 'Plumbing Supplies' },
    { id: '4', name: 'Cleaning Supplies' },
    { id: '5', name: 'Safety Supplies' },
  ];

  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [orderStatus, setOrderStatus] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);

  const handleOrderStatusChange = (event) => setOrderStatus(event.target.value);
  const handleProductCategoryChange = (event) => setProductCategory(event.target.value);
  const handlePaymentStatusChange = (event) => setPaymentStatus(event.target.value);
  const handleDateChange = (newDate) => setSelectedDate(newDate);

  const filteredRecentOrders = staticDashboardData.recent_orders.filter(order => {
    if (orderStatus && order.order_status !== orderStatus) return false;
    if (productCategory && order.product_category !== productCategory) return false;
    if (paymentStatus && order.payment_status !== paymentStatus) return false;
    if (selectedDate && !dayjs(order.order_date).isSame(dayjs(selectedDate), 'day')) return false;
    return true;
  });

  const analyticsData = [
    {
      title: "Total Spendings",
      value: `$${staticDashboardData.total_spend.toFixed(2)}`,
      icon: <AttachMoneyIcon fontSize="large" className="text-green-600" />,
      color: "bg-green-100 border-green-500 text-green-700",
      onClick: () => navigate("/dealer/orders", { state: { filter: { payment_status: "Completed" } } }),
    },
    {
      title: "Total Orders",
      value: staticDashboardData.total_order_count,
      icon: <ShoppingCartIcon fontSize="large" className="text-blue-600" />,
      color: "bg-blue-100 border-blue-500 text-blue-700",
      onClick: () => navigate("/dealer/orders"),
    },
    {
      title: "Pending Payments",
      value: staticDashboardData.pending_order_count,
      icon: <TrendingUpIcon fontSize="large" className="text-red-600" />,
      color: "bg-red-100 border-red-500 text-red-700",
      onClick: () => navigate("/dealer/orders", { state: { filter: { payment_status: "Pending" } } }),
    },
    {
      title: "Re-Orders",
      value: staticDashboardData.re_order_count,
      icon: <Inventory2Icon fontSize="large" className="text-purple-600" />,
      color: "bg-purple-100 border-purple-500 text-purple-700",
      onClick: () => navigate("/dealer/orders", { state: { is_reorder: "yes" } }),
    },
  ];

  const barDataBrands = {
    labels: staticDashboardData.top_selling_brands.map(brand => brand.brand_name),
    datasets: [
      {
        label: "Products Sold",
        data: staticDashboardData.top_selling_brands.map(brand => brand.units_sold),
        backgroundColor: "rgba(33, 150, 243, 0.8)",
        borderColor: "rgba(33, 150, 243, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const lineDataCategories = {
    labels: staticDashboardData.top_selling_categorys.map(category => category.category_name),
    datasets: [
      {
        label: "Products Sold",
        data: staticDashboardData.top_selling_categorys.map(category => category.units_sold),
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        borderColor: "rgba(33, 150, 243, 1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgba(33, 150, 243, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataPoint = context.raw;
            const label = context.dataset.label;
            return `${label}: ${dataPoint}`;
          },
        },
      },
    },
    scales: { x: { display: true }, y: { beginAtZero: true } },
  };

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      {/* Filter Dropdowns */}
      <Box sx={{
        bgcolor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        p: 2,
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        alignItems: 'center',
      }}>
        <FormControl size="small" sx={{ flexGrow: 1, minWidth: 150 }}>
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

        <FormControl size="small" sx={{ flexGrow: 1, minWidth: 150 }}>
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

        <FormControl size="small" sx={{ flexGrow: 1, minWidth: 150 }}>
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
            label="Date"
            value={selectedDate}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: {
                  flexGrow: 1,
                  minWidth: 150,
                  '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#e2e8f0' } }
                }
              }
            }}
          />
        </LocalizationProvider>
      </Box>

      <Fade in={!loading} timeout={600}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              mb: 4,
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Dealer Dashboard
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
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    borderLeft: `5px solid ${item.color.split(' ')[2].split('-')[1]}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                      cursor: 'pointer',
                    },
                    p: 2,
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        bgcolor: `${item.color.split(' ')[0]}`.replace('bg', 'rgba').replace('100', '15'),
                        p: 1.5,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {item.value}
                      </Typography>
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
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                  Top Selling Brands
                </Typography>
                <div className="h-60 sm:h-72">
                  <Bar data={barDataBrands} options={chartOptions} id="bar-chart-brands" />
                </div>
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
                  height: '400px',
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': { boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                  Top Selling Categories
                </Typography>
                <div className="h-60 sm:h-72">
                  <Line data={lineDataCategories} options={chartOptions} id="line-chart-categories" />
                </div>
              </Paper>
            </Grid>
          </Grid>

          {/* Top Selling Products Table & Recent Orders */}
          <Grid container spacing={3} alignItems="start">
            <Grid item xs={12} md={8}>
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
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      displayEmpty
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                      }}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {staticCategories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-x-auto">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Brand</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Last Purchase</TableCell>
                        <TableCell align="center">Sold</TableCell>
                        <TableCell align="right">Sales ($)</TableCell>
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
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <img src={product.primary_image} alt={product.product_name} style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{product.product_name}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{product.sku_number}</TableCell>
                            <TableCell>{product.brand_name}</TableCell>
                            <TableCell>{product.category_name}</TableCell>
                            <TableCell>{new Date(product.last_updated).toLocaleDateString()}</TableCell>
                            <TableCell align="center">{product.units_sold}</TableCell>
                            <TableCell align="right">${product.total_sales.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">No products found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Paper>
            </Grid>

            {/* Recent Orders */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  p: 3,
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <ShoppingCartIcon sx={{ color: '#3b82f6' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Your Recent Orders
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
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
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default DashboardHome;