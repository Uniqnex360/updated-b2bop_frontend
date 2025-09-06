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
    IconButton,
    InputLabel
} from "@mui/material";
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
    KeyboardArrowUp as KeyboardArrowUpIcon,
    ArrowUpward as ArrowUpwardIcon,
    Layers as LayersIcon,
    Category as CategoryIcon,
    LocalOffer as LocalOfferIcon,
    Domain as DomainIcon,
    CalendarToday as CalendarTodayIcon,
    ViewWeek as ViewWeekIcon,
    EventNote as EventNoteIcon,
    Event as EventIcon,
} from "@mui/icons-material";
import './ManufacturerHome.css';

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
    const [open, setOpen] = useState(false);

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

    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [selectedCategoryName, setSelectedCategoryName] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedBuyer, setSelectedBuyer] = useState('');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const staticData = [
        { industry: "Electrical Supplies", category: "Solar Lanterns", brand: "Aervoe", buyer: "John" },
        { industry: "Electrical Supplies", category: "Capacitors", brand: "Thorlabs", buyer: "Christopher Brown" },
        { industry: "Heating and Cooling Supplies", category: "Solar Collectors", brand: "A.Y. McDonald", buyer: "Sophia Taylor" },
        { industry: "Safety Supplies", category: "Capacitors", brand: "Michigan Pneumatic", buyer: "Isabella Harris" },
        { industry: "Hardware Supplies", category: "Wires & Cables", brand: "Irwin", buyer: "William Anderson" },
        { industry: "Cleaning Supplies", category: "Cable Splitters & Signal Amplifiers", brand: "Irwin", buyer: "William Anderson" },
        { industry: "Automotive Supplies", category: "Bushings", brand: "Mohawkgroup", buyer: "Emily Davis" },
        { industry: "Building Supplies", category: "Electrical Boxes & Enclosures", brand: "Nelson", buyer: "James Miller" },
        { industry: "Home Improvement Supplies", category: "Filtration Components", brand: "Midland Industries", buyer: "Michael Johnson" },
        { industry: "Industrial Supplies", category: "Ventilation Equipment", brand: "Integra", buyer: "Olivia Wilson" },
        { industry: "Material Handling Supplies", category: "Apron", brand: "Stanley", buyer: "Ava Thompson" },
        { industry: "Plumbing Supplies", category: "Chalk Reels & Chalk", brand: "Avdel", buyer: "Antislip Tapes" },
        { industry: "Hardware Supplies", category: "Cleaners & Degreasers", brand: "Dodge", buyer: "Knee Pads" },
        { industry: "Cleaning Supplies", category: "Cleaning Wipes & Towels", brand: "Masterfix", buyer: "Signs & Facility" },
        { industry: "Automotive Supplies", category: "Floor Coverings", brand: "POP", buyer: "Adhesives" },
        { industry: "Building Supplies", category: "Stair Treads and Risers", brand: "Spiralock", buyer: "Aluminum Studs" },
        { industry: "Home Improvement Supplies", category: "Wall Base and Molding", brand: "Tucker", buyer: "Arc Studs" },
        { industry: "Industrial Supplies", category: "Cooking Accessories", brand: "Bunting Bearings", buyer: "Bolts & Screws" },
        { industry: "Material Handling Supplies", category: "Cooking Appliances", brand: "Nibco", buyer: "Cable Ties & Straps" },
        { industry: "Plumbing Supplies", category: "Accessories", brand: "Harcofittings", buyer: "C-Clamps" },
        { industry: "Electrical Supplies", category: "Bars", brand: "Avdel", buyer: "Clamps" },
        { industry: "Heating and Cooling Supplies", category: "Connectors", brand: "Masterfix", buyer: "Coupler" },
        { industry: "Safety Supplies", category: "Controllers", brand: "POP", buyer: "Fastener Accessories" },
        { industry: "Hardware Supplies", category: "Couplers & Splitters", brand: "Spiralock", buyer: "Nuts" },
        { industry: "Cleaning Supplies", category: "Electric Actuators", brand: "Tucker", buyer: "Screw" },
        { industry: "Automotive Supplies", category: "Mufflers & Breathers", brand: "Bunting Bearings", buyer: "Rivet Nuts" },
        { industry: "Building Supplies", category: "Lifting, Pulling & Positioning", brand: "Nibco", buyer: "Cleaners & Degreasers" },
        { industry: "Home Improvement Supplies", category: "Step Stools", brand: "Harcofittings", buyer: "Cleaning Wipes & Towels" },
        { industry: "Industrial Supplies", category: "Adapters", brand: "Avdel", buyer: "Fittings" },
        { industry: "Material Handling Supplies", category: "Barb", brand: "Masterfix", buyer: "Air Brake Hoses" },
        { industry: "Plumbing Supplies", category: "Ball Valves", brand: "POP", buyer: "Pneumatic Tools" },
        { industry: "Electrical Supplies", category: "Butterfly Valves", brand: "Spiralock", buyer: "Adhesives, Glues and Sundries" },
        { industry: "Heating and Cooling Supplies", category: "Elbow", brand: "Tucker", buyer: "Floor Coverings" },
        { industry: "Safety Supplies", category: "Gasket", brand: "Bunting Bearings", buyer: "Stair Treads and Risers" },
        { industry: "Hardware Supplies", category: "Gasket", brand: "Nibco", buyer: "Wall Base and Molding" },
    ];

    const industries = [...new Set(staticData.map(item => item.industry))];
    const categories = selectedIndustry ? [...new Set(staticData.filter(item => item.industry === selectedIndustry).map(item => item.category))] : [];
    const brands = selectedCategoryName ? [...new Set(staticData.filter(item => item.category === selectedCategoryName).map(item => item.brand))] : [];
    const buyers = selectedBrand ? [...new Set(staticData.filter(item => item.brand === selectedBrand).map(item => item.buyer))] : [];

    const handleIndustryChange = (event) => {
        setSelectedIndustry(event.target.value);
        setSelectedCategoryName('');
        setSelectedBrand('');
        setSelectedBuyer('');
    };

    const handleCategoryChange = (event) => {
        setSelectedCategoryName(event.target.value);
        setSelectedBrand('');
        setSelectedBuyer('');
    };

    const handleBrandChange = (event) => {
        setSelectedBrand(event.target.value);
        setSelectedBuyer('');
    };

    const handleBuyerChange = (event) => {
        setSelectedBuyer(event.target.value);
    };

    const user = JSON.parse(localStorage.getItem("user"));

    const handleSeeMore = () => {
        setShowAll(!showAll);
    };

    const fetchData = useCallback(async () => {
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

    const fetchDashboardCategory = useCallback(async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_IP}obtainEndlevelcategoryList/?manufacture_unit_id=${user.manufacture_unit_id}`
            );
            setDashboardCategory(response.data.data || []);
        } catch (error) {
            console.error("Error fetching category data:", error);
        }
    }, [user.manufacture_unit_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchTopSellingProducts();
    }, [fetchTopSellingProducts]);

    useEffect(() => {
        fetchDashboardCategory();
    }, [fetchDashboardCategory]);

    // Added more static data to the dealers array
    const expandedDealersData = [
        { id: 1, name: 'Christopher Brown', order_value: 125000.75, imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 2, name: 'John Doe', order_value: 98000.50, imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: 3, name: 'Sophia Taylor', order_value: 76000.25, imageUrl: 'https://randomuser.me/api/portraits/men/67.jpg' },
        { id: 4, name: 'Isabella Harris', order_value: 55000.00, imageUrl: 'https://randomuser.me/api/portraits/women/63.jpg' },
        { id: 5, name: 'William Anderson', order_value: 42000.10, imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg' },
        { id: 6, name: 'Emily Davis', order_value: 38000.45, imageUrl: 'https://randomuser.me/api/portraits/women/21.jpg' },
        { id: 7, name: 'James Miller', order_value: 34500.80, imageUrl: 'https://randomuser.me/api/portraits/men/19.jpg' },
        { id: 8, name: 'Michael Johnson', order_value: 31000.30, imageUrl: 'https://randomuser.me/api/portraits/men/88.jpg' },
        { id: 9, name: 'Olivia Wilson', order_value: 29500.90, imageUrl: 'https://randomuser.me/api/portraits/women/55.jpg' },
        { id: 10, name: 'Ava Thompson', order_value: 27000.60, imageUrl: 'https://randomuser.me/api/portraits/women/77.jpg' },
    ];
    
    // Instead of using the fetched data, we'll use our static data for the demo.
    const dealers = expandedDealersData;
    const displayedDealers = showAll ? dealers : dealers.slice(0, 5);

    // eslint-disable-next-line
    const handleTotalSpendingsClick = () => {
        navigate("/manufacturer/orders", {
            state: { filter: { payment_status: "Completed" } },
        });
    };

    // eslint-disable-next-line
    const handlePendingClick = () => {
        navigate("/manufacturer/orders", {
            state: { filter: { payment_status: "Pending" } },
        });
    };

    // eslint-disable-next-line
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

    const handleDashboardCategoryChange = (event) => {
        const categoryId = event.target.value;
        setSelectedCategory(categoryId);
        fetchTopSellingProducts(categoryId);
    };

    // eslint-disable-next-line
    const handleActiveBuyerClick = () => {
        navigate(`/manufacturer/dealerList`);
    };

    const handleRowClick = (username) => {
        navigate(`/manufacturer/dealer-details/${username}`);
    };

    // --- UPDATED BAR CHART DATA OBJECT ---
    const barChartLabels = ['Air Brake Hoses', 'Adhesives', 'Solar Lanterns', 'Bushings', 'Capacitors'];
    const barChartDataValues = [250, 190, 175, 150, 140];
    const barChartData = {
        labels: barChartLabels,
        datasets: [
            {
                label: "Units Sold",
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
                text: 'Top 5 Products by Units Sold',
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
                        return `${context.label}: ${context.raw} units`;
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

    // --- NEW STATIC DATA FOR LINE CHART ---
    const trendsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = [15000, 18000, 17000, 22000, 24000, 26000, 25000, 27000, 29000, 31000, 34000, 38000];
    
    const lineTrendChartData = {
        labels: trendsLabels,
        datasets: [
            {
                label: "Revenue",
                data: revenueData,
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
                labels: {
                    color: '#1e293b',
                    font: { size: 14, weight: '600' },
                    padding: 20,
                },
            },
            title: {
                display: true,
                text: 'Key Business Trends over Time',
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
                        const label = context.dataset.label || '';
                        const value = context.raw;
                        if (label === 'Orders') {
                            return `${label}: ${value} units`;
                        } else {
                            return `${label}: $${value.toLocaleString()}`;
                        }
                    }
                }
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Time Period (Months)',
                    color: '#475569',
                    font: { size: 14, weight: '600' },
                    padding: { top: 10 },
                },
                grid: { display: false, drawBorder: false },
                ticks: {
                    color: "#64748b",
                    font: { size: 13, weight: "500" },
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Value',
                    color: '#475569',
                    font: { size: 14, weight: '600' },
                    padding: { bottom: 10 },
                },
                grid: { color: "rgba(203,213,225,0.5)", drawBorder: false },
                ticks: {
                    color: "#64748b",
                    font: { size: 13, weight: "500" },
                    callback: (value) => {
                        return value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value}`;
                    },
                },
                beginAtZero: true,
            }
        },
        layout: { padding: { top: 20, left: 10, right: 10, bottom: 10 } },
        maintainAspectRatio: false,
        animation: {
            duration: 1200,
            easing: "easeOutQuart"
        }
    };

    const cardData = [
        {
            title: 'Total Revenue',
            value: '$2,847,329',
            change: '+12.5%',
            icon: <MonetizationOnIcon />,
            color: '#3b82f6',
            bgColor: '#dbeafe',
        },
        {
            title: 'Total Orders',
            value: '1,247',
            change: '+8.2%',
            icon: <ShoppingCartIcon />,
            color: '#22c55e',
            bgColor: '#dcfce7',
        },
        {
            title: 'Active Buyers',
            value: '847',
            change: '+15.3%',
            icon: <PeopleIcon />,
            color: '#8b5cf6',
            bgColor: '#ede9fe',
        },
        {
            title: 'Average Order Value',
            value: '$2,284',
            change: '+5.7%',
            icon: <ShoppingCartCheckoutIcon />,
            color: '#818cf8',
            bgColor: '#e0e7ff',
        },
    ];

    const secondRowCardData = [
        {
            title: 'Number of SKU’s',
            value: '2,500',
            change: '+10.1%',
            icon: <LayersIcon />,
            color: '#f59e0b',
            bgColor: '#fef3c7',
        },
        {
            title: 'Number. of Industries',
            value: '15',
            change: '+2.0%',
            icon: <DomainIcon />,
            color: '#ef4444',
            bgColor: '#fee2e2',
        },
        {
            title: 'Number. of Brands',
            value: '75',
            change: '+7.8%',
            icon: <LocalOfferIcon />,
            color: '#10b981',
            bgColor: '#dcfce7',
        },
        {
            title: 'Number. of End-Level Categories',
            value: '250',
            change: '+4.3%',
            icon: <CategoryIcon />,
            color: '#6366f1',
            bgColor: '#eef2ff',
        },
    ];

    const salesAnalyticsData = [
        {
            title: 'Daily revenue',
            value: '$9,250',
            change: '+2.5%',
            icon: <CalendarTodayIcon />,
            color: '#0ea5e9',
            bgColor: '#e0f7fa',
        },
        {
            title: 'Weekly revenue',
            value: '$65,400',
            change: '+8.1%',
            icon: <ViewWeekIcon />,
            color: '#f59e0b',
            bgColor: '#fff7ed',
        },
        {
            title: 'Monthly revenue',
            value: '$245,000',
            change: '+12.3%',
            icon: <EventNoteIcon />,
            color: '#10b981',
            bgColor: '#dcfce7',
        },
        {
            title: 'Annual revenue',
            value: '$2,940,000',
            change: '+15.8%',
            icon: <EventIcon />,
            color: '#8b5cf6',
            bgColor: '#ede9fe',
        },
    ];

    return (
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
            {/* Search Bar & Filter Dropdowns */}
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
                    <InputLabel>Industry</InputLabel>
                    <Select
                        value={selectedIndustry}
                        onChange={handleIndustryChange}
                        label="Industry"
                        sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
                    >
                        <MenuItem value="">All Industries</MenuItem>
                        {industries.map((industry) => (
                            <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ flexGrow: 1, minWidth: 150 }} disabled={!selectedIndustry}>
                    <InputLabel>End level category</InputLabel>
                    <Select
                        value={selectedCategoryName}
                        onChange={handleCategoryChange}
                        label="End level category"
                        sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
                    >
                        {/* <MenuItem value="">All Categories</MenuItem> */}
                        {categories.map((category) => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ flexGrow: 1, minWidth: 150 }} disabled={!selectedCategoryName}>
                    <InputLabel>Brand Name</InputLabel>
                    <Select
                        value={selectedBrand}
                        onChange={handleBrandChange}
                        label="Brand Name"
                        sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
                    >
                        <MenuItem value="">All Brands</MenuItem>
                        {brands.map((brand) => (
                            <MenuItem key={brand} value={brand}>{brand}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ flexGrow: 1, minWidth: 150 }} disabled={!selectedBrand}>
                    <InputLabel>Buyer Name</InputLabel>
                    <Select
                        value={selectedBuyer}
                        onChange={handleBuyerChange}
                        label="Buyer Name"
                        sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
                    >
                        <MenuItem value="">All Buyers</MenuItem>
                        {buyers.map((buyer) => (
                            <MenuItem key={buyer} value={buyer}>{buyer}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Grid container spacing={2} flexGrow={1}>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="From Date"
                                value={fromDate}
                                onChange={(newDate) => setFromDate(newDate)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        sx: {
                                            '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#e2e8f0' } }
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DatePicker
                                label="To Date"
                                value={toDate}
                                onChange={(newDate) => setToDate(newDate)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        fullWidth: true,
                                        sx: {
                                            '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#e2e8f0' } }
                                        }
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </LocalizationProvider>
            </Box>

            <Fade in={!loading} timeout={600}>
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

                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 3 }}>
                        Quick Summary
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {cardData.map((card, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
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
                                                {card.title}
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', my: 0.5, color: '#1e293b' }}>
                                                {card.value}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <ArrowUpwardIcon sx={{ color: '#16a34a', fontSize: '1rem' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    <Box component="span" sx={{ color: '#16a34a', fontWeight: 'medium' }}>
                                                        {card.change}
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
                                                bgcolor: card.bgColor,
                                            }}
                                        >
                                            {React.cloneElement(card.icon, { sx: { color: card.color, fontSize: 28 } })}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {secondRowCardData.map((card, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
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
                                                {card.title}
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', my: 0.5, color: '#1e293b' }}>
                                                {card.value}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <ArrowUpwardIcon sx={{ color: '#16a34a', fontSize: '1rem' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    <Box component="span" sx={{ color: '#16a34a', fontWeight: 'medium' }}>
                                                        {card.change}
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
                                                bgcolor: card.bgColor,
                                            }}
                                        >
                                            {React.cloneElement(card.icon, { sx: { color: card.color, fontSize: 28 } })}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 3 }}>
                        Sales Analytics
                    </Typography>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {salesAnalyticsData.map((card, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
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
                                                {card.title}
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', my: 0.5, color: '#1e293b' }}>
                                                {card.value}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <ArrowUpwardIcon sx={{ color: '#16a34a', fontSize: '1rem' }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    <Box component="span" sx={{ color: '#16a34a', fontWeight: 'medium' }}>
                                                        {card.change}
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
                                                bgcolor: card.bgColor,
                                            }}
                                        >
                                            {React.cloneElement(card.icon, { sx: { color: card.color, fontSize: 28 } })}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

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
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 2, alignSelf: 'flex-start' }}>
                                    Key Business Trends over Time
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
            {/* <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                    value={selectedCategory}
                    onChange={handleDashboardCategoryChange}
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
            </FormControl> */}
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
    {/* Static Example Rows */}
    <TableRow hover>
        <TableCell>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=64&q=80" alt="SKU12345" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: '#212121', fontSize: 15 }}>
            Solar Lantern
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                High-efficiency LED, 12hr backup
            </Typography>
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#3b82f6', fontSize: 14 }}>
            SKU12345
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#6366f1', fontSize: 14 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0', mr: 1 }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" alt="Aervoe" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                Aervoe
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#64748b', fontSize: 14 }}>
            Electrical Supplies
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#475569', fontSize: 14 }}>
            09/01/2025
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 700, color: '#10b981', fontSize: 15 }}>
            250
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700, color: '#3b82f6', fontSize: 15 }}>
            $12,500.00
        </TableCell>
    </TableRow>
    <TableRow hover>
        <TableCell>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://images.unsplash.com/photo-1756908604030-04861dc79820?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw5fHx8ZW58MHx8fHx8" alt="SKU67890" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: '#212121', fontSize: 15 }}>
            Capacitor Pro
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                Long-life, high voltage
            </Typography>
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#3b82f6', fontSize: 14 }}>
            SKU67890
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#6366f1', fontSize: 14 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0', mr: 1 }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" alt="Thorlabs" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                Thorlabs
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#64748b', fontSize: 14 }}>
            Electrical Supplies
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#475569', fontSize: 14 }}>
            08/28/2025
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 700, color: '#10b981', fontSize: 15 }}>
            190
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700, color: '#3b82f6', fontSize: 15 }}>
            $9,500.00
        </TableCell>
    </TableRow>
    <TableRow hover>
        <TableCell>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=64&q=80" alt="SKU54321" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: '#212121', fontSize: 15 }}>
            Solar Collector
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                Efficient heat absorption
            </Typography>
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#3b82f6', fontSize: 14 }}>
            SKU54321
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#6366f1', fontSize: 14 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0', mr: 1 }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" alt="A.Y. McDonald" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                A.Y. McDonald
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#64748b', fontSize: 14 }}>
            Heating and Cooling Supplies
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#475569', fontSize: 14 }}>
            08/15/2025
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 700, color: '#10b981', fontSize: 15 }}>
            175
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700, color: '#3b82f6', fontSize: 15 }}>
            $8,750.00
        </TableCell>
    </TableRow>
    <TableRow hover>
        <TableCell>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://images.unsplash.com/photo-1670850664664-d8ed42d767fa?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YnJhbmQlMjBOQU1FfGVufDB8fDB8fHww" alt="SKU98765" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: '#212121', fontSize: 15 }}>
            Bushings Set
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                Durable, easy install
            </Typography>
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#3b82f6', fontSize: 14 }}>
            SKU98765
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#6366f1', fontSize: 14 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0', mr: 1 }}>
                    <img src="https://images.unsplash.com/photo-1548364538-60b952c308b9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fEJSQU5EfGVufDB8fDB8fHww" alt="Mohawkgroup" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                Mohawkgroup
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#64748b', fontSize: 14 }}>
            Automotive Supplies
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#475569', fontSize: 14 }}>
            08/10/2025
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 700, color: '#10b981', fontSize: 15 }}>
            150
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700, color: '#3b82f6', fontSize: 15 }}>
            $7,500.00
        </TableCell>
    </TableRow>
    <TableRow hover>
        <TableCell>
            <Box sx={{ width: 44, height: 44, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=64&q=80" alt="SKU24680" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 600, color: '#212121', fontSize: 15 }}>
            Wires & Cables
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                Flexible, high conductivity
            </Typography>
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#3b82f6', fontSize: 14 }}>
            SKU24680
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#6366f1', fontSize: 14 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0', mr: 1 }}>
                    <img src="https://images.unsplash.com/photo-1670850664664-d8ed42d767fa?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YnJhbmQlMjBOQU1FfGVufDB8fDB8fHww" alt="Irwin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                Irwin
            </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 500, color: '#64748b', fontSize: 14 }}>
            Hardware Supplies
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 500, color: '#475569', fontSize: 14 }}>
            08/05/2025
        </TableCell>
        <TableCell align="center" sx={{ fontWeight: 700, color: '#10b981', fontSize: 15 }}>
            140
        </TableCell>
        <TableCell align="right" sx={{ fontWeight: 700, color: '#3b82f6', fontSize: 15 }}>
            $7,000.00
        </TableCell>
    </TableRow>
    {/* Dynamic Data */}
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
                {/* <Typography variant="body1" color="textSecondary">
                    No products found
                </Typography> */}
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
                {displayedDealers && displayedDealers.length > 0 ? (
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
                                    index === 2 ? '#10b981' :
                                    index === 3 ? '#f59e0b' :
                                    '#64748b'
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
                                        {dealer.imageUrl && (
                                            <img
                                                src={dealer.imageUrl}
                                                alt={dealer.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        )}
                                    </Box>
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
                                                index === 2 ? '#f97316' :
                                                index === 3 ? '#3b82f6' :
                                                '#8b5cf6',
                                        }}
                                    >
                                        {index + 1}
                                    </Box>
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
</Grid>
                    
                </Box>
            </Fade>
        </Box>
    );
};

export default ManufacturerHome;