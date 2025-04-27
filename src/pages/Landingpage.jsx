import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import logo from "../assets/landing-page/logo-image.svg";
import heroImage from "../assets/landing-page/hero-image.svg";

const LandingPage = () => {
  // State for hamburger menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State for sticky navbar
  const [isSticky, setIsSticky] = useState(false);
  // State for billing toggle
  const [isYearly, setIsYearly] = useState(false);

  // Toggle hamburger menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle smooth scrolling and close menu
  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false); // Close hamburger menu
  };

  // Toggle billing cycle
  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  // Handle sticky navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    // Cleanup listener on component unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {/* Navbar */}
      <header className={`navbar ${isSticky ? "sticky" : ""}`} id="navbar">
        <div className="logo">
          <img src={logo} alt="LOGO" className="logo-img" />
        </div>
        <div
          className={`hamburger ${isMenuOpen ? "open" : ""}`}
          id="hamburger"
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <nav
          className={`nav-links ${isMenuOpen ? "active" : ""}`}
          id="navLinks"
        >
          <a href="#home" onClick={(e) => handleNavClick(e, "#home")}>
            Home
          </a>
          <a href="#features" onClick={(e) => handleNavClick(e, "#features")}>
            Features
          </a>
          <a href="#pricing" onClick={(e) => handleNavClick(e, "#pricing")}>
            Prices
          </a>
          <a href="#contact" onClick={(e) => handleNavClick(e, "#contact")}>
            Contact
          </a>
        </nav>
        <div className="auth-buttons">
          <Link to="/signin">
            <button className="sign-in">Sign In</button>
          </Link>
          <Link to="/register">
            <button className="get-started">Get Started</button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <h1>
            The Ultimate <span className="highlight">Dashboard</span> <br />
            for Markets and Stores
          </h1>
          <p>
            Boost your productivity and streamline your workflow with SStore.
            Calculate your income faster with ease.
          </p>
          <div className="hero-buttons">
            <Link to="/register">
              <button className="btn-primary">Get Started</button>
            </Link>
            <button className="btn-secondary">How it Works</button>
          </div>
        </div>
        <div className="hero-container">
          <img src={heroImage} alt="Hero Image" className="hero-image" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <h2>All-in-One Dashboard to Organize, Track, and Achieve More</h2>
          <p className="description">
            Organized brings clarity and efficiency to your workflow, combining
            key tools to help you track progress, stay productive, and focus on
            what matters most.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Integrated Tools</h3>
              <p>
                Connect with apps like Zoom, Notion to streamline workflows and
                reduce the need to switch between platforms.
              </p>
            </div>
            <div className="feature-card">
              <h3>Task and Project Tracking</h3>
              <p>
                Monitor progress with visual updates on tasks and projects,
                helping you stay on schedule and motivated.
              </p>
            </div>
            <div className="feature-card">
              <h3>Productivity Insights</h3>
              <p>
                Analyze time spent on meetings, tasks, and other activities to
                refine your schedule and work smarter.
              </p>
            </div>
            <div className="feature-card">
              <h3>Meeting Management</h3>
              <p>
                Keep track of upcoming meetings, including times, topics, and
                links to platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" id="pricing">
        <h2>Choose Your Plan</h2>
        <div className="billing-toggle">
          <span>Monthly</span>
          <label className="switch">
            <input
              type="checkbox"
              id="billingSwitch"
              checked={isYearly}
              onChange={toggleBilling}
            />
            <span className="slider round"></span>
          </label>
          <span>Yearly -20%</span>
        </div>
        <div className="plans">
          <div className="plan-card free">
            <h3>Basic Plan</h3>
            <p className="price">
              ${isYearly ? 40 : 50} <span>/month</span>
            </p>
            <Link to="/register">
              <button className="btn-primary small">Get Started</button>
            </Link>
            <ul>
              <li>Access basic task and project tracking</li>
              <li>Overview of tasks progress and completion</li>
              <li>1 connected app integration</li>
              <li>Upcoming meetings tracking (max 2)</li>
            </ul>
          </div>
          <div className="plan-card personal">
            <h3>Pro Plan</h3>
            <p className="price">
              ${isYearly ? 80 : 100} <span>/month</span>
            </p>
            <Link to="/register">
              <button className="btn-primary small">Get Started</button>
            </Link>
            <ul>
              <li>Full task and project tracking with priority management</li>
              <li>Productivity analytics, including time tracking</li>
              <li>Unlimited connected apps</li>
              <li>Meeting management with calendar sync</li>
            </ul>
          </div>
          <div className="plan-card team">
            <h3>VIP Plan</h3>
            <p className="price">
              ${isYearly ? 120 : 150} <span>/month</span>
            </p>
            <Link to="/register">
              <button className="btn-primary small">Get Started</button>
            </Link>
            <ul>
              <li>Everything in Personal Plan, plus team management</li>
              <li>Collaborative dashboards for real-time updates</li>
              <li>Meeting scheduling and tracking for multiple members</li>
              <li>Priority customer support and onboarding</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="simple-footer" id="contact">
        SStore © All rights reserved 2025
      </div>
    </div>
  );
};

export default LandingPage;
