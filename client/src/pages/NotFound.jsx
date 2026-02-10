import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';
import logo from '../assets/logo.png';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img src={logo} alt="ServiceSphere Logo" className={styles.logo} />
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.message}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={styles.actions}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <span className={styles.icon}>←</span> Go Back
          </button>
          <Link to="/" className={styles.homeButton}>
            <span className={styles.icon}>🏠</span> Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
