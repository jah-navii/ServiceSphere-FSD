import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from "./AdministratorAnalytics.module.css";

const AdministratorAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("month");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/administrator/analytics");
      setAnalyticsData(data.data);
    } catch (err) {
      setError(err.message);
      console.error("Analytics Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading analytics...</div>
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

  const { userGrowth, bookingTrends, revenueAnalytics, topServices, topHelpers } = 
    analyticsData || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Platform Analytics</h1>
        <p className={styles.subtitle}>Data-driven insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>👥</span>
            <span className={styles.metricTitle}>User Growth</span>
          </div>
          <div className={styles.metricValue}>{userGrowth?.totalUsers || 0}</div>
          <div className={styles.metricChange}>
            <span className={styles.changeValue}>
              {userGrowth?.thisMonth > userGrowth?.lastMonth ? "+" : ""}
              {calculatePercentageChange(userGrowth?.thisMonth, userGrowth?.lastMonth)}%
            </span>
            <span className={styles.changeLabel}>vs last month</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>📅</span>
            <span className={styles.metricTitle}>Booking Volume</span>
          </div>
          <div className={styles.metricValue}>{bookingTrends?.totalBookings || 0}</div>
          <div className={styles.metricChange}>
            <span className={styles.changeValue}>
              {bookingTrends?.thisMonth > bookingTrends?.lastMonth ? "+" : ""}
              {calculatePercentageChange(bookingTrends?.thisMonth, bookingTrends?.lastMonth)}%
            </span>
            <span className={styles.changeLabel}>vs last month</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>💰</span>
            <span className={styles.metricTitle}>Total Revenue</span>
          </div>
          <div className={styles.metricValue}>
            ₹{revenueAnalytics?.totalRevenue?.toLocaleString() || 0}
          </div>
          <div className={styles.metricChange}>
            <span className={styles.changeValue}>
              {revenueAnalytics?.thisMonth > revenueAnalytics?.lastMonth ? "+" : ""}
              {calculatePercentageChange(revenueAnalytics?.thisMonth, revenueAnalytics?.lastMonth)}%
            </span>
            <span className={styles.changeLabel}>vs last month</span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>📊</span>
            <span className={styles.metricTitle}>Avg Booking Value</span>
          </div>
          <div className={styles.metricValue}>
            ₹{revenueAnalytics?.averageBookingValue?.toLocaleString() || 0}
          </div>
          <div className={styles.metricChange}>
            <span className={styles.changeLabel}>Per booking</span>
          </div>
        </div>
      </div>

      {/* User Growth Details */}
      <div className={styles.section}>
        <h2>User Registration Trends</h2>
        <div className={styles.growthGrid}>
          <div className={styles.growthCard}>
            <div className={styles.growthLabel}>This Month</div>
            <div className={styles.growthValue}>{userGrowth?.thisMonth || 0}</div>
            <div className={styles.growthSubtext}>New Users</div>
          </div>
          <div className={styles.growthCard}>
            <div className={styles.growthLabel}>Last Month</div>
            <div className={styles.growthValue}>{userGrowth?.lastMonth || 0}</div>
            <div className={styles.growthSubtext}>New Users</div>
          </div>
          <div className={styles.growthCard}>
            <div className={styles.growthLabel}>Helpers</div>
            <div className={styles.growthValue}>{userGrowth?.totalHelpers || 0}</div>
            <div className={styles.growthSubtext}>Active</div>
          </div>
          <div className={styles.growthCard}>
            <div className={styles.growthLabel}>Seekers</div>
            <div className={styles.growthValue}>{userGrowth?.totalSeekers || 0}</div>
            <div className={styles.growthSubtext}>Active</div>
          </div>
        </div>
      </div>

      {/* Booking Trends */}
      <div className={styles.section}>
        <h2>Booking Performance</h2>
        <div className={styles.trendGrid}>
          <div className={styles.trendCard}>
            <div className={styles.trendLabel}>Completion Rate</div>
            <div className={styles.trendValue}>
              {bookingTrends?.totalBookings > 0
                ? ((bookingTrends.completedBookings / bookingTrends.totalBookings) * 100).toFixed(1)
                : 0}%
            </div>
          </div>
          <div className={styles.trendCard}>
            <div className={styles.trendLabel}>Completed Bookings</div>
            <div className={styles.trendValue}>{bookingTrends?.completedBookings || 0}</div>
          </div>
          <div className={styles.trendCard}>
            <div className={styles.trendLabel}>Pending Bookings</div>
            <div className={styles.trendValue}>{bookingTrends?.pendingBookings || 0}</div>
          </div>
          <div className={styles.trendCard}>
            <div className={styles.trendLabel}>This Month</div>
            <div className={styles.trendValue}>{bookingTrends?.thisMonth || 0}</div>
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className={styles.section}>
        <h2>Popular Services</h2>
        <div className={styles.servicesList}>
          {topServices && topServices.length > 0 ? (
            topServices.map((service, index) => (
              <div key={index} className={styles.serviceItem}>
                <div className={styles.serviceRank}>{index + 1}</div>
                <div className={styles.serviceInfo}>
                  <div className={styles.serviceName}>{service._id || "Unknown Service"}</div>
                  <div className={styles.serviceStats}>
                    {service.count} bookings · ₹{service.totalRevenue?.toLocaleString() || 0} revenue
                  </div>
                </div>
                <div className={styles.serviceBar}>
                  <div
                    className={styles.serviceBarFill}
                    style={{
                      width: `${(service.count / (topServices[0]?.count || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noData}>No service data available</p>
          )}
        </div>
      </div>

      {/* Top Helpers */}
      <div className={styles.section}>
        <h2>Top Performing Helpers</h2>
        <div className={styles.tableWrapper}>
          {topHelpers && topHelpers.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Helper</th>
                  <th>Email</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topHelpers.map((helper, index) => (
                  <tr key={index}>
                    <td className={styles.rankCell}>#{index + 1}</td>
                    <td className={styles.nameCell}>{helper.name || "Unknown"}</td>
                    <td>{helper.email || "N/A"}</td>
                    <td>{helper.totalBookings || 0}</td>
                    <td className={styles.revenueCell}>
                      ₹{helper.totalRevenue?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noData}>No helper data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdministratorAnalytics;
