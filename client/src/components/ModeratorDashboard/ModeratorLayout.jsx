import React from 'react';
import { Outlet } from 'react-router-dom';
import ModeratorSidebar from './ModeratorSidebar';
import styles from './ModeratorLayout.module.css';

const ModeratorLayout = () => {
  return (
    <div className={styles.layoutContainer}>
      <ModeratorSidebar />
      <div className={styles.mainContent}>
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ModeratorLayout;
