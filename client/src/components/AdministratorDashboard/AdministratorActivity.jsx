import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from "./AdministratorActivity.module.css";

const AdministratorActivity = () => {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/administrator/activity");
      setActivityData(data.data);
    } catch (err) {
      setError(err.message);
      console.error("Activity Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      helper_joined: "👤",
      seeker_joined: "🙋",
      admin_joined: "👔",
      booking_created: "📅",
      booking_completed: "✅",
      booking_cancelled: "❌",
      helper_approved: "✓",
      service_added: "🔧",
    };
    return icons[type] || "📌";
  };

  const getActivityColor = (type) => {
    if (type.includes("joined")) return styles.blue;
    if (type.includes("completed") || type.includes("approved")) return styles.green;
    if (type.includes("cancelled")) return styles.red;
    if (type.includes("created") || type.includes("added")) return styles.purple;
    return styles.gray;
  };

  const getFilteredActivities = () => {
    if (!activityData?.activities) return [];
    
    if (filterType === "all") {
      return activityData.activities;
    }

    return activityData.activities.filter((activity) => {
      if (filterType === "users") {
        return activity.type.includes("joined");
      }
      if (filterType === "bookings") {
        return activity.type.includes("booking");
      }
      if (filterType === "helpers") {
        return activity.type.includes("helper");
      }
      return true;
    });
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return past.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading activity...</div>
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

  const filteredActivities = getFilteredActivities();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Platform Activity</h1>
        <p className={styles.subtitle}>Real-time activity monitoring across the platform</p>
      </div>

      {/* Activity Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{activityData?.totalActivities || 0}</div>
            <div className={styles.statLabel}>Total Activities</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{activityData?.todayActivities || 0}</div>
            <div className={styles.statLabel}>Today's Activities</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{activityData?.weekActivities || 0}</div>
            <div className={styles.statLabel}>This Week</div>
          </div>
        </div>
      </div>

      {/* Activity Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterBtn} ${filterType === "all" ? styles.active : ""}`}
          onClick={() => setFilterType("all")}
        >
          All Activity
        </button>
        <button
          className={`${styles.filterBtn} ${filterType === "users" ? styles.active : ""}`}
          onClick={() => setFilterType("users")}
        >
          User Registrations
        </button>
        <button
          className={`${styles.filterBtn} ${filterType === "bookings" ? styles.active : ""}`}
          onClick={() => setFilterType("bookings")}
        >
          Bookings
        </button>
        <button
          className={`${styles.filterBtn} ${filterType === "helpers" ? styles.active : ""}`}
          onClick={() => setFilterType("helpers")}
        >
          Helper Actions
        </button>
      </div>

      {/* Activity Timeline */}
      <div className={styles.timeline}>
        <h2>Activity Timeline</h2>
        {filteredActivities.length > 0 ? (
          <div className={styles.timelineList}>
            {filteredActivities.map((activity, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <h3 className={styles.timelineTitle}>{activity.description}</h3>
                    <span className={styles.timelineTime}>
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  {activity.metadata && (
                    <div className={styles.timelineMetadata}>
                      {activity.metadata.userName && (
                        <span className={styles.metadataItem}>
                          👤 {activity.metadata.userName}
                        </span>
                      )}
                      {activity.metadata.userEmail && (
                        <span className={styles.metadataItem}>
                          ✉️ {activity.metadata.userEmail}
                        </span>
                      )}
                      {activity.metadata.amount && (
                        <span className={styles.metadataItem}>
                          💰 ₹{activity.metadata.amount.toLocaleString()}
                        </span>
                      )}
                      {activity.metadata.serviceType && (
                        <span className={styles.metadataItem}>
                          🔧 {activity.metadata.serviceType}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noData}>No activities found for this filter</p>
        )}
      </div>
    </div>
  );
};

export default AdministratorActivity;
