import React from "react";
import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css"; 
// Note: Fix your image path depending on where you put this file.
// If you are in src/pages/LandingPage/, go up two levels to get to assets.
import logo from "../../assets/logo.png"; 

const LandingPage = () => {
  return (
    // Replaced "landing-body" with styles.landingContainer
    <div className={styles.landingContainer}>
      
      <div className={styles.logo}>
        <img src={logo} alt="ServiceSphere Logo" />
      </div>
      
      <div className={styles.tag}>Your Orbit to Assistance</div>
      
      <div className={styles.buttons}>
        <Link to="/login">
          {/* applied two classes: generic .btn and specific .loginBtn */}
          <button className={`${styles.btn} ${styles.loginBtn}`}>
            Login
          </button>
        </Link>
        
        <Link to="/signup">
          <button className={`${styles.btn} ${styles.signupBtn}`}>
            Sign Up
          </button>
        </Link>
      </div>
      
    </div>
  );
};

export default LandingPage;