import "../styles/RegistrationPage.css";

const RegistrationPage = () => {
  return (
    <div className="registration-container">
      <div className="form-card">
        <div className="tabs">
          <span className="tab active">LOGIN</span>
          <div className="divider"></div>
          <span className="tab">REGISTER</span>
        </div>
        <form className="form">
          <input type="tel" placeholder="Phone number" />
          <input type="password" placeholder="Password" />
          <button type="submit">LOGIN</button>
        </form>
        <div className="forgot-password">Forgot password?</div>
      </div>
    </div>
  );
};

export default RegistrationPage;
