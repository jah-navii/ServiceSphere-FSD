import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import styles from "./HelperDashboard.module.css"; 


// Placeholder for fetching user data
const mockUserData = {
  name: "Jane Doe",
  mobilenumber: "9876543210",
  // ... other data
};

function HelperDashboard() {
  const location = useLocation();
  const [title, setTitle] = useState("Dashboard");
  const [userData, setUserData] = useState(mockUserData);

  // Function to set the dynamic title based on the route
  useEffect(() => {
    switch (location.pathname) {
      case "/helper/profile":
        setTitle("Profile");
        break;
      case "/helper/requests":
        setTitle("Service Requests");
        break;
      case "/helper/schedule":
        setTitle("Schedule");
        break;
      case "/helper/earnings":
        setTitle("Earnings");
        break;
      case "/helper/feedback":
        setTitle("Feedback");
        break;
      default:
        setTitle("Dashboard");
    }
  }, [location.pathname]);

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar userData={userData} />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>{title}</h1>
        </header>

        <div className={styles.content}>
          <Outlet context={{ userData, setUserData }} />
        </div>
      </main>
    </div>
  );
}

export default HelperDashboard;
