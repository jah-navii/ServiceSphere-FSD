import React, { createContext, useState, useContext, useCallback } from "react";
import styles from "./Toast.module.css";

// 1. Create the Context
const ToastContext = createContext();

// 2. Custom Hook for easy access
export const useToast = () => useContext(ToastContext);

// 3. The Provider Component
export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  // Function to show the toast
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Render the Toast UI globally here */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          <span className={styles.message}>{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
};