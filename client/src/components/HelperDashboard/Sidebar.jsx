import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/userSlice";
import profilePicture from "../../assets/profile-picture.png";

// Note: You'll need to install react-router-dom: npm install react-router-dom
// Assumes Font Awesome is available via the CSS file.

function Sidebar({ userData }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const name = userData?.name || "Guest";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login/helper");
  };

  const navItems = [
    { to: "/helper/profile", icon: "fas fa-user", label: "Profile" },
    { to: "/helper/requests", icon: "fas fa-list", label: "Service Requests" },
    { to: "/helper/schedule", icon: "fas fa-calendar", label: "Schedule" },
    { to: "/helper/earnings", icon: "fas fa-wallet", label: "Earnings" },
    { to: "/helper/feedback", icon: "fas fa-comments", label: "Feedback" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        {/* Placeholder image, replace with actual logic for profile picture */}
        <img src={profilePicture} alt="Profile Picture" />
        <h3>{name}</h3>
        <p>Helper</p>
      </div>

      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                // Optional: Add an 'active' class based on the current path
                className={location.pathname === item.to ? "active" : ""}
              >
                <i className={item.icon}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="logout-btn"
          style={{
            width: "100%",
            padding: "10px 15px",
            marginBottom: "15px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#c0392b")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#e74c3c")}
        >
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
        <p>&copy; 2025 ServiceSphere</p>
        <p>
          {/* These will be regular anchor tags as they navigate outside the SPA */}
          <a href="/about">About Us</a> |<a href="/contact">Contact</a> |
          <a href="/terms">Terms & Conditions</a>
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
