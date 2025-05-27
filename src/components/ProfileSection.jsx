import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/DashboardPage.css";

const ProfileSection = ({ user }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showProfileMenu &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  // Fix image URL logic (Cloudinary or direct)
  let profileImageUrl = null;
  if (user?.profileImage) {
    if (
      user.profileImage.startsWith("http") ||
      user.profileImage.startsWith("/")
    ) {
      profileImageUrl = user.profileImage;
    } else {
      profileImageUrl = `https://res.cloudinary.com/bnf404/${user.profileImage}`;
    }
  }

  // Dropdown actions
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const handleEditProfile = () => navigate("/profile/edit");
  const handleChangeLanguage = () => {};

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle(
      "light-theme",
      newTheme === "light"
    );
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="profile-section" ref={profileMenuRef}>
      <div
        className="profile-container"
        onClick={() => setShowProfileMenu((prev) => !prev)}
        style={{ cursor: "pointer" }}
      >
        {profileImageUrl ? (
          <div
            className="profile-pic"
            style={{ backgroundImage: `url(${profileImageUrl})` }}
          />
        ) : (
          <div className="profile-pic default" />
        )}
        <div>
          <span>{user?.name || "User Name"}</span>
          <span>{user?.phone || "+998 97 201 13 17"}</span>
        </div>
        <span className="profile_arrow_icon" />
      </div>
      {showProfileMenu && (
        <div className="profile-dropdown">
          <button onClick={handleEditProfile}>Edit Profile</button>
          <div className="theme-toggle">
            <span>Light Theme</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === "light"}
                onChange={toggleTheme}
              />
              <span className="slider"></span>
            </label>
          </div>
          <button onClick={handleChangeLanguage}>Change Language</button>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      )}
    </div>
  );
};

export default ProfileSection;
