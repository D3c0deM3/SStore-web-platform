import React, { useEffect, useState } from "react";
import ProfileSection from "../components/ProfileSection";
import "../styles/ProductsPage.css";
import deleteIcon from "../assets/dashboard/delete.svg";

const SellPage = () => {
  const [user, setUser] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Meals");
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Pizza",
      price: 50000,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 2,
      name: "Pizza",
      price: 50000,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "Pizza",
      price: 50000,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop&crop=center",
    },
    {
      id: 4,
      name: "Pizza",
      price: 50000,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop&crop=center",
    },
  ]);

  const products = [
    {
      id: 1,
      name: "Pizza",
      price: 50000,
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 2,
      name: "Burger",
      price: 27000,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 3,
      name: "Lavash",
      price: 25000,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 4,
      name: "Chicken Burger",
      price: 29000,
      image:
        "https://images.unsplash.com/photo-1606755962773-d324e9ebd3e9?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 5,
      name: "Pizza",
      price: 50000,
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 6,
      name: "Burger",
      price: 27000,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 7,
      name: "Lavash",
      price: 25000,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 8,
      name: "Chicken Burger",
      price: 29000,
      image:
        "https://images.unsplash.com/photo-1606755962773-d324e9ebd3e9?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 9,
      name: "Pizza",
      price: 50000,
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 10,
      name: "Burger",
      price: 27000,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 11,
      name: "Lavash",
      price: 25000,
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop&crop=center",
    },
    {
      id: 12,
      name: "Chicken Burger",
      price: 29000,
      image:
        "https://images.unsplash.com/photo-1606755962773-d324e9ebd3e9?w=200&h=200&fit=crop&crop=center",
    },
  ];

  const categories = ["Meals", "Drinks", "Chicken", "Drinks", "Meals"];

  useEffect(() => {
    const market = JSON.parse(localStorage.getItem("market"));
    if (market) {
      setUser({
        name: market.market_name,
        phone: market.phone_number,
        plan: market.plan,
        profileImage: market.profile_picture,
      });
    }
  }, []);

  // Example search handler (replace with real logic as needed)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    // Add filtering logic here if needed
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
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

  return (
    <div className="sell-page-container products-page">
      <div
        className="content-wrapper no-right-column"
        style={{ paddingTop: 12 }}
      >
        <div className="main-content">
          <div
            className="header-section"
            style={{ alignItems: "flex-start", marginBottom: 8 }}
          >
            <h1 style={{ marginBottom: 0, fontSize: 32 }}>Sotuv</h1>
            <ProfileSection user={user} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="search-container">
              <span className="search-icon" />
              <input
                type="text"
                placeholder="Qidiruv..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div style={{ display: "flex", flex: 1, gap: 24 }}>
            {/* Product selection area */}
            <div
              style={{
                flex: 2,
                background: "#232735",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 24,
                  background: "#393e4c",
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveCategory(category)}
                    style={{
                      flex: 1,
                      background:
                        activeCategory === category && index === 0
                          ? "#4c7273"
                          : "#393e4c",
                      color:
                        activeCategory === category && index === 0
                          ? "#fff"
                          : "#bfc9d1",
                      border: "none",
                      borderRadius: 8,
                      padding: 12,
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 12,
                        marginBottom: 12,
                      }}
                    />
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        color: "#232735",
                        marginBottom: 4,
                        textAlign: "center",
                      }}
                    >
                      {product.name}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#4c7273",
                      }}
                    >
                      {formatPrice(product.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Cart area */}
            <div
              style={{
                flex: 1,
                background: "#2e3342",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                minWidth: 320,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <h2
                  style={{
                    color: "#fff",
                    fontSize: 28,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Xarid
                </h2>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    fontSize: 28,
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", marginBottom: 24 }}>
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#232735",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 16,
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginRight: 12,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#fff",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#4c7273",
                        }}
                      >
                        {formatPrice(item.price)}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          decreaseQuantity(item.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#bfc9d1",
                          fontSize: 20,
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
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
                      <div
                        style={{
                          background: "#393e4c",
                          borderRadius: 6,
                          padding: "4px 8px",
                          minWidth: 28,
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            color: "#bfc9d1",
                            fontWeight: 700,
                            fontSize: 16,
                          }}
                        >
                          {item.quantity}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          increaseQuantity(item.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#bfc9d1",
                          fontSize: 20,
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
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
                        style={{
                          background: "none",
                          border: "none",
                          color: "#bfc9d1",
                          fontSize: 20,
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
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
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <span
                  style={{
                    color: "#bfc9d1",
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  Total :
                </span>
                <span
                  style={{
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <button
                style={{
                  background: "#4c7273",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 0",
                  fontWeight: 700,
                  fontSize: 20,
                  width: "100%",
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#5a8384")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#4c7273")
                }
              >
                Pay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage;
