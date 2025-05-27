import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = ({ user, getPlanIconClass }) => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="logo" />
      <span className="logo_underline"></span>
      <nav className="menu">
        <p className="sidebar-menu">Menu</p>
        <ul>
          <li
            className={location.pathname === "/dashboard" ? "active" : ""}
            onClick={() => navigate("/dashboard")}
          >
            <span className="icon home-icon" />
            Asosiy sahifa
          </li>
          <li
            className={location.pathname === "/hisobotlar" ? "active" : ""}
            onClick={() => navigate("/hisobotlar")}
          >
            <span className="icon history-icon" />
            Hisobotlar
          </li>
          <li
            className={location.pathname === "/mahsulotlar" ? "active" : ""}
            onClick={() => navigate("/mahsulotlar")}
          >
            <span className="icon products-icon" />
            Mahsulotlar
          </li>
          <li
            className={location.pathname === "/kalkulyator" ? "active" : ""}
            onClick={() => navigate("/kalkulyator")}
          >
            <span className="icon calculator-icon" />
            Kalkulyator
          </li>
          <li
            className={location.pathname === "/ai-maslahat" ? "active" : ""}
            onClick={() => navigate("/ai-maslahat")}
          >
            <span className="icon ai-icon" />
            AI maslahat
          </li>
        </ul>
      </nav>
      <div className="vip-plan">
        {user?.plan && (
          <span className={`plan-icon ${getPlanIconClass?.(user?.plan)}`} />
        )}
        {user?.plan} PLAN
      </div>
    </aside>
  );
};

export default Sidebar;
