import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  return (
    <div className={styles.container}>
      <AdminSidebar />
      <main className={styles.mainContent}>
        <Outlet /> {/* Renders the child pages */}
      </main>
    </div>
  );
};

export default AdminLayout;