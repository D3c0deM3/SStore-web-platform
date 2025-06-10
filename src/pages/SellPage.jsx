import React, { useEffect, useState } from "react";
import "../styles/ProductsPage.css";
import "../styles/SellPage.css";
import deleteIcon from "../assets/dashboard/delete.svg";

const SellPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Meals");
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  // Detect theme (light/dark) from html or body class
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load cart from localStorage on mount (before any other useEffect that might overwrite it)
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Fetch products/categories from API on mount
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const baseUrl =
          process.env.REACT_APP_API_BASE_URL || process.env.VITE_API_URL;
        const url = `${baseUrl}/api/categories/products/`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          const text = await response.text();
          console.error("API error:", response.status, text);
          return;
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log("/api/categories/products/ response:", data);
          // Extract categories and products
          const categoryNames = Object.keys(data);
          setCategories(categoryNames);
          // Flatten products for all categories, but keep category info
          let allProducts = [];
          categoryNames.forEach((cat) => {
            data[cat].forEach((item) => {
              allProducts.push({ ...item, category: cat });
            });
          });
          setProducts(allProducts);
          // Optionally set default activeCategory to first non-empty category
          const firstNonEmpty = categoryNames.find(
            (cat) => data[cat] && data[cat].length > 0
          );
          if (firstNonEmpty) setActiveCategory(firstNonEmpty);
        } else {
          const text = await response.text();
          console.warn("Non-JSON response:", text);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Example search handler (replace with real logic as needed)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Add filtering logic here if needed
  };

  const addToCart = (product) => {
    // Use price_per_quantity if available, fallback to price, and parse as number
    const price = Number(product.price_per_quantity || product.price);
    const cartProduct = {
      id: product.id,
      name: product.name,
      price, // always a number
      image: product.image
        ? `https://res.cloudinary.com/bnf404/${product.image}`
        : "",
      quantity: 1,
    };
    const existingItem = cartItems.find((item) => item.id === cartProduct.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === cartProduct.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, cartProduct]);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const formatPrice = (price) => {
    return price.toLocaleString("uz-UZ") + " UZS";
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  const decreaseQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const increaseQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Detect theme (light/dark) from html or body class
  useEffect(() => {
    const checkTheme = () => {
      const htmlClass = document.documentElement.className;
      setIsLightTheme(htmlClass.includes("light-theme"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Enhanced search: search across all categories, auto-switch to first matching category
  useEffect(() => {
    if (!searchTerm) return; // Don't auto-switch if search is empty
    // Find the first category with a matching product
    const lowerSearch = searchTerm.toLowerCase();
    const match = products.find(
      (product) =>
        product.name && product.name.toLowerCase().includes(lowerSearch)
    );
    if (match && match.category !== activeCategory) {
      setActiveCategory(match.category);
    }
  }, [searchTerm, products, activeCategory]);

  // Filter products by active category and search term
  const filteredProducts = products.filter(
    (product) =>
      product.category === activeCategory &&
      product.name &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePay = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setShowError(false);
    setErrorMessage("");
    const token = localStorage.getItem("token");
    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || process.env.VITE_API_URL;
    if (!baseUrl) {
      setErrorMessage(
        "API manzili topilmadi. Iltimos, administratorga murojaat qiling."
      );
      setShowError(true);
      setLoading(false);
      return;
    }
    const url = `${baseUrl}/api/sell/`;
    const sells = cartItems.map((item) => ({
      product_id: item.id,
      price: item.price,
      quantity: item.quantity,
    }));
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ sells }),
      });
      if (response.status === 200) {
        setShowSuccess(true);
        setCartItems([]);
        setTimeout(() => setShowSuccess(false), 1500);
      } else {
        setErrorMessage("Xatolik yuz berdi. Qayta urinib ko'ring.");
        setShowError(true);
      }
    } catch (e) {
      setErrorMessage("Tarmoq xatosi yoki server javob bermadi.");
      setShowError(true);
    }
    setLoading(false);
  };

  return (
    <div
      className="sell-page-container products-page"
      style={{ display: "flex", height: "100vh", overflow: "hidden" }}
    >
      {/* Sidebar would be here if present */}
      <div
        style={{
          flex: 2,
          minWidth: 0,
          height: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          scrollbarWidth: "none", // Hide Firefox scrollbar
          msOverflowStyle: "none", // Hide IE/Edge scrollbar
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          <div
            className="sell-page-header-section header-section"
            style={{
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <h1
              className="sell-page-title"
              style={{
                marginBottom: 0,
                fontSize: 32,
              }}
            >
              Sotuv
            </h1>
          </div>
          <div
            className="sell-page-search-container"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="search-container">
              <span className="search-icon" />
              <input
                type="text"
                placeholder="Qidiruv..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="sell-page-search-input"
              />
            </div>
          </div>
          <div className="sell-page-product-selection">
            <div className="sell-page-category-bar">
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`sell-page-category-btn${
                    activeCategory === category ? " active" : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div
              className="sell-page-products-grid"
              style={
                {
                  /* ...existing styles... */
                }
              }
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="sell-page-product-card product-card"
                >
                  <img
                    src={`https://res.cloudinary.com/bnf404/${product.image}`}
                    alt={product.name}
                    className="sell-page-product-img"
                  />
                  <div className="sell-page-product-name">{product.name}</div>
                  <div className="sell-page-product-price">
                    {formatPrice(
                      Number(product.price_per_quantity || product.price)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Cart area - fixed, not scrollable, like sidebar */}
      <div
        className="sell-page-cart-area"
        style={{
          flex: "0 0 360px",
          minWidth: 260,
          maxWidth: 360,
          height: "100vh",
          alignSelf: "stretch",
          position: "sticky",
          top: 0,
          display: "flex",
          flexDirection: "column",
          background: isLightTheme ? "var(--color-bg-secondary)" : "#2e3342",
          borderRadius: 0,
          padding: 24,
          boxSizing: "border-box",
          overflow: "hidden",
          marginLeft: 32,
          boxShadow: isLightTheme ? "0 4px 6px var(--color-shadow)" : "none",
        }}
      >
        <div className="sell-page-cart-header">
          <h2
            className="sell-page-cart-title"
            style={{
              color: isLightTheme ? "var(--color-text-primary)" : "#fff",
              transition: "color 0.2s",
            }}
          >
            Xarid
          </h2>
          {/* Removed close (X) button */}
        </div>
        <div
          className="sell-page-cart-list"
          style={{
            flex: 1,
            overflowY: "auto",
            minHeight: 0,
            display: cartItems.length === 0 ? "flex" : undefined,
            flexDirection: cartItems.length === 0 ? "column" : undefined,
            alignItems: cartItems.length === 0 ? "center" : undefined,
            justifyContent: cartItems.length === 0 ? "center" : undefined,
          }}
        >
          {cartItems.length === 0 ? (
            <div className="sell-page-cart-empty" style={{ width: "100%" }}>
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block", margin: "0 auto 12px auto" }}
              >
                <rect
                  x="8"
                  y="16"
                  width="40"
                  height="28"
                  rx="6"
                  fill="#e5e7eb"
                />
                <rect
                  x="16"
                  y="8"
                  width="24"
                  height="12"
                  rx="6"
                  fill="#cbd5e1"
                />
                <path
                  d="M20 36h16"
                  stroke="#bfc9d1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="44" r="3" fill="#bfc9d1" />
                <circle cx="36" cy="44" r="3" fill="#bfc9d1" />
              </svg>
              <div
                style={{
                  textAlign: "center",
                  color: "var(--color-text-secondary)",
                  fontSize: 16,
                  marginBottom: 8,
                }}
              >
                Savatcha hozircha bo'sh
              </div>
              <div
                style={{
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: 14,
                }}
              >
                Mahsulot qo'shish uchun ro'yxatdan tanlang
              </div>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="sell-page-cart-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="sell-page-cart-item-img"
                />
                <div
                  className="sell-page-cart-item-info"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    color: isLightTheme ? "var(--color-text-primary)" : "#fff",
                    transition: "color 0.2s",
                  }}
                >
                  <div
                    className="sell-page-cart-item-name"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minWidth: 0,
                      width: "100%",
                      display: "block",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {item.name}
                  </div>
                  <div className="sell-page-cart-item-price">
                    {formatPrice(item.price)}
                  </div>
                </div>
                <div className="sell-page-cart-item-controls">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      decreaseQuantity(item.id);
                    }}
                    className="sell-page-cart-qty-btn"
                    aria-label="Decrease quantity"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="4"
                        y="8.25"
                        width="10"
                        height="1.5"
                        rx="0.75"
                        fill="#bfc9d1"
                      />
                    </svg>
                  </button>
                  <div className="sell-page-cart-qty">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="sell-page-cart-qty-value"
                      value={item.quantity}
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val === "") val = 0;
                        const num = parseFloat(val);
                        if (!isNaN(num) && num >= 0) {
                          setCartItems((prevItems) =>
                            prevItems.map((it) =>
                              it.id === item.id ? { ...it, quantity: num } : it
                            )
                          );
                        }
                      }}
                      style={{
                        width: 40,
                        textAlign: "center",
                        background: "transparent",
                        border: "none",
                        color: "inherit",
                        fontWeight: 700,
                        fontSize: 16,
                        outline: "none",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      increaseQuantity(item.id);
                    }}
                    className="sell-page-cart-qty-btn"
                    aria-label="Increase quantity"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="8.25"
                        y="4"
                        width="1.5"
                        height="10"
                        rx="0.75"
                        fill="#bfc9d1"
                      />
                      <rect
                        x="4"
                        y="8.25"
                        width="10"
                        height="1.5"
                        rx="0.75"
                        fill="#bfc9d1"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(item.id);
                    }}
                    className="sell-page-cart-remove-btn"
                    aria-label="Remove item"
                  >
                    <img
                      src={deleteIcon}
                      alt="Remove"
                      style={{ width: 20, height: 20 }}
                    />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="sell-page-cart-total-row">
          <span
            className="sell-page-cart-total-label"
            style={{
              color: isLightTheme ? "var(--color-text-primary)" : undefined,
            }}
          >
            Total :
          </span>
          <span
            className="sell-page-cart-total-value"
            style={{
              color: isLightTheme ? "var(--color-text-primary)" : undefined,
              fontWeight: 700,
            }}
          >
            {formatPrice(getTotalPrice())}
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="sell-page-cart-pay-btn"
            onClick={handlePay}
            disabled={loading || cartItems.length === 0}
            style={{
              flex: 1,
              opacity: loading ? 0.7 : 1,
              position: "relative",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#5a8384")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#4c7273")}
          >
            {loading ? (
              <span
                className="pay-btn-spinner"
                style={{ display: "inline-block", verticalAlign: "middle" }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#fff"
                    strokeWidth="4"
                    opacity="0.2"
                  />
                  <path
                    d="M22 12a10 10 0 0 1-10 10"
                    stroke="#fff"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            ) : (
              "Pay"
            )}
          </button>
          <button
            className="sell-page-cart-qarz-btn"
            style={{
              flex: 1,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "16px 0",
              fontWeight: 700,
              fontSize: 20,
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#1d4ed8")}
            onMouseLeave={(e) => (e.target.style.background = "#2563eb")}
          >
            Qarz
          </button>
        </div>
      </div>
      <style>{`
        .sell-page-container.products-page > div[style*='overflowY: auto']::-webkit-scrollbar {
          display: none;
        }
        .sell-success-notification {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          box-shadow: 0 8px 32px var(--color-shadow);
          padding: 40px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: pop-in 0.18s cubic-bezier(0.4,2,0.6,1) both;
        }
        .sell-success-tick {
          width: 72px;
          height: 72px;
          margin-bottom: 18px;
        }
        @keyframes pop-in {
          0% { transform: scale(0.7) translate(-50%, -50%); opacity: 0; }
          100% { transform: scale(1) translate(-50%, -50%); opacity: 1; }
        }
        .sell-page-cart-pay-btn[disabled] {
          cursor: not-allowed;
          background: #7a8e8e !important;
        }
        .pay-btn-spinner svg {
          animation: pay-spin 0.8s linear infinite;
        }
        @keyframes pay-spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .sell-error-notification {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          background: rgba(255,255,255,0.97);
          border-radius: 16px;
          box-shadow: 0 8px 32px var(--color-shadow);
          padding: 40px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: pop-in 0.18s cubic-bezier(0.4,2,0.6,1) both;
        }
        .sell-error-cross {
          width: 72px;
          height: 72px;
          margin-bottom: 18px;
          animation: shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate(-50%, -50%) translateX(-1px); }
          20%, 80% { transform: translate(-50%, -50%) translateX(2px); }
          30%, 50%, 70% { transform: translate(-50%, -50%) translateX(-4px); }
          40%, 60% { transform: translate(-50%, -50%) translateX(4px); }
        }
        .sell-error-close-btn:hover {
          background: #dc2626;
        }
      `}</style>
      {showSuccess && (
        <div className="sell-success-notification">
          <svg
            className="sell-success-tick"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="36"
              cy="36"
              r="34"
              fill="#e6f9ed"
              stroke="#4ade80"
              strokeWidth="4"
            />
            <path
              d="M22 38l10 10 18-22"
              stroke="#22c55e"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              color: "#22c55e",
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 2,
            }}
          >
            Sotuv muvaffaqiyatli!
          </div>
        </div>
      )}
      {showError && (
        <div className="sell-error-notification">
          <svg
            className="sell-error-cross"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="36"
              cy="36"
              r="34"
              fill="#fef2f2"
              stroke="#f87171"
              strokeWidth="4"
            />
            <path
              d="M26 26l20 20M46 26l-20 20"
              stroke="#ef4444"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              color: "#ef4444",
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 2,
            }}
          >
            Xatolik!
          </div>
          <div
            style={{
              color: "#ef4444",
              fontWeight: 500,
              fontSize: 16,
              textAlign: "center",
              maxWidth: 320,
            }}
          >
            {errorMessage}
          </div>
          <button
            className="sell-error-close-btn"
            onClick={() => setShowError(false)}
            style={{
              marginTop: 18,
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 24px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Yopish
          </button>
        </div>
      )}
    </div>
  );
};

export default SellPage;
