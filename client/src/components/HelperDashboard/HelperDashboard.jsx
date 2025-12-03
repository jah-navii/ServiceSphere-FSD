import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
// CORRECTED: Path changed from '../components/HelperDashboard/Sidebar' to '../Sidebar'
// to reach 'client/src/components/Sidebar.jsx' from 'client/src/components/HelperDashboard/'
import Sidebar from "./Sidebar";
// CORRECTED: Path changed from '../components/HelperDashboard/helperDashboard.css'
// to './helperDashboard.css' as the file is in the same directory.
import "./helperDashboard.css";

// Placeholder for fetching user data
// In a real app, this data would come from an API call
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
    <div className="dashboard-container">
      {/* Sidebar component passes mockUserData as a prop */}
      <Sidebar userData={userData} />

      <main className="main-content">
        <header>
          <h1>{title}</h1>
          {/* Notifications can be added here */}
        </header>

        <div className="content">
          {/* The Outlet renders the matched child route element (e.g., ProfilePage, EarningsPage) */}
          <Outlet context={{ userData, setUserData }} />
        </div>
      </main>
    </div>
  );
}

export default HelperDashboard;
