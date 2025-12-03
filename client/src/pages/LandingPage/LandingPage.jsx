import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./LandingPage.module.css";
import logo from "../../assets/logo.png";

const LandingPage = () => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show main content after the logo split + join sequence
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 4000); // matches CSS animation timing

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.landingContainer}>
      {/* Animated background orbs */}
      <div className={styles.backgroundOrbs}>
        <div className={`${styles.orb} ${styles.orb1}`}></div>
        <div className={`${styles.orb} ${styles.orb2}`}></div>
        <div className={`${styles.orb} ${styles.orb3}`}></div>
      </div>

      {/* Floating particles */}
      <div className={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Logo with split S -> Service Sphere -> full logo rotation */}
      <div
        className={`${styles.logoContainer} ${
          showContent ? styles.logoSettled : ""
        }`}
      >
        <div className={styles.logo3DWrapper}>
          <div className={styles.logoGlow}></div>

          {/* Split “S” animation + brand text */}
          <div className={styles.splitLogo}>
            <span
              className={`${styles.splitS} ${styles.splitSLeft}`}
            >
              S
            </span>
            <span className={styles.brandText}>Service Sphere</span>
            <span
              className={`${styles.splitS} ${styles.splitSRight}`}
            >
              S
            </span>
          </div>

          {/* Final logo image that appears after split animation and then rotates */}
          <img
            src={logo}
            alt="ServiceSphere Logo"
            className={`${styles.logo3D} ${styles.logoFinal}`}
          />
        </div>
      </div>

      {/* Main content - appears after animation */}
      <div
        className={`${styles.mainContent} ${
          showContent ? styles.contentVisible : ""
        }`}
      >
        <div className={styles.tagContainer}>
          <h1 className={styles.tag}>Your Orbit to Assistance</h1>
          <p className={styles.subtitle}>
            Experience seamless service management in a whole new dimension
          </p>
        </div>

        <div className={styles.buttons}>
          <Link to="/login" className={styles.btnLink}>
            <button className={`${styles.btn} ${styles.loginBtn}`}>
              <span className={styles.btnText}>Login</span>
              <span className={styles.btnShine}></span>
            </button>
          </Link>

          <Link to="/signup" className={styles.btnLink}>
            <button className={`${styles.btn} ${styles.signupBtn}`}>
              <span className={styles.btnText}>Sign Up</span>
              <span className={styles.btnShine}></span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
