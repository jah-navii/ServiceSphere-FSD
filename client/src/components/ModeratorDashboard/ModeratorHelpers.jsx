import React, { useState, useEffect } from 'react';
import styles from './ModeratorHelpers.module.css';

const ModeratorHelpers = () => {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchHelpers();
  }, []);

  const fetchHelpers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/moderator/helpers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Helpers response:', data);
        setHelpers(data.data || data.helpers || []);
      } else {
        setError('Failed to load helpers');
      }
    } catch (err) {
      console.error('Helpers fetch error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (helperId) => {
    setActionLoading(helperId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/moderator/helpers/${helperId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the list
        await fetchHelpers();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to approve helper');
      }
    } catch (err) {
      console.error('Approve error:', err);
      alert('Unable to approve helper');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (helperId) => {
    const reason = prompt('Please enter a reason for rejection:');
    if (!reason) return;

    setActionLoading(helperId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/moderator/helpers/${helperId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      if (response.ok) {
        // Refresh the list
        await fetchHelpers();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to reject helper');
      }
    } catch (err) {
      console.error('Reject error:', err);
      alert('Unable to reject helper');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading helpers...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const pendingHelpers = helpers.filter(h => !h.approved);
  const activeHelpers = helpers.filter(h => h.approved);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Helper Applications</h1>

      <div className={styles.stats}>
        <p>Total Helpers: {helpers.length} | Pending: {pendingHelpers.length} | Active: {activeHelpers.length}</p>
      </div>

      {/* Pending Helpers */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Pending Applications ({pendingHelpers.length})
        </h2>
        {pendingHelpers.length === 0 ? (
          <p className={styles.emptyMessage}>No pending applications</p>
        ) : (
          <div className={styles.cardGrid}>
            {pendingHelpers.map((helper) => (
              <div key={helper._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{helper.name}</h3>
                  <span className={`${styles.badge} ${styles.pendingBadge}`}>
                    Pending
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p><strong>Email:</strong> {helper.email}</p>
                  <p><strong>Phone:</strong> {helper.mobilenumber || 'N/A'}</p>
                  <p><strong>Category:</strong> {helper.category?.name || 'N/A'}</p>
                  <p><strong>Location:</strong> {helper.location?.name || helper.address || 'N/A'}</p>
                  <p><strong>Applied:</strong> {new Date(helper.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.approveBtn}
                    onClick={() => handleApprove(helper._id)}
                    disabled={actionLoading === helper._id}
                  >
                    {actionLoading === helper._id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleReject(helper._id)}
                    disabled={actionLoading === helper._id}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Active Helpers */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Active Helpers ({activeHelpers.length})
        </h2>
        {activeHelpers.length === 0 ? (
          <p className={styles.emptyMessage}>No active helpers</p>
        ) : (
          <div className={styles.cardGrid}>
            {activeHelpers.map((helper) => (
              <div key={helper._id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{helper.name}</h3>
                  <span className={`${styles.badge} ${styles.activeBadge}`}>
                    Active
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p><strong>Email:</strong> {helper.email}</p>
                  <p><strong>Phone:</strong> {helper.mobilenumber || 'N/A'}</p>
                  <p><strong>Category:</strong> {helper.category?.name || 'N/A'}</p>
                  <p><strong>Location:</strong> {helper.location?.name || helper.address || 'N/A'}</p>
                  <p><strong>Approved:</strong> {helper.createdAt ? new Date(helper.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ModeratorHelpers;
