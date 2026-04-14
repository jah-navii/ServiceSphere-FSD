import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './Unauthorized.module.css';
import logo from '../assets/logo.png';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine appropriate login page based on the path
  const getLoginPath = () => {
    const path = location.pathname;
    if (path.includes('/helper')) return '/login/helper';
    if (path.includes('/administrator')) return '/login/administrator';
    if (path.includes('/seeker') || path.includes('/home') || path.includes('/cart') || path.includes('/booking')) {
      return '/login/seeker';
    }
    return '/login'; // Default to main login page
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img src={logo} alt="ServiceSphere Logo" className={styles.logo} />
        <h1 className={styles.errorCode}>403</h1>
        <h2 className={styles.title}>Access Denied</h2>
        <p className={styles.message}>
          You don't have permission to access this page. Please login with the appropriate account.
        </p>
        <div className={styles.actions}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <span className={styles.icon}>←</span> Go Back
          </button>
          <Link to={getLoginPath()} className={styles.loginButton}>
            <span className={styles.icon}>🔐</span> Login
          </Link>
          <Link to="/" className={styles.homeButton}>
            <span className={styles.icon}>🏠</span> Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
