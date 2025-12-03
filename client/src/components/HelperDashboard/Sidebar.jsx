import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/userSlice"; 
import profilePicture from "../../assets/profile-picture.png";
// Import the module styles
import styles from "./Sidebar.module.css";

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
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <img src={profilePicture} alt="Profile" className={styles.profileImg} />
        <h3>{name}</h3>
        <p>Helper</p>
      </div>

      <nav className={styles.nav}>
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`${styles.navLink} ${
                  location.pathname === item.to ? styles.active : ""
                }`}
              >
                {/* Ensure you have FontAwesome loaded in index.html for these classes to work */}
                <i className={item.icon}></i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
        <p className={styles.footerText}>&copy; 2025 ServiceSphere</p>
        <div className={styles.footerLinks}>
          <Link to="/about">About</Link> | <Link to="/contact">Contact</Link> | <Link to="/terms">Terms</Link>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;