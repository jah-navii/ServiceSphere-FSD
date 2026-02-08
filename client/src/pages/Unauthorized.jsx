import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Unauthorized.module.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>403</h1>
        <h2 className={styles.title}>Access Denied</h2>
        <p className={styles.message}>
          You don't have permission to access this page. Please login with the appropriate account.
        </p>
        <div className={styles.actions}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            Go Back
          </button>
          <Link to="/login" className={styles.loginButton}>
            Login
          </Link>
          <Link to="/" className={styles.homeButton}>
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
