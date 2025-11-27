import React from "react";
import { Link } from "react-router-dom";
import styles from "./SelectionPage.module.css";

const SelectionPage = ({ title, helperPath, seekerPath }) => {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>{title}</h1>
      
      <div className={styles.buttonGroup}>
        {/* Helper Button */}
        <Link to={helperPath} style={{ textDecoration: 'none' }}>
          <button className={`${styles.btn} ${styles.helperBtn}`}>
            Helper
          </button>
        </Link>

        {/* Seeker Button */}
        <Link to={seekerPath} style={{ textDecoration: 'none' }}>
          <button className={`${styles.btn} ${styles.seekerBtn}`}>
            Seeker
          </button>
        </Link>
      </div>
    </div>
  );
};

export default SelectionPage;