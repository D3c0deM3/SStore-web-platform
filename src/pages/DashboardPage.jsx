import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
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
import graphIcon from "../assets/dashboard/graph-icon.svg";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  ChartDataLabels // Register the datalabels plugin
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

  // Add chartOptions state
  const [chartOptions, setChartOptions] = useState({
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
        tension: 0, // Sharp lines
      },
      point: {
        radius: 0, // Hide points by default
      },
    },
  });

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

  // UPDATED: Chart data preparation with sharp lines and color segments
  useEffect(() => {
    if (profits.length > 0) {
      // Create evenly spaced labels for September with 5-day intervals
      const labels = [
        "1-sentyabr",
        "5-sentyabr",
        "10-sentyabr",
        "15-sentyabr",
        "20-sentyabr",
        "25-sentyabr",
        "30-sentyabr",
      ];

      // Prepare data points from profits array
      const dataPoints = [];

      if (profits.length === 1) {
        // If only one data point, repeat it
        for (let i = 0; i < 7; i++) {
          dataPoints.push(profits[0]);
        }
      } else if (profits.length < 7) {
        // Linear interpolation for fewer data points
        const step = (profits.length - 1) / 6;
        for (let i = 0; i < 7; i++) {
          const index = Math.min(profits.length - 1, Math.floor(i * step));
          dataPoints.push(profits[index]);
        }
      } else {
        // If we have more data points, sample them
        const step = (profits.length - 1) / 6;
        for (let i = 0; i < 7; i++) {
          const index = Math.min(profits.length - 1, Math.floor(i * step));
          dataPoints.push(profits[index]);
        }
      }

      // Find max and min for setting y-axis scale properly
      const maxProfit = Math.max(...dataPoints);
      const minProfit = Math.min(...dataPoints);
      const yAxisMax = Math.ceil((maxProfit * 1.2) / 1000000) * 1000000; // Round up to nearest million and add 20% padding

      setChartData({
        labels: labels,
        datasets: [
          {
            label: "Profit",
            data: dataPoints,
            borderColor: (context) => {
              // Check if we're between points
              if (context.dataIndex > 0) {
                const prev = context.dataset.data[context.dataIndex - 1];
                const curr = context.dataset.data[context.dataIndex];
                // Return green for upward trends, red for downward
                return prev < curr ? "#4ade80" : "#ff4d4f";
              }
              return "#4ade80"; // Default color
            },
            segment: {
              borderColor: (ctx) =>
                ctx.p0.parsed.y < ctx.p1.parsed.y ? "#4ade80" : "#ff4d4f",
            },
            tension: 0, // Set to 0 for sharp lines instead of smooth curves
            borderWidth: 3,
            pointRadius: 4, // Make points visible to show extreme values
            pointBackgroundColor: function (context) {
              const value = context.dataset.data[context.dataIndex];
              // If this is a local max or min, use appropriate color
              if (
                context.dataIndex > 0 &&
                context.dataIndex < dataPoints.length - 1
              ) {
                const prev = dataPoints[context.dataIndex - 1];
                const next = dataPoints[context.dataIndex + 1];

                // Check if it's a local maximum or minimum
                if (
                  (value > prev && value > next) ||
                  (value < prev && value < next)
                ) {
                  return value >= prev ? "#4ade80" : "#ff4d4f";
                }
              }
              // For first and last points
              else if (
                context.dataIndex === 0 ||
                context.dataIndex === dataPoints.length - 1
              ) {
                return "#FFFFFF"; // White for start/end points
              }

              return "transparent"; // Hide non-extreme points
            },
            pointBorderColor: function (context) {
              const value = context.dataset.data[context.dataIndex];
              // If this is a local max or min, use appropriate color
              if (
                context.dataIndex > 0 &&
                context.dataIndex < dataPoints.length - 1
              ) {
                const prev = dataPoints[context.dataIndex - 1];
                const next = dataPoints[context.dataIndex + 1];

                // Check if it's a local maximum or minimum
                if (
                  (value > prev && value > next) ||
                  (value < prev && value < next)
                ) {
                  return value >= prev ? "#4ade80" : "#ff4d4f";
                }
              }
              // For first and last points
              else if (
                context.dataIndex === 0 ||
                context.dataIndex === dataPoints.length - 1
              ) {
                return "#FFFFFF"; // White for start/end points
              }

              return "transparent"; // Hide non-extreme points
            },
            fill: false,
          },
        ],
      });

      // Update chart options with dynamic scale based on data
      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false, // Don't force zero if not needed
            suggestedMin: Math.max(0, minProfit * 0.8), // Lower bound with 20% padding but not below zero
            suggestedMax: yAxisMax, // Upper bound with padding
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
              // Dynamically set step size based on range
              stepSize: Math.ceil(yAxisMax / 5 / 1000000) * 1000000,
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
          // Updated datalabels configuration to always show extreme points
          datalabels: {
            align: function (context) {
              const value = context.dataset.data[context.dataIndex];
              if (
                context.dataIndex > 0 &&
                context.dataIndex < dataPoints.length - 1
              ) {
                const prev = dataPoints[context.dataIndex - 1];
                const next = dataPoints[context.dataIndex + 1];

                // For peaks (local maxima), align on top
                if (value > prev && value > next) {
                  return "top";
                }
                // For valleys (local minima), align below
                else if (value < prev && value < next) {
                  return "bottom";
                }
              }
              return "center";
            },
            anchor: "center",
            color: function (context) {
              const value = context.dataset.data[context.dataIndex];
              // Check if this is an extreme point
              if (
                context.dataIndex > 0 &&
                context.dataIndex < dataPoints.length - 1
              ) {
                const prev = dataPoints[context.dataIndex - 1];
                const next = dataPoints[context.dataIndex + 1];

                // Check if it's a local maximum or minimum
                if (
                  (value > prev && value > next) ||
                  (value < prev && value < next)
                ) {
                  return value >= prev ? "#4ade80" : "#ff4d4f";
                }
              }
              return "transparent"; // Hide non-extreme labels
            },
            backgroundColor: function (context) {
              const value = context.dataset.data[context.dataIndex];
              // Add a slight background to make labels more readable
              if (
                context.dataIndex > 0 &&
                context.dataIndex < dataPoints.length - 1
              ) {
                const prev = dataPoints[context.dataIndex - 1];
                const next = dataPoints[context.dataIndex + 1];

                if (
                  (value > prev && value > next) ||
                  (value < prev && value < next)
                ) {
                  return "rgba(0, 0, 0, 0.6)";
                }
              }
              return "transparent";
            },
            borderRadius: 4,
            formatter: function (value, context) {
              // Format for extreme points
              if (
                context.dataIndex > 0 &&
                context.dataIndex < dataPoints.length - 1
              ) {
                const prev = dataPoints[context.dataIndex - 1];
                const next = dataPoints[context.dataIndex + 1];

                // Check if it's a local maximum or minimum
                if (
                  (value > prev && value > next) ||
                  (value < prev && value < next)
                ) {
                  if (value >= 1000000)
                    return (value / 1000000).toFixed(1) + "M";
                  if (value >= 1000) return (value / 1000).toFixed(0) + "K";
                  return value.toLocaleString();
                }
              }
              return ""; // Hide non-extreme labels
            },
            // Always display for extreme points, no hover needed
            display: function (context) {
              const value = context.dataset.data[context.dataIndex];
              // Only show extreme points
              if (
                context.dataIndex > 0 &&
                context.dataIndex < dataPoints.length - 1
              ) {
                const prev = dataPoints[context.dataIndex - 1];
                const next = dataPoints[context.dataIndex + 1];

                // Check if it's a local maximum or minimum
                return (
                  (value > prev && value > next) ||
                  (value < prev && value < next)
                );
              }
              return false; // Hide non-extreme labels
            },
            font: {
              weight: "bold",
              size: 12,
            },
            padding: {
              top: 5,
              bottom: 5,
              left: 8,
              right: 8,
            },
            offset: 8, // Distance from the point
          },
        },
        elements: {
          line: {
            tension: 0, // Sharp lines
          },
          point: {
            radius: function (context) {
              const value = context.dataset.data[context.dataIndex];
              // Make extreme points more visible
              if (
                context.dataIndex > 0 &&
                context.dataIndex < dataPoints.length - 1
              ) {
                const prev = dataPoints[context.dataIndex - 1];
                const next = dataPoints[context.dataIndex + 1];

                // Check if it's a local maximum or minimum
                if (
                  (value > prev && value > next) ||
                  (value < prev && value < next)
                ) {
                  return 6; // Larger radius for extreme points
                }
              }
              // Show first and last points with smaller radius
              else if (
                context.dataIndex === 0 ||
                context.dataIndex === dataPoints.length - 1
              ) {
                return 3;
              }
              return 0; // Hide non-extreme points when not hovering
            },
            hoverRadius: 6, // Radius when hovering
          },
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
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
            <div className="graph-head-content">
              <div className="graph-headline-left">
                <img src={graphIcon} alt="" />
                <h3>Oylik Sof Foyda</h3>
              </div>
              <span className="more-button">batafsil →</span>
            </div>
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

          {/* Barcha Mahsulotlar Table - With zebra striping applied in CSS */}
          <div className="table-container products-table">
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
