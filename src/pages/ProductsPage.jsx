import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProductsPage.css";
import ProfileSection from "../components/ProfileSection";

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState({});

  // API stats from response
  const [apiStats, setApiStats] = useState({
    products_quantity: 0,
    available_products: 0,
    few_products: 0,
    ended_products: 0,
  });

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/products/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data.products || []);
        setApiStats({
          products_quantity: data.products_quantity || 0,
          available_products: data.available_products || 0,
          few_products: data.few_products || 0,
          ended_products: data.ended_products || 0,
        });
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, apiBaseUrl]);

  useEffect(() => {
    // Load user from localStorage
    const market = JSON.parse(localStorage.getItem("market"));
    if (market) {
      setUser({
        name: market.market_name,
        phone: market.phone_number,
        plan: market.plan,
        profileImage: market.profile_picture,
      });
    }
  }, [navigate, apiBaseUrl]);

  const handleAddProduct = () => {
    console.log("Add product clicked");
    // Add navigation or modal logic here if needed
  };

  const getStatusInfo = (quantity) => {
    if (quantity <= 0) return { text: "Mavjud emas", class: "red" };
    if (quantity <= 50) return { text: "Kam qolgan", class: "yellow" };
    return { text: "Bor", class: "green" };
  };

  const getCategoryName = (categoryId) => {
    // You can expand this mapping based on your actual categories
    const categories = {
      1: "Yegulik",
      2: "Ichimlik",
      3: "Sut mahsulotlari",
      4: "Go'sht mahsulotlari",
    };
    return categories[categoryId] || "Boshqa";
  };

  // Calculate percentages for progress bar
  const totalProducts = apiStats.products_quantity;
  const availablePercent = totalProducts
    ? (apiStats.available_products / totalProducts) * 100
    : 0;
  const fewPercent = totalProducts
    ? (apiStats.few_products / totalProducts) * 100
    : 0;
  const endedPercent = totalProducts
    ? (apiStats.ended_products / totalProducts) * 100
    : 0;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  return (
    <div className="products-page">
      <div className="content-wrapper no-right-column">
        <div className="main-content">
          <div className="header-section">
            <h1>Mahsulotlar</h1>
            <ProfileSection user={user} />
          </div>

          <div className="stats-bar">
            <div className="stats-header">
              <span className="total-count">{totalProducts}</span>
              <span className="stats-label">mahsulot</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-segment green"
                style={{ width: `${availablePercent}%` }}
              />
              <div
                className="progress-segment yellow"
                style={{ width: `${fewPercent}%` }}
              />
              <div
                className="progress-segment red"
                style={{ width: `${endedPercent}%` }}
              />
            </div>
            <div className="stats-legend">
              <div className="legend-item">
                <span className="legend-dot green"></span>
                <span>Bor: {apiStats.available_products}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot yellow"></span>
                <span>Kam qolgan: {apiStats.few_products}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot red"></span>
                <span>Mavjud emas: {apiStats.ended_products}</span>
              </div>
            </div>
          </div>

          <div className="controls-section">
            <div className="search-container">
              <span className="search-icon" />
              <input
                type="text"
                placeholder="Coca Cola..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="action-buttons">
              <button className="filter-btn">
                <span className="filter-icon" />
              </button>
              <button className="download-btn">
                <span className="download-icon" />
              </button>
              <button className="add-product-btn" onClick={handleAddProduct}>
                + Mahsulot qo'shish
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" className="select-all" />
                  </th>
                  <th>Mahsulot nomi</th>
                  <th>Kategoriya</th>
                  <th>Qoldiq</th>
                  <th>
                    Status <span className="sort-icon">⌄</span>
                  </th>
                  <th>Narx</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const statusInfo = getStatusInfo(product.quantity);
                  return (
                    <tr key={product.id}>
                      <td>
                        <input type="checkbox" />
                      </td>
                      <td className="product-name">{product.name}</td>
                      <td className="category">
                        {getCategoryName(product.category_id)}
                      </td>
                      <td className="quantity">{product.quantity}</td>
                      <td>
                        <span className={`status ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="price">
                        {parseFloat(
                          product.price_per_quantity
                        ).toLocaleString()}{" "}
                        UZS
                      </td>
                      <td>
                        <button className="options-btn">⋯</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
