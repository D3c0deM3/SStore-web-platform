import React, { useState, useEffect } from "react";
import "../styles/QarzlarPage.css";
import ProfileSection from "../components/ProfileSection";

const QarzlarPage = () => {
  const [debts, setDebts] = useState([]);
  const [payInput, setPayInput] = useState({});
  const [user, setUser] = useState({});

  useEffect(() => {
    // Load user from localStorage (set by DashboardLayout)
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

  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchDebts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${apiBaseUrl}/api/debts/`, {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        setDebts(data);
      } catch (err) {
        setDebts([]);
      }
    };
    fetchDebts();
  }, [apiBaseUrl]);

  const handlePay = (id, amount) => {
    setDebts((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              paid: Math.min((d.paid || 0) + amount, d.total),
            }
          : d
      )
    );
    setPayInput((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="qarzlar-page">
      <div className="qarzlar-header-row">
        <div className="qarzlar-search-container">
          <span className="search-icon" />
          <input
            type="text"
            className="qarzlar-searchbar"
            placeholder="Qarzdor nomi bo'yicha qidirish..."
            // Add value and onChange logic if you want to implement search functionality
          />
        </div>
        <ProfileSection user={user} />
      </div>
      <h2 className="qarzlar-title">Qarzlar Ro'yxati</h2>
      <div className="qarzlar-profile-cards-container qarzlar-profile-cards-centered">
        {/* Qarz profile cards will go here in the future */}
        <img
          className="qarzlar-profile-cards-empty-bg"
          src={require("../assets/dashboard/no-account.svg").default}
          alt=""
        />
        <div className="qarzlar-profile-cards-empty-text"></div>
      </div>
      <div className="qarzlar-list">
        {debts.map((debt) => (
          <div className="qarz-card" key={debt.id}>
            <div className="qarz-header">
              <div className="qarz-person">{debt.person}</div>
              <div className="qarz-date">{debt.date}</div>
            </div>
            <div className="qarz-products">
              {debt.products.map((p, idx) => (
                <div className="qarz-product" key={idx}>
                  <span className="qarz-product-name">{p.name}</span>
                  <span className="qarz-product-qty">x{p.quantity}</span>
                  <span className="qarz-product-price">
                    {(p.price * p.quantity).toLocaleString()} UZS
                  </span>
                </div>
              ))}
            </div>
            <div className="qarz-summary">
              <span className="qarz-total">
                Jami: {debt.total.toLocaleString()} UZS
              </span>
              <span className="qarz-paid">
                To'langan: {(debt.paid || 0).toLocaleString()} UZS
              </span>
              <span className="qarz-remaining">
                Qolgan: {(debt.total - (debt.paid || 0)).toLocaleString()} UZS
              </span>
            </div>
            <div className="qarz-actions">
              <input
                type="number"
                min="1"
                max={debt.total - (debt.paid || 0)}
                placeholder="To'lov summasi"
                value={payInput[debt.id] || ""}
                onChange={(e) =>
                  setPayInput((prev) => ({
                    ...prev,
                    [debt.id]: e.target.value,
                  }))
                }
                className="qarz-pay-input"
                disabled={(debt.paid || 0) >= debt.total}
              />
              <button
                className="qarz-pay-btn"
                disabled={
                  (debt.paid || 0) >= debt.total ||
                  !payInput[debt.id] ||
                  Number(payInput[debt.id]) <= 0 ||
                  Number(payInput[debt.id]) > debt.total - (debt.paid || 0)
                }
                onClick={() => handlePay(debt.id, Number(payInput[debt.id]))}
              >
                {(debt.paid || 0) + (Number(payInput[debt.id]) || 0) >=
                debt.total
                  ? "To'liq to'landi"
                  : "To'lash"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QarzlarPage;
