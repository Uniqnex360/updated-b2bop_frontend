import React, { useEffect, useState, useCallback } from "react";
import PropTypes from 'prop-types';
import {
  Grid,
  Card,
  Typography,
  CardContent,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  MenuItem,
  Select,
  FormControl,
  Button,
  Fade,
  Collapse,
  IconButton
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler,
} from "chart.js";
import {
  MonetizationOn as MonetizationOnIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Repeat as RepeatIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from "@mui/icons-material";
import './ManufacturerHome.css';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Custom chart plugin for background color
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

function Row(props) {
  const { row, handleProductClick } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow 
        hover 
        sx={{ 
          '& > *': { borderBottom: 'unset' },
          '&:hover': { cursor: 'pointer', bgcolor: '#f8fafc' }
        }}
        onClick={() => handleProductClick(row.product_id)}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}
            >
              <img
                src={row.primary_image}
                alt={row.sku_number}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {row.brand_name}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {row.category_name}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell align="center">{row.sku_number}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {row.brand_logo?.startsWith("http") && (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0'
                }}
              >
                <img
                  src={row.brand_logo}
                  alt={row.brand_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            )}
            <Typography variant="body2">{row.brand_name}</Typography>
          </Box>
        </TableCell>
        <TableCell>{row.category_name}</TableCell>
        <TableCell align="center">
          {new Date(row.last_updated).toLocaleDateString()}
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 600 }}>
          {row.units_sold}
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700 }}>
          ${row.total_sales.toFixed(2)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="subtitle1" gutterBottom component="div">
                Product Details
              </Typography>
              <Table size="small" aria-label="product-details">
                <TableHead>
                  <TableRow>
                    <TableCell>Attribute</TableCell>
                    <TableCell>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Product ID
                    </TableCell>
                    <TableCell>{row.product_id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      SKU Number
                    </TableCell>
                    <TableCell>{row.sku_number}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Brand
                    </TableCell>
                    <TableCell>{row.brand_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Category
                    </TableCell>
                    <TableCell>{row.category_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Units Sold
                    </TableCell>
                    <TableCell>{row.units_sold}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Total Sales
                    </TableCell>
                    <TableCell>${row.total_sales.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

Row.propTypes = {
  row: PropTypes.object.isRequired,
  handleProductClick: PropTypes.func.isRequired,
};

const ManufacturerHome = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dealerOrderData, setDealerOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topSellingProducts, setTopSellingProducts] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dashboardCategory, setDashboardCategory] = useState(null);

  const dealers = dealerOrderData?.total_dealer_list || [];
  const displayedDealers = showAll ? dealers : dealers.slice(0, 5);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const storedBrands = JSON.parse(localStorage.getItem("selectBrand")) || [];
    if (storedBrands.length > 0) {
      localStorage.setItem("BrandImport", JSON.stringify(storedBrands));
    }
  }, []);

  const handleSeeMore = () => {
    setShowAll(!showAll);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem("user");
        const parsedUserData = userData ? JSON.parse(userData) : null;
        const manufactureUnitId = parsedUserData?.manufacture_unit_id;

        if (!parsedUserData || !manufactureUnitId) {
          throw new Error("Invalid or missing manufacture unit ID.");
        }

        const [dashboardResponse, dealerOrderResponse] = await Promise.all([
          axios.get(
            `${process.env.REACT_APP_IP}obtainDashboardDetailsForManufactureAdmin/?manufacture_unit_id=${manufactureUnitId}`
          ),
          axios.get(
            `${process.env.REACT_APP_IP}manufactureDashboardEachDealerOrderValue/?manufacture_unit_id=${manufactureUnitId}`
          ),
        ]);

        setDashboardData(dashboardResponse.data?.data || {});
        setDealerOrderData(dealerOrderResponse.data?.data || {});
      } catch (err) {
        console.error("Error fetching dashboard details:", err);
        setError(err.message || "Something went wrong while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchTopSellingProducts = useCallback(async (categoryId = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_IP}topSellingProductsForDashBoard/?manufacture_unit_id=${user.manufacture_unit_id}&product_category_id=${categoryId}`
      );
      setTopSellingProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching top selling products:", error);
    } finally {
      setLoading(false);
    }
  }, [user.manufacture_unit_id]);

  useEffect(() => {
    fetchTopSellingProducts();
  }, [fetchTopSellingProducts]);

  useEffect(() => {
    const fetchDashboardCategory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainEndlevelcategoryList/?manufacture_unit_id=${user.manufacture_unit_id}`
        );
        setDashboardCategory(response.data.data || []);
      } catch (error) {
        console.error("Error fetching category data:", error);
      }
    };
    fetchDashboardCategory();
  }, [user.manufacture_unit_id]);

  // Bar chart configuration
  const barChartData = {
    labels: dashboardData?.top_selling_brands?.map((_, index) => `Top ${index + 1}`) || [],
    datasets: [
      {
        label: "Products Sold",
        data: dashboardData?.top_selling_brands?.map((item) => item.units_sold) || [],
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
        text: 'Top Selling Brands',
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
            const index = context.dataIndex;
            const brandName = dashboardData?.top_selling_brands?.[index]?.brand_name || 'Unknown Brand';
            return `${brandName}: ${context.raw} units`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#475569',
          font: { size: 12, weight: '500' },
          maxRotation: 45,
          minRotation: 0,
        },
        offset: true,
      },
      y: {
        grid: { color: 'rgba(203, 213, 225, 0.5)', drawBorder: false },
        ticks: {
          color: '#475569',
          font: { size: 12, weight: '500' },
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
    layout: { padding: 20 },
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  // Line chart configuration
  const lineChartData = {
    labels: dashboardData?.top_selling_categorys?.map((_, index) => `Top ${index + 1}`) || [],
    datasets: [
      {
        label: "Products Sold",
        data: dashboardData?.top_selling_categorys?.map((item) => item.units_sold) || [],
        borderColor: 'rgba(59, 130, 246, 0.8)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
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
        text: 'Top Selling Categories',
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
            const index = context.dataIndex;
            const categoryName = dashboardData?.top_selling_categorys?.[index]?.category_name || 'Unknown Category';
            return `${categoryName}: ${context.raw} units`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: '#475569',
          font: { size: 12, weight: '500' },
          maxRotation: 45,
          minRotation: 0,
        },
        offset: true,
      },
      y: {
        grid: { color: 'rgba(203, 213, 225, 0.5)', drawBorder: false },
        ticks: {
          color: '#475569',
          font: { size: 12, weight: '500' },
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
    layout: { padding: 20 },
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  const handleTotalSpendingsClick = () => {
    navigate("/manufacturer/orders", {
      state: { filter: { payment_status: "Completed" } },
    });
  };

  const handlePendingClick = () => {
    navigate("/manufacturer/orders", {
      state: { filter: { payment_status: "Pending" } },
    });
  };

  const handleReorderClick = () => {
    navigate("/manufacturer/orders", {
      state: { filter: { is_reorder: "yes" } },
    });
  };

  const handleProductClick = (productId) => {
    if (!productId) {
      console.error("Invalid productId");
      return;
    }
    navigate(`/manufacturer/products/details/${productId}`);
  };

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    fetchTopSellingProducts(categoryId);
  };

  const handleActiveBuyerClick = () => {
    navigate(`/manufacturer/dealerList`);
  };

  const handleRowClick = (username) => {
    navigate(`/manufacturer/dealer-details/${username}`);
  };

    return (
      <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
        <Fade in={!loading} timeout={600}>
          <Box>
            {loading ? (
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <CircularProgress size={48} sx={{ color: '#3b82f6' }} />
              </Grid>
            ) : (
              <Box>
                {error && (
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#ef4444',
                      textAlign: 'center',
                      bgcolor: '#fee2e2',
                      p: 2,
                      borderRadius: '8px',
                      mb: 3,
                    }}
                  >
                    {error}
                  </Typography>
                )}
                {/* <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 4,
                    textAlign: { xs: 'center', md: 'left' },
                  }}
                >
                  Manufacturer Dashboard
                </Typography> */}

     <Box sx={{ bgcolor: '#f8fafc', borderRadius: 3, p: 3, mb: 4 }}>
  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
    Quick Summary
  </Typography>
  <Grid container spacing={3}>
    {[
      {
        title: 'Total Revenue',
        value: `$${dashboardData?.total_sales?.toLocaleString() || '0'}`,
        icon: <MonetizationOnIcon sx={{ fontSize: 32, color: '#3b82f6' }} />,
        growth: '+12.5%',
        growthColor: '#22c55e',
        growthText: 'vs last period',
      },
      {
        title: 'Total Orders',
        value: dashboardData?.order_count?.toLocaleString() || '0',
        icon: <ShoppingCartIcon sx={{ fontSize: 32, color: '#22d3ee' }} />,
        growth: '+8.2%',
        growthColor: '#22c55e',
        growthText: 'vs last period',
      },
      {
        title: 'Active Customers',
        value: dashboardData?.dealer_count?.toLocaleString() || '0',
        icon: <PeopleIcon sx={{ fontSize: 32, color: '#a78bfa' }} />,
        growth: '+15.3%',
        growthColor: '#22c55e',
        growthText: 'vs last period',
      },
      {
        title: 'Average Order Value',
        value: `$${dashboardData?.average_order_value?.toLocaleString() || '0'}`,
        icon: <RepeatIcon sx={{ fontSize: 32, color: '#818cf8' }} />,
        growth: '+5.7%',
        growthColor: '#22c55e',
        growthText: 'vs last period',
      },
    ].map((card, idx) => (
      <Grid item xs={12} sm={6} md={3} key={idx}>
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            p: 3,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minHeight: 140,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, mb: 1 }}>
            {card.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
              {card.value}
            </Typography>
            <Box
              sx={{
                bgcolor: '#f1f5f9',
                borderRadius: '50%',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.icon}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: card.growthColor, fontWeight: 600, mr: 1 }}>
              {card.growth}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {card.growthText}
            </Typography>
          </Box>
        </Box>
      </Grid>
    ))}
  </Grid>
</Box>

                {/* Charts */}
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
                        height: '400px',
                        transition: 'box-shadow 0.3s ease',
                        '&:hover': { boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' },
                      }}
                    >
                      <Line data={lineChartData} options={lineChartOptions} plugins={[backgroundPlugin]} />
                    </Paper>
                  </Grid>
                </Grid>

                {/* Top Selling Products */}
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
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          value={selectedCategory}
                          onChange={handleCategoryChange}
                          displayEmpty
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                          }}
                        >
                          <MenuItem value="">All Categories</MenuItem>
                          {dashboardCategory?.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <Table aria-label="top selling products">
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                          <TableRow>
                            <TableCell />
                            <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Product</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1e293b' }} align="center">SKU No</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Brand</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1e293b' }} align="center">Latest Purchase</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1e293b' }} align="center">Units Sold</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#1e293b' }} align="right">Total Sales ($)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topSellingProducts?.top_selling_products?.length > 0 ? (
                            topSellingProducts.top_selling_products.map((product, index) => (
                              <Row 
                                key={index} 
                                row={product} 
                                handleProductClick={handleProductClick}
                              />
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                <Typography variant="body1" color="textSecondary">
                                  No products found
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>

                {/* Two-column container */}
                <Grid container spacing={3}>
                  {/* Column 1 - Top Buyers */}
                  <Grid item xs={12} md={6}>
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
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                        Top Buyers
                      </Typography>
                      <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                        {dealerOrderData && Array.isArray(displayedDealers) && displayedDealers.length > 0 ? (
                          displayedDealers.map((dealer, index) => (
                            <Card
                              key={dealer.id}
                              onClick={() => handleRowClick(dealer.id)}
                              sx={{
                                mb: 2,
                                bgcolor: '#ffffff',
                                borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                transition: 'all 0.3s ease',
                                borderLeft: `4px solid ${
                                  index === 0 ? '#3b82f6' : 
                                  index === 1 ? '#8b5cf6' : 
                                  index === 2 ? '#10b981' : '#64748b'
                                }`,
                                '&:hover': {
                                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                  transform: 'translateY(-2px)',
                                  cursor: 'pointer',
                                },
                                p: 2,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ position: 'relative' }}>
                                  <Box
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      borderRadius: '50%',
                                      overflow: 'hidden',
                                      bgcolor: '#e2e8f0',
                                    }}
                                  >
                                    <img
                                      src={
                                        index === 0
                                          ? 'https://randomuser.me/api/portraits/men/32.jpg'
                                          : index === 1
                                          ? 'https://randomuser.me/api/portraits/women/44.jpg'
                                          : index === 2
                                          ? 'https://randomuser.me/api/portraits/men/67.jpg'
                                          : index % 2 === 0
                                          ? 'https://randomuser.me/api/portraits/men/75.jpg'
                                          : 'https://randomuser.me/api/portraits/women/63.jpg'
                                      }
                                      alt={dealer.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </Box>
                                  {index < 3 && (
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -4,
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        color: '#ffffff',
                                        border: '2px solid #ffffff',
                                        bgcolor:
                                          index === 0 ? '#f59e0b' : 
                                          index === 1 ? '#94a3b8' : 
                                          '#f97316',
                                      }}
                                    >
                                      {index + 1}
                                    </Box>
                                  )}
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {dealer.name}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 500 }}>
                                    ${dealer.order_value.toFixed(2)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Card>
                          ))
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              py: 4,
                              gap: 2,
                            }}
                          >
                            <Box
                              sx={{
                                p: 2,
                                bgcolor: '#e2e8f0',
                                borderRadius: '50%',
                              }}
                            >
                              <PeopleIcon sx={{ fontSize: 40, color: '#64748b' }} />
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              No dealers found
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              Check back later for updates
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      {dealers.length > 5 && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                          <Button
                            onClick={handleSeeMore}
                            variant="outlined"
                            sx={{
                              borderColor: '#3b82f6',
                              color: '#3b82f6',
                              borderRadius: '8px',
                              textTransform: 'none',
                              '&:hover': {
                                bgcolor: '#3b82f6',
                                color: '#ffffff',
                              },
                            }}
                          >
                            {showAll ? 'Show Less' : 'See More'}
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Column 2 - Top-Selling Product (Static UI) */}
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
                        Top-Selling Product
                      </Typography>
                      <Box
                        sx={{
                          width: 160,
                          height: 160,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          mb: 3,
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <img
                          src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D"
                          alt="Top Product"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Premium Sony Camera
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                        Best seller of the month
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#3b82f6', fontWeight: 700, mt: 2 }}>
                        $149.99
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            bgcolor: '#dcfce7',
                            borderRadius: '12px',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
                            +35% Sales
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            bgcolor: '#fef9c3',
                            borderRadius: '12px',
                          }}
                        >
                          <Typography variant="caption" sx={{ color: '#ca8a04', fontWeight: 600 }}>
                            1.2k Orders
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Fade>
      </Box>
    );
  };

export default ManufacturerHome;