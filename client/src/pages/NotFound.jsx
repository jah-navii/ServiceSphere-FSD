import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.message}>
          Oops! The page you're looking for doesn't exist.
        </p>
        <div className={styles.actions}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            Go Back
          </button>
          <Link to="/" className={styles.homeButton}>
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
