import { useState } from "react";
import "../styles/RegistrationPage.css";

const RegistrationPage = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="registration-container">
      <div className="form-card">
        <div className="tabs">
          <span
            className={`tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            LOGIN
          </span>
          <div className="divider"></div>
          <span
            className={`tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            REGISTER
          </span>
        </div>

        {activeTab === "login" ? (
          <form className="form">
            <input type="tel" placeholder="Phone number" />
            <input type="password" placeholder="Password" />
            <button type="submit">LOGIN</button>
          </form>
        ) : (
          <form className="form">
            <input type="text" placeholder="Full Name" />
            <input type="tel" placeholder="Phone number" />
            <input type="password" placeholder="Password" />
            <input type="password" placeholder="Re-enter Password" />
            <button type="submit">REGISTER</button>
          </form>
        )}

        {activeTab === "login" && (
          <div className="forgot-password">Forgot password?</div>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;
