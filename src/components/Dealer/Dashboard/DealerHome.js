import React, { useState, useEffect } from "react";
import axios from "axios";
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
import { Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart as ShoppingCartIcon,
  LocalOffer as LocalOfferIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Inventory2 as Inventory2Icon,
} from "@mui/icons-material";

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
  const user = JSON.parse(localStorage.getItem("user"));
  const [dashboardData, setDashboardData] = useState(null);
  const [topSellingProducts, setTopSellingProducts] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dashboardCategory, setDashboardCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Dashboard Data from API
  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IP}obtainDashboardDetailsForDealer/?manufacture_unit_id=${user.manufacture_unit_id}&user_id=${user.id}`
      );
      setDashboardData(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !dashboardData) {
      fetchDashboardData();
    }
  }, [user, dashboardData]);

  // Fetch Top Selling Products
  const fetchTopSellingProducts = async (categoryId = "") => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_IP}topSellingProductsForDashBoard/?manufacture_unit_id=${user.manufacture_unit_id}&product_category_id=${categoryId}`
      );
      setTopSellingProducts(response.data.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopSellingProducts();
  }, []);

  // Fetch Categories
  useEffect(() => {
    const fetchDashboardCategory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IP}obtainEndlevelcategoryList/?manufacture_unit_id=${user.manufacture_unit_id}`
        );
        setDashboardCategory(response.data.data || []);
      } catch (error) {}
    };
    fetchDashboardCategory();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Analytics Data
  const analyticsData = [
    {
      title: "Total Spendings",
      value: `$${dashboardData.total_spend.toFixed(2) || "0"}`,
      icon: <AttachMoneyIcon fontSize="large" className="text-green-600" />,
      color: "bg-green-100 border-green-500 text-green-700",
      hoverColor: "hover:bg-green-50",
      onClick: () => handleTotalSpendingsClick(),
    },
    {
      title: "Total Orders",
      value: dashboardData.total_order_count || "0",
      icon: <ShoppingCartIcon fontSize="large" className="text-blue-600" />,
      color: "bg-blue-100 border-blue-500 text-blue-700",
      hoverColor: "hover:bg-blue-50",
      onClick: () => handleTotalOrdersClick(),
    },
    {
      title: "Pending Payments",
      value: dashboardData.pending_order_count || "0",
      icon: <TrendingUpIcon fontSize="large" className="text-red-600" />,
      color: "bg-red-100 border-red-500 text-red-700",
      hoverColor: "hover:bg-red-50",
      onClick: () => handlePendingClick(),
    },
    {
      title: "Re-Orders",
      value: dashboardData.re_order_count || "0",
      icon: <Inventory2Icon fontSize="large" className="text-purple-600" />,
      color: "bg-purple-100 border-purple-500 text-purple-700",
      hoverColor: "hover:bg-purple-50",
      onClick: () => handleReorderClick(),
    },
  ];

  // Bar Chart Data for Top Selling Brands
  const barDataBrands = {
    labels: dashboardData.top_selling_brands.map(
      (_, index) => `Top ${index + 1}`
    ),
    datasets: [
      {
        label: "Products Sold",
        data: dashboardData.top_selling_brands.map((brand) => brand.units_sold),
        backgroundColor: [
          "rgba(33, 150, 243, 1)",
          "rgba(33, 150, 243, 0.8)",
          "rgba(33, 150, 243, 0.6)",
          "rgba(33, 150, 243, 0.4)",
          "rgba(33, 150, 243, 0.2)",
        ],
        borderColor: "rgba(33, 150, 243, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Line Chart Data for Top Selling Categories
  const lineDataCategories = {
    labels: dashboardData.top_selling_categorys.map(
      (_, index) => `Top ${index + 1}`
    ),
    datasets: [
      {
        label: "Products Sold",
        data: dashboardData.top_selling_categorys.map(
          (category) => category.units_sold
        ),
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
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.raw !== null) {
              label += context.raw;
            }
            if (context.dataset.label === "Products Sold") {
              const index = context.dataIndex;
              if (context.chart.id === 'bar-chart-brands') {
                const brandName = dashboardData.top_selling_brands[index]?.brand_name;
                return brandName ? `${brandName}: ${context.raw} units` : label;
              } else if (context.chart.id === 'line-chart-categories') {
                const categoryName = dashboardData.top_selling_categorys[index]?.category_name;
                return categoryName ? `${categoryName}: ${context.raw} units` : label;
              }
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: { display: true },
      y: { beginAtZero: true },
    },
  };

  const handleTotalSpendingsClick = () => {
    navigate("/dealer/orders", {
      state: { filter: { payment_status: "Completed" } },
    });
  };

  const handlePendingClick = () => {
    navigate("/dealer/orders", {
      state: { filter: { payment_status: "Pending" } },
    });
  };

  const handleReorderClick = () => {
    navigate("/dealer/orders", { state: { is_reorder: "yes" } });
  };

  const handleTotalOrdersClick = () => {
    navigate(`/dealer/orders`);
  };

  const handleOrderClick = (orderId) => {
    navigate("/dealer/OrderDetail", { state: { orderId } });
  };

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);
    fetchTopSellingProducts(categoryId);
  };

  const handleProductClick = (productId) => {
    navigate(`/dealer/products/${productId}`);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen font-roboto">
      {/* Analytics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {analyticsData.map((item, index) => (
          <div
            key={index}
            onClick={item.onClick}
            className={`${item.color} ${item.hoverColor} bg-white rounded-xl shadow-lg border-l-4 p-4 sm:p-6 cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium opacity-75">{item.title}</p>
                <p className="text-xl sm:text-2xl font-bold mt-1">{item.value}</p>
              </div>
              <div className="text-2xl sm:text-3xl opacity-75">{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Bar Chart for Top Selling Brands */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-shadow duration-300 hover:shadow-xl">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 border-b pb-2">
            Top Selling Brands
          </h3>
          <div className="h-60 sm:h-72">
            <Bar data={barDataBrands} options={chartOptions} id="bar-chart-brands" />
          </div>
        </div>

        {/* Line Chart for Top Selling Categories */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-shadow duration-300 hover:shadow-xl">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 border-b pb-2">
            Top Selling Categories
          </h3>
          <div className="h-60 sm:h-72">
            <Line data={lineDataCategories} options={chartOptions} id="line-chart-categories" />
          </div>
        </div>
      </div>

      {/* Top Selling Products Table & Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-8 items-start">
        {/* Top Selling Products Table (80%) */}
        <div className="xl:col-span-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 sm:mb-6 gap-2">
            <div className="flex items-center gap-2">
              <LocalOfferIcon className="text-blue-500" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900" style={{ fontFamily: "Google Sans,Roboto,Arial,sans-serif" }}>
                Top Selling Products
              </h3>
            </div>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white"
              style={{ fontFamily: "Google Sans,Roboto,Arial,sans-serif", fontWeight: 500, minWidth: 120, maxWidth: 220 }}
            >
              <option value="">All Categories</option>
              {dashboardCategory?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm" style={{ fontFamily: "Google Sans,Roboto,Arial,sans-serif" }}>
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-gray-500 tracking-wider" style={{ fontWeight: 700, width: 160, minWidth: 120 }}>
                    Product
                  </th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-gray-500 tracking-wider" style={{ fontWeight: 700, width: 90, minWidth: 90 }}>
                    SKU
                  </th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-gray-500 tracking-wider" style={{ fontWeight: 700, width: 90, minWidth: 90 }}>
                    Brand
                  </th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-gray-500 tracking-wider" style={{ fontWeight: 700, width: 90, minWidth: 90 }}>
                    Category
                  </th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-left font-semibold text-gray-500 tracking-wider" style={{ fontWeight: 700, width: 90, minWidth: 90 }}>
                    Last Purchase
                  </th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-center font-semibold text-gray-500 tracking-wider" style={{ fontWeight: 700, width: 60, minWidth: 60 }}>
                    Sold
                  </th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-right font-semibold text-gray-500 tracking-wider" style={{ fontWeight: 700, width: 90, minWidth: 90 }}>
                    Sales ($)
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts?.top_selling_products &&
                topSellingProducts.top_selling_products.length > 0 ? (
                  topSellingProducts.top_selling_products.map((product) => (
                    <tr
                      key={product.id}
                      onClick={() => handleProductClick(product.product_id)}
                      className="group hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition"
                      style={{ height: 56 }}
                    >
                      {/* Product Info */}
                      <td className="py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-4">
                          <img
                            src={product.primary_image}
                            alt={product.product_name}
                            className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200"
                            style={{ boxShadow: "0 1px 4px rgba(60,64,67,.08)" }}
                          />
                          <div className="font-semibold text-gray-900 truncate max-w-[90px] sm:max-w-[140px]">
                            {product.product_name}
                          </div>
                        </div>
                      </td>
                      {/* SKU */}
                      <td className="py-3 px-2 sm:px-4 align-middle">
                        <span className="text-xs text-gray-500 truncate">{product.sku_number}</span>
                      </td>
                      {/* Brand */}
                      <td className="py-3 px-2 sm:px-4 align-middle">
                        <div className="flex items-center gap-2">
                          {product.brand_logo && product.brand_logo.startsWith("http") ? (
                            <>
                              <img
                                src={product.brand_logo}
                                alt={product.brand_name}
                                className="w-5 h-5 sm:w-7 sm:h-7 rounded-md"
                                style={{ background: "#f5f5f5", border: "1px solid #eee" }}
                              />
                              <span className="text-xs text-gray-700 font-medium">{product.brand_name}</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-700 font-medium">{product.brand_name}</span>
                          )}
                        </div>
                      </td>
                      {/* Category */}
                      <td className="py-3 px-2 sm:px-4 align-middle">
                        <span className="text-xs text-gray-700 font-medium">{product.category_name}</span>
                      </td>
                      {/* Last Purchase */}
                      <td className="py-3 px-2 sm:px-4 align-middle">
                        <div className="font-semibold text-gray-900">
                          {product.last_updated ? new Date(product.last_updated).toLocaleDateString() : "--"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.days_left || ""}
                        </div>
                      </td>
                      {/* Sold */}
                      <td className="py-3 px-2 sm:px-4 align-middle text-center">
                        <span className="font-semibold text-gray-900">{product.units_sold}</span>
                      </td>
                      {/* Sales ($) */}
                      <td className="py-3 px-2 sm:px-4 align-middle text-right">
                        <span className="font-semibold text-gray-900">
                          ${product.total_sales ? product.total_sales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-sm text-gray-500"
                      style={{ fontFamily: "Google Sans,Roboto,Arial,sans-serif" }}
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Recent Orders (20%) */}
        <div className="xl:col-span-1 flex flex-col h-full mt-6 xl:mt-0">
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-3 sm:p-4 flex flex-col flex-grow">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <ShoppingCartIcon className="text-blue-500" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-0" style={{ fontFamily: "Google Sans,Roboto,Arial,sans-serif" }}>
                Your Recent Orders
              </h3>
            </div>
            <div className="flex-1 space-y-2 sm:space-y-3 overflow-y-auto">
              {dashboardData.recent_orders.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[80px] sm:min-h-[120px]">
                  <p className="text-center text-gray-500" style={{ fontFamily: "Google Sans,Roboto,Arial,sans-serif" }}>
                    No Recent Orders available
                  </p>
                </div>
              ) : (
                dashboardData.recent_orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => handleOrderClick(order.id)}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-2 sm:p-3 cursor-pointer transition-all duration-150 hover:shadow-md flex flex-col gap-1"
                    style={{
                      fontFamily: "Google Sans,Roboto,Arial,sans-serif",
                      borderLeft: "4px solid #4285f4",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">
                        Order #{order.order_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="font-medium">Order Value:</span>
                      <span>${order.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="font-medium">Order Date:</span>
                      <span>{new Date(order.order_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">Payment Status:</span>
                      <span style={{
                        color: order.payment_status === "Completed" ? "#34a853" : "#ea4335",
                        fontWeight: 600,
                      }}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
