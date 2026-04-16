import React, { useState, useEffect } from 'react';
import styles from './AdministratorModerators.module.css';

const AdministratorModerators = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [moderators, setModerators] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchModerators();
    fetchLocations();
  }, [activeTab]);

  const fetchModerators = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/administrator/moderator-applications?status=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setModerators(data.data?.applications || []);
      } else {
        setError('Failed to fetch moderators');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data || []);
      }
    } catch (err) {
      console.error('Locations fetch error:', err);
    }
  };

  const handleApprove = async (moderatorId) => {
    if (!window.confirm('Approve this moderator application?')) return;

    setActionLoading(moderatorId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/administrator/moderator-applications/${moderatorId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        alert('Moderator approved successfully!');
        fetchModerators();
      } else {
        const data = await response.json();
        alert(data.error || data.message || 'Failed to approve moderator');
      }
    } catch (err) {
      console.error('Approve error:', err);
      alert('Unable to approve moderator');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (moderatorId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setActionLoading(moderatorId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/administrator/moderator-applications/${moderatorId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rejectionReason: reason })
      });

      if (response.ok) {
        alert('Moderator rejected');
        fetchModerators();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to reject moderator');
      }
    } catch (err) {
      console.error('Reject error:', err);
      alert('Unable to reject moderator');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (moderatorId) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    if (!window.confirm('Are you sure you want to suspend this moderator? They will lose access to their location.')) return;

    setActionLoading(moderatorId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/administrator/moderators/${moderatorId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ suspensionReason: reason })
      });

      if (response.ok) {
        alert('Moderator suspended');
        fetchModerators();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to suspend moderator');
      }
    } catch (err) {
      console.error('Suspend error:', err);
      alert('Unable to suspend moderator');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Moderator Management</h1>
        <p className={styles.subtitle}>Review applications and manage location moderators</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'pending' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Applications
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Moderators
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'rejected' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'suspended' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('suspended')}
        >
          Suspended
        </button>
      </div>

      {loading && <div className={styles.loading}>Loading moderators...</div>}
      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && (
        <div className={styles.content}>
          {moderators.length === 0 ? (
            <p className={styles.emptyMessage}>No {activeTab} moderators</p>
          ) : (
            <div className={styles.cardGrid}>
              {moderators.map((moderator) => (
                <div key={moderator._id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>{moderator.name}</h3>
                    <span className={`${styles.badge} ${styles[`${activeTab}Badge`]}`}>
                      {activeTab}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.info}>
                      <strong>Email:</strong> {moderator.email}
                    </div>
                    <div className={styles.info}>
                      <strong>Phone:</strong> {moderator.phone}
                    </div>
                    <div className={styles.info}>
                      <strong>Desired Location:</strong> {moderator.assignedLocation?.name || 'N/A'}
                    </div>
                    {moderator.assignedLocation?.city && (
                      <div className={styles.info}>
                        <strong>City:</strong> {moderator.assignedLocation.city}, {moderator.assignedLocation.state}
                      </div>
                    )}
                    {moderator.experience && (
                      <div className={styles.info}>
                        <strong>Experience:</strong> {moderator.experience}
                      </div>
                    )}
                    {moderator.linkedinProfile && (
                      <div className={styles.info}>
                        <strong>LinkedIn:</strong>{' '}
                        <a href={moderator.linkedinProfile} target="_blank" rel="noreferrer" className={styles.link}>
                          View Profile
                        </a>
                      </div>
                    )}
                    {moderator.resume && (
                      <div className={styles.info}>
                        <strong>Resume:</strong>{' '}
                        <a
                          href={`http://localhost:5000/${moderator.resume}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.resumeLink}
                        >
                          📄 View Resume (PDF)
                        </a>
                      </div>
                    )}
                    {moderator.coverLetter && (
                      <div className={styles.coverLetterBlock}>
                        <strong className={styles.coverLetterTitle}>Cover Letter</strong>
                        <p className={styles.coverLetterText}>{moderator.coverLetter}</p>
                      </div>
                    )}
                    <div className={styles.info}>
                      <strong>Applied:</strong> {new Date(moderator.createdAt).toLocaleDateString()}
                    </div>
                    {moderator.approvedDate && (
                      <div className={styles.info}>
                        <strong>Approved:</strong> {new Date(moderator.approvedDate).toLocaleDateString()}
                      </div>
                    )}
                    {moderator.rejectionReason && (
                      <div className={styles.info}>
                        <strong>Reason:</strong> {moderator.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    {activeTab === 'pending' && (
                      <>
                        <button
                          className={styles.approveBtn}
                          onClick={() => handleApprove(moderator._id)}
                          disabled={actionLoading === moderator._id}
                        >
                          {actionLoading === moderator._id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          className={styles.rejectBtn}
                          onClick={() => handleReject(moderator._id)}
                          disabled={actionLoading === moderator._id}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {activeTab === 'active' && (
                      <button
                        className={styles.suspendBtn}
                        onClick={() => handleSuspend(moderator._id)}
                        disabled={actionLoading === moderator._id}
                      >
                        {actionLoading === moderator._id ? 'Processing...' : 'Suspend'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdministratorModerators;
