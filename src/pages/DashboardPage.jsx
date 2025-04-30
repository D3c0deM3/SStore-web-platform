import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import "../styles/DashboardPage.css";

import logo from "../assets/landing-page/logo-image.svg";
import homeIcon from "../assets/dashboard/home-icon.svg";
import historyIcon from "../assets/dashboard/report.svg";
import productsIcon from "../assets/dashboard/products.svg";
import calculatorIcon from "../assets/dashboard/calculator.svg";
import aiIcon from "../assets/dashboard/ai-icon.svg";
import searchIcon from "../assets/dashboard/search.svg";
import profileIcon from "../assets/dashboard/profile.png";

import basicPlanIcon from "../assets/dashboard/basic.svg";
import proPlanIcon from "../assets/dashboard/pro.svg";
import vipPlanIcon from "../assets/dashboard/vip.svg";
import profileArrowIcon from "../assets/dashboard/down_arrow.svg";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(
    location.state?.dashboardData || null
  );
  const [loading, setLoading] = useState(!dashboardData);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [chartData, setChartData] = useState(null);

  // Extract data from the dashboardData for easier access
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState(0);
  // const [productsBySells, setProductsBySells] = useState([]); // Commented out due to ESLint no-unused-vars warning
  const [productsByPrice, setProductsByPrice] = useState([]);
  const [profits, setProfits] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/dashboard`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        const rawText = await response.text();
        if (rawText.trim()) {
          try {
            const data = JSON.parse(rawText);
            setDashboardData(data);
            setLoading(false);
          } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
            setError("Invalid server response. Please try again later.");
            setLoading(false);
          }
        } else {
          console.log("Response was empty.");
          setError("No dashboard data found.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          "Failed to fetch dashboard data. Please check your connection."
        );
        setLoading(false);
      }
    };

    if (!dashboardData) {
      fetchDashboardData();
    }
  }, [dashboardData, navigate, apiBaseUrl]);

  // Process dashboard data when it's available
  useEffect(() => {
    if (dashboardData && Array.isArray(dashboardData)) {
      // Extract market data for user info
      const marketDataObj = dashboardData.find((item) => item.market_data);
      if (marketDataObj && marketDataObj.market_data) {
        const marketData = marketDataObj.market_data;
        setUser({
          name: marketData.market_name || "Unknown Market",
          phone: marketData.phone_number || "No phone number",
          plan: marketData.plan || "Unknown plan",
          profileImage: marketData.profile_picture
            ? `${marketData.profile_picture}`
            : null,
        });
      } else {
        setUser({
          name: "Unknown Market",
          phone: "No phone number",
          plan: "Unknown plan",
          profileImage: null,
        });
      }

      // Extract products
      const productsObj = dashboardData.find((item) => item.products);
      if (productsObj) {
        setProducts(productsObj.products || []);
      }

      // Extract quantity
      const quantityObj = dashboardData.find(
        (item) => item.quantity !== undefined
      );
      if (quantityObj) {
        setQuantity(quantityObj.quantity || 0);
      }

      // Extract products by sells
      // const productsBySellsObj = dashboardData.find(
      //   (item) => item.products_by_sells
      // );
      // if (productsBySellsObj) {
      //   setProductsBySells(productsBySellsObj.products_by_sells || []);
      // } // Commented out due to ESLint no-unused-vars warning

      // Extract products by price
      const productsByPriceObj = dashboardData.find(
        (item) => item.products_by_price
      );
      if (productsByPriceObj) {
        setProductsByPrice(productsByPriceObj.products_by_price || []);

        // Calculate total revenue
        const total = (productsByPriceObj.products_by_price || []).reduce(
          (sum, product) => sum + (product.total_sold_price || 0),
          0
        );
        setTotalRevenue(total);
      }

      // Extract profits
      const profitsObj = dashboardData.find((item) => item.profit);
      if (profitsObj) {
        setProfits(profitsObj.profit || []);
      }
    }
  }, [dashboardData, apiBaseUrl]);

  console.log(user);
  // Prepare chart data when profits are available
  useEffect(() => {
    if (profits.length > 0) {
      // Calculate how many points we need to distribute evenly across September's 30 days
      const totalDays = 30; // September has 30 days
      const dataPoints = profits.length;

      // Create evenly spaced labels for September
      const labels = [];

      if (dataPoints === 1) {
        // If there's only one data point, just show mid-month
        labels.push("15-sentyabr");
      } else {
        // Calculate step size to evenly distribute points
        const step = dataPoints > 1 ? (totalDays - 1) / (dataPoints - 1) : 0;

        // Generate labels for evenly spaced days
        for (let i = 0; i < dataPoints; i++) {
          const day = Math.round(1 + i * step);
          // Ensure day is within valid range (1-30)
          const validDay = Math.max(1, Math.min(30, day));
          labels.push(`${validDay}-sentyabr`);
        }
      }

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "Profit",
            data: profits,
            borderColor: "#4ade80",
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 0,
            fill: false,
          },
        ],
      });
    }
  }, [profits]);
  const getPlanIcon = (planType) => {
    if (!planType) return null;

    const planTypeLower = planType.toLowerCase();

    if (planTypeLower.includes("basic")) {
      return basicPlanIcon;
    } else if (planTypeLower.includes("pro")) {
      return proPlanIcon;
    } else if (planTypeLower.includes("vip")) {
      return vipPlanIcon;
    }

    // Default to basic if unknown
    return basicPlanIcon;
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!dashboardData || dashboardData.length === 0) {
    return <div className="no-data">No data yet! Add your first product.</div>;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#a0aec0",
          callback: function (value) {
            if (value >= 1000000) return value / 1000000 + "M";
            else if (value >= 1000) return value / 1000 + "K";
            return value;
          },
          stepSize: 5000000,
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#a0aec0",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            let value = context.parsed.y;
            if (value) {
              return value.toLocaleString() + " UZS";
            }
            return "";
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  return (
    <div className="dashboard">
      {/* Left Sidebar with Menu */}
      <aside className="sidebar">
        <img src={logo} alt="SStore Logo" className="logo" />
        <span className="logo_underline"></span>
        <nav className="menu">
          <p className="sidebar-menu">Menu</p>
          <ul>
            <li
              className={location.pathname === "/dashboard" ? "active" : ""}
              onClick={() => navigate("/dashboard")}
            >
              <img src={homeIcon} alt="Home" />
              Asosiy sahifa
            </li>
            <li
              className={location.pathname === "/hisobotlar" ? "active" : ""}
              onClick={() => navigate("/hisobotlar")}
            >
              <img src={historyIcon} alt="History" />
              Hisobotlar
            </li>
            <li
              className={location.pathname === "/mahsulotlar" ? "active" : ""}
              onClick={() => navigate("/mahsulotlar")}
            >
              <img src={productsIcon} alt="Products" />
              Mahsulotlar
            </li>
            <li
              className={location.pathname === "/kalkulyator" ? "active" : ""}
              onClick={() => navigate("/kalkulyator")}
            >
              <img src={calculatorIcon} alt="Calculator" />
              Kalkulyator
            </li>
            <li
              className={location.pathname === "/ai-maslahat" ? "active" : ""}
              onClick={() => navigate("/ai-maslahat")}
            >
              <img src={aiIcon} alt="AI" />
              AI maslahat
            </li>
          </ul>
        </nav>
        <div className="vip-plan">
          {user?.plan && (
            <img
              src={getPlanIcon(user.plan)}
              alt={`${user.plan} Icon`}
              className="plan-icon"
            />
          )}
          {user?.plan} PLAN
        </div>
      </aside>

      {/* Content wrapper for all three sections */}
      <div className="content-wrapper">
        {/* Main Column for Search, Stats, Chart and Top Selling - Now in the center */}
        <main className="main-content">
          {/* Search Bar */}
          <div className="search-container">
            <img src={searchIcon} alt="Search" />
            <input type="text" placeholder="Qidiruv..." />
          </div>

          {/* Stats Cards */}
          <section className="stats-cards">
            <div className="card">
              <h3>Mahsulotlar</h3>
              <p>{quantity}</p>
            </div>
            <div className="card">
              <h3>Joriy daromad</h3>
              <p>{totalRevenue.toLocaleString()} UZS</p>
            </div>
          </section>

          {/* Chart Section */}
          <section className="chart-section">
            <h3>Oylik Sof Foyda</h3>
            <div className="chart-wrapper">
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <p>Loading chart...</p>
              )}
            </div>
          </section>

          {/* Top Selling Products */}
          <section className="top-selling-section">
            <div className="table-container">
              <h3>Top Selling products</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sales</th>
                    <th>Amount</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {productsByPrice.length > 0 ? (
                    productsByPrice.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>
                          {(product.total_subtracted || 0).toLocaleString()}{" "}
                          {product.quantity_type}
                        </td>
                        <td>
                          {product.quantity.toLocaleString()}{" "}
                          {product.quantity_type}
                        </td>
                        <td>{product.total_sold_price.toLocaleString()} UZS</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No sales data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Right Column for Profile and Barcha Mahsulotlar */}
        <div className="right-column">
          {/* Profile Info */}
          <div className="profile-section">
            <div className="profile-container">
              {user?.profileImage ? (
                <img
                  src={`https://res.cloudinary.com/bnf404/${user.profileImage}`}
                  alt="Profile"
                  className="profile-pic"
                />
              ) : (
                <img
                  src={profileIcon}
                  alt="Profile Icon"
                  className="profile-pic"
                />
              )}
              <div>
                <span>{user?.name}</span>
                <span>{user?.phone}</span>
              </div>
              <img
                src={profileArrowIcon}
                alt="arr"
                className="profile_arrow_icon"
              />
            </div>
          </div>

          {/* Barcha Mahsulotlar Table */}
          <div className="table-container products-table">
            <h3>Barcha Mahsulotlar</h3>
            <table>
              <thead>
                <tr>
                  <th>Mahsulot</th>
                  <th>Miqdori</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center">
                      No products available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
