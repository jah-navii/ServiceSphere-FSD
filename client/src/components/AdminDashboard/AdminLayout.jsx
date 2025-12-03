import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  return (
    <div className={styles.container}>
      <AdminSidebar />
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Admin Panel</h1>
        </div>
        <Outlet /> {/* Renders the child pages */}
      </main>
    </div>
  );
};

export default AdminLayout;