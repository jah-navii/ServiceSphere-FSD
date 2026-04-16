import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ModeratorHome.module.css';

const statusLabel = (s) => {
  if (s === 'pending') return 'Pending';
  if (s === 'confirmed') return 'Confirmed';
  if (s === 'completed') return 'Completed';
  if (s === 'cancelled') return 'Cancelled';
  return s || 'Unknown';
};

const statusClass = (s, styles) => {
  const map = { pending: styles.tagPending, confirmed: styles.tagConfirmed, completed: styles.tagCompleted, cancelled: styles.tagCancelled };
  return map[s] || styles.tagPending;
};

const formatDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ModeratorHome = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/moderator/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json.data);
      } else {
        setError('Failed to load dashboard data.');
      }
    } catch (err) {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard…</p>
      </div>
    );
  }

  if (error) return <div className={styles.error}>{error}</div>;

  const stats   = dashboardData?.stats   || {};
  const location = dashboardData?.location || {};
  const recentBookings     = dashboardData?.recentBookings     || [];
  const pendingHelpersList = dashboardData?.pendingHelpersList || [];

  const statCards = [
    { label: 'Active Helpers',    value: stats.activeHelpers    ?? 0, accent: '#667eea' },
    { label: 'Pending Applications', value: stats.pendingHelpers ?? 0, accent: '#f59e0b', alert: (stats.pendingHelpers ?? 0) > 0 },
    { label: 'Total Seekers',     value: stats.totalSeekers     ?? 0, accent: '#38b2ac' },
    { label: "Today's Bookings",  value: stats.todayBookings    ?? 0, accent: '#48bb78' },
    { label: 'Monthly Revenue',   value: `\u20B9${(stats.monthlyRevenue ?? 0).toLocaleString('en-IN')}`, accent: '#764ba2' },
    { label: 'Avg. Rating',       value: stats.avgRating != null ? `${stats.avgRating} / 5` : '—', accent: '#ed8936' },
  ];

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Overview</h1>
          <div className={styles.locationBadge}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {location.name || 'Unassigned'}
            {location.city ? ` — ${location.city}` : ''}
          </div>
        </div>
      </div>

      {/* ── Pending Alert ── */}
      {(stats.pendingHelpers ?? 0) > 0 && (
        <div className={styles.alert}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            <strong>{stats.pendingHelpers}</strong> helper application{stats.pendingHelpers !== 1 ? 's' : ''} waiting for your review.
          </span>
          <button className={styles.alertBtn} onClick={() => navigate('/moderator/helpers')}>Review Now</button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className={styles.statsGrid}>
        {statCards.map(c => (
          <div key={c.label} className={`${styles.statCard} ${c.alert ? styles.statCardAlert : ''}`}
               style={{ borderTopColor: c.accent }}>
            <p className={styles.statValue}>{c.value}</p>
            <p className={styles.statLabel}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* ── Two-column section ── */}
      <div className={styles.twoCol}>
        {/* Recent Bookings */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Recent Bookings</h2>
            <button className={styles.viewAllBtn} onClick={() => navigate('/moderator/bookings')}>View all</button>
          </div>
          {recentBookings.length === 0 ? (
            <p className={styles.empty}>No bookings yet.</p>
          ) : (
            <div className={styles.bookingList}>
              {recentBookings.map(b => (
                <div key={b._id} className={styles.bookingRow}>
                  <div className={styles.bookingMain}>
                    <span className={styles.serviceType}>{b.service_type || '—'}</span>
                    <div className={styles.bookingParties}>
                      <span>{b.seeker?.name || 'Unknown'}</span>
                      <span className={styles.arrow}>→</span>
                      <span className={styles.helperName}>{b.helper?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className={styles.bookingRight}>
                    <span className={`${styles.statusTag} ${statusClass(b.status, styles)}`}>
                      {statusLabel(b.status)}
                    </span>
                    <span className={styles.bookingDate}>{formatDate(b.date)}</span>
                    <span className={styles.bookingAmt}>\u20B9{(b.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          {/* Location Info */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}><h2>Location Info</h2></div>
            <div className={styles.locationGrid}>
              {[
                ['Location',  location.name  || '—'],
                ['City',      location.city  || '—'],
                ['State',     location.state || '—'],
                ['Status',    location.status || '—'],
                ['Suspended Helpers', stats.suspendedHelpers ?? 0],
                ['Cancelled Bookings', stats.cancelledBookings ?? 0],
              ].map(([label, val]) => (
                <div key={label} className={styles.locationRow}>
                  <span className={styles.locLabel}>{label}</span>
                  <span className={styles.locVal}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Applications quick panel */}
          {pendingHelpersList.length > 0 && (
            <div className={styles.panel}>
              <div className={styles.panelHeader}>
                <h2>Pending Applications</h2>
                <button className={styles.viewAllBtn} onClick={() => navigate('/moderator/helpers')}>See all</button>
              </div>
              <div className={styles.pendingList}>
                {pendingHelpersList.map(h => (
                  <div key={h._id} className={styles.pendingRow}>
                    <div className={styles.pendingAvatar}>
                      {h.name.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.pendingInfo}>
                      <span className={styles.pendingName}>{h.name}</span>
                      <span className={styles.pendingDate}>Applied {formatDate(h.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeratorHome;
