import React, { useEffect, useState, useRef } from "react";
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
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [headerDropdownPosition, setHeaderDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const menuRef = useRef(null);
  const headerMenuRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      if (headerMenuRef.current && headerMenuRef.current.contains(event.target))
        return;
      setMenuOpenId(null);
      setHeaderMenuOpen(false);
    }
    if (menuOpenId !== null || headerMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [menuOpenId, headerMenuOpen]);

  const handleAddProduct = () => {
    console.log("Add product clicked");
    // Add navigation or modal logic here if needed
  };

  const getStatusInfo = (quantity) => {
    if (quantity <= 0) return { text: "Mavjud emas", class: "red" };
    if (quantity <= 50) return { text: "Kam qolgan", class: "yellow" };
    return { text: "Bor", class: "green" };
  };

  // Calculate mutually exclusive product status counts for progress bar and legend
  const availableCount = products.filter((p) => p.quantity > 50).length;
  const fewCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= 50
  ).length;
  const endedCount = products.filter((p) => p.quantity <= 0).length;
  const totalProducts = availableCount + fewCount + endedCount;
  const availablePercent = totalProducts
    ? (availableCount / totalProducts) * 100
    : 0;
  const fewPercent = totalProducts ? (fewCount / totalProducts) * 100 : 0;
  const endedPercent = totalProducts ? (endedCount / totalProducts) * 100 : 0;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionsClick = (event, productId) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    let top = rect.bottom + window.scrollY;
    let left = rect.right + window.scrollX - 140;
    const dropdownHeight = 90;
    if (window.innerHeight - rect.bottom < dropdownHeight) {
      top = rect.top + window.scrollY - dropdownHeight;
    }
    setDropdownPosition({ top, left });
    setMenuOpenId((prev) => (prev === productId ? null : productId));
  };

  const handleHeaderOptionsClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    let top = rect.bottom + window.scrollY;
    let left = rect.right + window.scrollX - 140;
    const dropdownHeight = 90;
    if (window.innerHeight - rect.bottom < dropdownHeight) {
      top = rect.top + window.scrollY - dropdownHeight;
    }
    setHeaderDropdownPosition({ top, left });
    setHeaderMenuOpen((prev) => !prev);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

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
                <span>Bor: {availableCount}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot yellow"></span>
                <span>Kam qolgan: {fewCount}</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot red"></span>
                <span>Mavjud emas: {endedCount}</span>
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
                    <input
                      type="checkbox"
                      className="custom-checkbox select-all"
                      checked={
                        filteredProducts.length > 0 &&
                        selectedIds.length === filteredProducts.length
                      }
                      onChange={handleSelectAll}
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < filteredProducts.length
                          ? "true"
                          : undefined
                      }
                    />
                  </th>
                  <th>Mahsulot nomi</th>
                  <th>Kategoriya</th>
                  <th>Qoldiq</th>
                  <th>
                    Status <span className="sort-icon"></span>
                  </th>
                  <th>Narx</th>
                  <th>
                    <button
                      className={`options-btn${headerMenuOpen ? " open" : ""}`}
                      onClick={handleHeaderOptionsClick}
                      aria-label="Table Options"
                      style={{
                        background: headerMenuOpen
                          ? "var(--color-hover, #f2f2f2)"
                          : "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 6,
                        transition: "background 0.2s",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 22,
                          lineHeight: 1,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        ⋯
                      </span>
                    </button>
                    {headerMenuOpen && (
                      <div
                        className="profile-dropdown product-dropdown"
                        ref={headerMenuRef}
                        style={{
                          position: "fixed",
                          top: headerDropdownPosition.top,
                          left: headerDropdownPosition.left,
                          minWidth: 140,
                        }}
                      >
                        <button
                          onClick={() => {
                            // handle bulk edit logic
                            setHeaderMenuOpen(false);
                          }}
                        >
                          Bulk Edit
                        </button>
                        <button
                          onClick={() => {
                            // handle bulk delete logic
                            setHeaderMenuOpen(false);
                          }}
                        >
                          Bulk Delete
                        </button>
                      </div>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const statusInfo = getStatusInfo(product.quantity);
                  return (
                    <tr key={product.id}>
                      <td>
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => handleSelectRow(product.id)}
                        />
                      </td>
                      <td className="product-name">{product.name}</td>
                      <td className="category">
                        {product.category_name || "Boshqa"}
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
                      <td style={{ position: "relative" }}>
                        <button
                          className={`options-btn${
                            menuOpenId === product.id ? " open" : ""
                          }`}
                          onClick={(e) => handleOptionsClick(e, product.id)}
                          aria-label="Options"
                          style={{
                            background:
                              menuOpenId === product.id
                                ? "var(--color-hover, #f2f2f2)"
                                : "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            borderRadius: 6,
                            transition: "background 0.2s",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 22,
                              lineHeight: 1,
                              color: "var(--color-text-primary)",
                            }}
                          >
                            ⋯
                          </span>
                        </button>
                        {menuOpenId === product.id && (
                          <div
                            className="profile-dropdown product-dropdown"
                            ref={menuRef}
                            style={{
                              position: "fixed",
                              top: dropdownPosition.top,
                              left: dropdownPosition.left,
                              minWidth: 140,
                            }}
                          >
                            <button
                              onClick={() => {
                                /* handle edit logic */ setMenuOpenId(null);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                /* handle delete logic */ setMenuOpenId(null);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
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
