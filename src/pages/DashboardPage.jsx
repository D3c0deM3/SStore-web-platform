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
import VIP from "../assets/dashboard/vip.svg";

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
            ? `${apiBaseUrl}${marketData.profile_picture}`
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

  // Prepare chart data when profits are available
  useEffect(() => {
    if (profits.length > 0) {
      // Create labels based on the number of profit entries
      const labels = profits.map((_, index) => `${index + 1}-sentyabr`);

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

  const plan_icon = `../assets/dashboard/${user?.plan}.svg`;
  // Find significant profit points for annotations (if needed)
  // const findSignificantProfits = () => {
  //   if (!profits || profits.length === 0) return [];

  //   let significantPoints = [];
  //   // Find max profit
  //   const maxProfit = Math.max(...profits);
  //   const minIndex = profits.indexOf(maxProfit);
  //   if (maxProfit > 0) {
  //     significantPoints.push({
  //       value: maxProfit,
  //       index: maxIndex,
  //       label: `+${maxProfit.toLocaleString()} UZS`,
  //       color: "#4ade80",
  //     });
  //   }

  //   // Find min profit (largest loss)
  //   const minProfit = Math.min(...profits);
  //   const minIndex = profits.indexOf(minProfit);
  //   if (minProfit < 0) {
  //     significantPoints.push({
  //       value: minProfit,
  //       index: minIndex,
  //       label: `${minProfit.toLocaleString()} UZS`,
  //       color: "#ff4d4f",
  //     });
  //   }

  //   // Find last significant change
  //   const lastNonZero = profits
  //     .slice()
  //     .reverse()
  //     .find((p) => p !== 0);
  //   const lastIndex = profits.lastIndexOf(lastNonZero);
  //   if (lastNonZero && lastIndex !== maxIndex && lastIndex !== minIndex) {
  //     significantPoints.push({
  //       value: lastNonZero,
  //       index: lastIndex,
  //       label: `${
  //         lastNonZero > 0 ? "+" : ""
  //       }${lastNonZero.toLocaleString()} UZS`,
  //       color: lastNonZero > 0 ? "#4ade80" : "#ff4d4f",
  //     });
  //   }

  //   return significantPoints;
  // }; // Commented out due to ESLint no-unused-vars warning

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <img src={logo} alt="SStore Logo" className="logo" />
        <nav className="menu">
          <ul>
            <li>
              <img src={homeIcon} alt="Home" />
              Asosiy sahifa
            </li>
            <li>
              <img src={historyIcon} alt="History" />
              Hisobotlar
            </li>
            <li>
              <img src={productsIcon} alt="Products" />
              Mahsulotlar
            </li>
            <li>
              <img src={calculatorIcon} alt="Calculator" />
              Kalkulyator
            </li>
            <li>
              <img src={aiIcon} alt="AI" />
              AI maslahat
            </li>
          </ul>
        </nav>
        <div className="vip-plan">
          <img src={plan_icon} alt="" />
          {user?.plan} PLAN
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="search-container">
            <img src={searchIcon} alt="Search" />
            <input type="text" placeholder="Qidiruv..." />
          </div>
          <div className="profile-container">
            <div>
              <span>{user?.name}</span>
              <span>{user?.phone}</span>
            </div>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
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
          </div>
        </header>

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

        <section className="products-section">
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

          <div className="table-container">
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
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
