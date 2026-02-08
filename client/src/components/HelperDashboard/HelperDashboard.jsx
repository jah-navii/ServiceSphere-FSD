import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import styles from "./HelperDashboard.module.css";
// Optional: Import Toast to tell them why they were redirected
import { useToast } from "../../context/ToastContext"; 

function HelperDashboard() {
  const location = useLocation();
  const navigate = useNavigate(); // 2. Initialize hook
  const { showToast } = useToast(); 

  const { currentUser } = useSelector((state) => state.user);
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("Dashboard");

  // Set Title based on Route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("profile")) setTitle("Profile");
    else if (path.includes("requests")) setTitle("Service Requests");
    else if (path.includes("schedule")) setTitle("Schedule");
    else if (path.includes("earnings")) setTitle("Earnings");
    else if (path.includes("feedback")) setTitle("Feedback");
    else setTitle("Dashboard");
  }, [location.pathname]);

  useEffect(() => {
    // 3. SECURITY CHECK: If Redux state is empty, redirect immediately
    if (!currentUser) {
      // Optional: Show a message
      // showToast("Session expired. Please login again.", "error"); 
      navigate("/login/helper");
      return;
    }

    const fetchProfile = async () => {
      const userId = currentUser.id || currentUser._id;

      if (!userId) {
        // Double safety check if object exists but ID is missing
        navigate("/login/helper");
        return;
      }

      try {
        const url = `http://localhost:5000/profile/${userId}`;
        const res = await fetch(url, {
          credentials: "include"
        });
        const data = await res.json();
        
        if (res.ok) {
          setUserData(data);
        } else {
          console.error("API ERROR:", data.error);
        }
      } catch (err) {
        console.error("NETWORK ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser, navigate]); // Added navigate to dependencies

  // Prevent flashing of dashboard if redirecting
  if (!currentUser) return null; 

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Loading Dashboard...</div>;

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar userData={userData?.helper} />

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