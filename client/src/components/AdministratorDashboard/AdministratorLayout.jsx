import React from "react";
import { Outlet } from "react-router-dom";
import AdministratorSidebar from "./AdministratorSidebar";
import styles from "./AdministratorLayout.module.css";

const AdministratorLayout = () => {
  return (
    <div className={styles.layout}>
      <AdministratorSidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdministratorLayout;
