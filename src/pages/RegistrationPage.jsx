import { useState } from "react";
import axios from "axios";
import "../styles/RegistrationPage.css";

const RegistrationPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validation
    if (!phoneNumber || !password || (activeTab === "register" && !fullName)) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    if (!phoneNumber.startsWith("+998") || phoneNumber.length !== 13) {
      setErrorMessage(
        "Phone number must start with +998 and be 13 characters long."
      );
      return;
    }

    if (activeTab === "register" && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

      let response;
      if (activeTab === "login") {
        response = await axios.post(`${apiBaseUrl}/api/login/`, {
          phone_number: phoneNumber,
          password: password,
        });
        console.log("Login Success:", response.data);
        window.location.href = "/dashboard";
      } else {
        response = await axios.post(`${apiBaseUrl}/api/signup/`, {
          phone_number: phoneNumber,
          market_name: fullName,
          password: password,
        });
        console.log("Register Success:", response.data);
        window.location.href = "/plan";
      }

      // ✅ Save token and market info to localStorage for both login and register
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("market", JSON.stringify(response.data.market));
      // ✅ Redirect to dashboard or home page
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      const serverMessage =
        error.response?.data?.message || error.response?.data?.error;
      setErrorMessage(serverMessage || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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

        <form className="form" onSubmit={handleSubmit}>
          {activeTab === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {activeTab === "register" && (
            <input
              type="password"
              placeholder="Re-enter Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : activeTab === "login"
              ? "LOGIN"
              : "REGISTER"}
          </button>
        </form>

        {errorMessage && <div className="error-message">{errorMessage}</div>}

        {activeTab === "login" && (
          <div className="forgot-password">Forgot password?</div>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;
