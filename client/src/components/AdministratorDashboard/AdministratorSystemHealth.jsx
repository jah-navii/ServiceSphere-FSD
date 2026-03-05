import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from "./AdministratorSystemHealth.module.css";

const AdministratorSystemHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSystemHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/administrator/system-health");
      setHealthData(data.data);
    } catch (err) {
      setError(err.message);
      console.error("System Health Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = (collection) => {
    if (!collection) return "unknown";
    if (collection.issuesFound && collection.issuesFound.length > 0) return "warning";
    if (collection.count > 0) return "healthy";
    return "empty";
  };

  const getStatusIcon = (status) => {
    const icons = {
      healthy: "✅",
      warning: "⚠️",
      empty: "📭",
      unknown: "❓",
    };
    return icons[status] || "❓";
  };

  const getStatusColor = (status) => {
    return styles[status] || "";
  };

  if (loading && !healthData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading system health...</div>
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

  const { database, collections, summary } = healthData || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>System Health Monitor</h1>
          <p className={styles.subtitle}>Real-time platform health and diagnostics</p>
        </div>
        <button className={styles.refreshBtn} onClick={fetchSystemHealth} disabled={loading}>
          {loading ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Overall Status */}
      <div className={styles.overallStatus}>
        <div className={styles.statusCard}>
          <div className={styles.statusIcon}>
            {summary?.totalIssues === 0 ? "✅" : "⚠️"}
          </div>
          <div className={styles.statusContent}>
            <h2>
              {summary?.totalIssues === 0
                ? "System Operational"
                : `${summary?.totalIssues} Issue${summary?.totalIssues > 1 ? "s" : ""} Detected`}
            </h2>
            <p>
              Database: {database?.status === "connected" ? "Connected" : "Disconnected"} ·
              Last checked: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Database Info */}
      <div className={styles.section}>
        <h2>Database Information</h2>
        <div className={styles.dbGrid}>
          <div className={styles.dbCard}>
            <div className={styles.dbLabel}>Status</div>
            <div className={`${styles.dbValue} ${styles.success}`}>
              {database?.status || "Unknown"}
            </div>
          </div>
          <div className={styles.dbCard}>
            <div className={styles.dbLabel}>Database Name</div>
            <div className={styles.dbValue}>{database?.name || "N/A"}</div>
          </div>
          <div className={styles.dbCard}>
            <div className={styles.dbLabel}>Total Collections</div>
            <div className={styles.dbValue}>{collections ? Object.keys(collections).length : 0}</div>
          </div>
          <div className={styles.dbCard}>
            <div className={styles.dbLabel}>Total Documents</div>
            <div className={styles.dbValue}>
              {collections
                ? Object.values(collections).reduce((sum, col) => sum + (col.count || 0), 0)
                : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Collections Health */}
      <div className={styles.section}>
        <h2>Collections Health</h2>
        <div className={styles.collectionsGrid}>
          {collections &&
            Object.entries(collections).map(([name, data]) => {
              const status = getHealthStatus(data);
              return (
                <div key={name} className={`${styles.collectionCard} ${getStatusColor(status)}`}>
                  <div className={styles.collectionHeader}>
                    <span className={styles.collectionIcon}>{getStatusIcon(status)}</span>
                    <h3 className={styles.collectionName}>{name}</h3>
                  </div>
                  <div className={styles.collectionStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Documents:</span>
                      <span className={styles.statValue}>{data.count || 0}</span>
                    </div>
                    {data.sampleDocument && (
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Sample ID:</span>
                        <span className={styles.statValue}>
                          {String(data.sampleDocument).slice(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>
                  {data.issuesFound && data.issuesFound.length > 0 && (
                    <div className={styles.issues}>
                      <div className={styles.issuesHeader}>Issues Found:</div>
                      {data.issuesFound.map((issue, index) => (
                        <div key={index} className={styles.issueItem}>
                          ⚠️ {issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className={styles.section}>
        <h2>Health Summary</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>📊</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{summary?.healthyCollections || 0}</div>
              <div className={styles.summaryLabel}>Healthy Collections</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>⚠️</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{summary?.collectionsWithIssues || 0}</div>
              <div className={styles.summaryLabel}>Collections with Issues</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>📭</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{summary?.emptyCollections || 0}</div>
              <div className={styles.summaryLabel}>Empty Collections</div>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>🔍</div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{summary?.totalIssues || 0}</div>
              <div className={styles.summaryLabel}>Total Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues List */}
      {summary?.totalIssues > 0 && (
        <div className={styles.section}>
          <h2>Action Required</h2>
          <div className={styles.issuesList}>
            {collections &&
              Object.entries(collections)
                .filter(([_, data]) => data.issuesFound && data.issuesFound.length > 0)
                .map(([name, data]) =>
                  data.issuesFound.map((issue, index) => (
                    <div key={`${name}-${index}`} className={styles.issueAlert}>
                      <span className={styles.issueAlertIcon}>⚠️</span>
                      <div className={styles.issueAlertContent}>
                        <div className={styles.issueAlertTitle}>{name}</div>
                        <div className={styles.issueAlertText}>{issue}</div>
                      </div>
                    </div>
                  ))
                )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministratorSystemHealth;
