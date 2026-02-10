import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminSidebar.module.css";
import profilePic from "../../assets/profile-picture.png"; // Ensure this exists

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: "" },
    { to: "/admin/users", label: "User Management", icon: "" },
    { to: "/admin/services", label: "Service Overview", icon: "" },
    { to: "/admin/earnings", label: "Earnings Overview", icon: "" },
    { to: "/admin/locations", label: "Locations Overview", icon: ""}
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <img src={profilePic} alt="Admin" className={styles.profileImg} />
        <h3>Admin</h3>
        <p>Administrator</p>
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
                <span style={{marginRight: '10px'}}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <p>&copy; 2025 ServiceSphere</p>
      </div>
    </aside>
  );
};

export default AdminSidebar;