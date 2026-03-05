import React, { useState, useEffect } from 'react';
import styles from './ModeratorHome.module.css';

const ModeratorHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/moderator/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const stats = dashboardData?.stats || {};
  const location = dashboardData?.location || {};

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard Overview</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <h3>Pending Helpers</h3>
            <p className={styles.statValue}>{stats.pendingHelpers || 0}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <h3>Active Helpers</h3>
            <p className={styles.statValue}>{stats.activeHelpers || 0}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <h3>Today's Bookings</h3>
            <p className={styles.statValue}>{stats.todayBookings || 0}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <h3>Active Services</h3>
            <p className={styles.statValue}>{stats.totalServices || 0}</p>
          </div>
        </div>
      </div>

      <div className={styles.locationInfo}>
        <h2>Location Information</h2>
        <div className={styles.locationCard}>
          <div className={styles.locationDetail}>
            <span className={styles.label}>City:</span>
            <span className={styles.value}>{location.city || 'N/A'}</span>
          </div>
          <div className={styles.locationDetail}>
            <span className={styles.label}>State:</span>
            <span className={styles.value}>{location.state || 'N/A'}</span>
          </div>
          <div className={styles.locationDetail}>
            <span className={styles.label}>Status:</span>
            <span className={`${styles.value} ${styles.statusBadge}`}>
              {location.status || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {stats.pendingHelpers > 0 && (
        <div className={styles.alert}>
          <strong>Action Required:</strong> You have {stats.pendingHelpers} helper application(s) waiting for review.
        </div>
      )}
    </div>
  );
};

export default ModeratorHome;
