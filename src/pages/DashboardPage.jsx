import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(
    location.state?.dashboardData || null
  );
  const [loading, setLoading] = useState(!dashboardData);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // No token? Redirect to login
        return;
      }

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

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
  }, [dashboardData, navigate]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!dashboardData || dashboardData.length === 0) {
    return <div>No data yet! Add your first product.</div>;
  }

  // Extract the different parts
  const products = dashboardData.find((d) => d.products)?.products || [];
  const quantity =
    dashboardData.find((d) => d.quantity !== undefined)?.quantity ?? 0;
  const productsBySells =
    dashboardData.find((d) => d.products_by_sells)?.products_by_sells || [];
  const productsByPrice =
    dashboardData.find((d) => d.products_by_price)?.products_by_price || [];
  const profits = dashboardData.find((d) => d.profit)?.profit || [];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <section>
        <h2>Products</h2>
        {products.length > 0 ? (
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                {product.name} - {product.quantity} ({product.quantity_type}) -{" "}
                {product.price_per_quantity} UZS
              </li>
            ))}
          </ul>
        ) : (
          <p>No products available.</p>
        )}
      </section>

      <section>
        <h2>Total Quantity</h2>
        <p>{quantity}</p>
      </section>

      <section>
        <h2>Top Selling Products (by sells)</h2>
        {productsBySells.length > 0 ? (
          <ul>
            {productsBySells.map((product) => (
              <li key={product.id}>
                {product.name} - Sold: {product.total_subtracted} times
              </li>
            ))}
          </ul>
        ) : (
          <p>No sales data available.</p>
        )}
      </section>

      <section>
        <h2>Top Selling Products (by total money)</h2>
        {productsByPrice.length > 0 ? (
          <ul>
            {productsByPrice.map((product) => (
              <li key={product.id}>
                {product.name} - Earned: {product.total_sold_price} UZS
              </li>
            ))}
          </ul>
        ) : (
          <p>No earnings data available.</p>
        )}
      </section>

      <section>
        <h2>Profits (Last Days)</h2>
        {profits.length > 0 ? (
          <ul>
            {profits.map((profit, index) => (
              <li key={index}>
                Day {index + 1}: {profit} UZS
              </li>
            ))}
          </ul>
        ) : (
          <p>No profit data available.</p>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
