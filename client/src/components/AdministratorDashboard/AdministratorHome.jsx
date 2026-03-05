import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from "./AdministratorHome.module.css";

const AdministratorHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/administrator/dashboard");
      setDashboardData(data.data);
    } catch (err) {
      setError(err.message);
      console.error("Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  const { overview, helpers, bookings, revenue } = dashboardData || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Administrator Dashboard</h1>
        <p className={styles.subtitle}>Complete platform overview and monitoring</p>
      </div>

      {/* Overview Cards */}
      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.primary}`}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className={styles.cardContent}>
            <h3>Total Users</h3>
            <p className={styles.cardValue}>{overview?.totalUsers || 0}</p>
            <p className={styles.cardDetail}>
              {overview?.totalHelpers || 0} Helpers · {overview?.totalSeekers || 0} Seekers
            </p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.success}`}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className={styles.cardContent}>
            <h3>Total Bookings</h3>
            <p className={styles.cardValue}>{overview?.totalBookings || 0}</p>
            <p className={styles.cardDetail}>
              {bookings?.completed || 0} Completed
            </p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.warning}`}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className={styles.cardContent}>
            <h3>Total Revenue</h3>
            <p className={styles.cardValue}>₹{revenue?.total?.toLocaleString() || 0}</p>
            <p className={styles.cardDetail}>From completed bookings</p>
          </div>
        </div>

        <div className={`${styles.card} ${styles.info}`}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>
          </div>
          <div className={styles.cardContent}>
            <h3>Services</h3>
            <p className={styles.cardValue}>{overview?.totalServices || 0}</p>
            <p className={styles.cardDetail}>
              {overview?.totalCategories || 0} Categories
            </p>
          </div>
        </div>
      </div>

      {/* Helpers Status */}
      <div className={styles.section}>
        <h2>Helper Management</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Helpers</div>
            <div className={styles.statValue}>{helpers?.total || 0}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Approved</div>
            <div className={`${styles.statValue} ${styles.green}`}>
              {helpers?.approved || 0}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Pending Approval</div>
            <div className={`${styles.statValue} ${styles.orange}`}>
              {helpers?.pending || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Status */}
      <div className={styles.section}>
        <h2>Bookings Overview</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Bookings</div>
            <div className={styles.statValue}>{bookings?.total || 0}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Completed</div>
            <div className={`${styles.statValue} ${styles.green}`}>
              {bookings?.completed || 0}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Pending</div>
            <div className={`${styles.statValue} ${styles.blue}`}>
              {bookings?.pending || 0}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Cancelled</div>
            <div className={`${styles.statValue} ${styles.red}`}>
              {bookings?.cancelled || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className={styles.section}>
        <h2>Recent Bookings</h2>
        <div className={styles.tableWrapper}>
          {bookings?.recent && bookings.recent.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Seeker</th>
                  <th>Helper</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.recent.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.seeker?.name || "N/A"}</td>
                    <td>{booking.helper?.name || "N/A"}</td>
                    <td>{booking.service_type}</td>
                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>₹{booking.amount?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noData}>No recent bookings</p>
          )}
        </div>
      </div>

      {/* System Stats */}
      <div className={styles.section}>
        <h2>Platform Statistics</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Admins</div>
            <div className={styles.statValue}>{overview?.totalAdmins || 0}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Locations</div>
            <div className={styles.statValue}>{overview?.totalLocations || 0}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Categories</div>
            <div className={styles.statValue}>{overview?.totalCategories || 0}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Services</div>
            <div className={styles.statValue}>{overview?.totalServices || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministratorHome;
