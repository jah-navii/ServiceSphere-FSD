import React, { useState, useEffect } from 'react';
import styles from './ModeratorHelpers.module.css';

const TABS = ['applications', 'active', 'suspended'];

const ModeratorHelpers = () => {
  const [helpers, setHelpers]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [tab, setTab]                   = useState('applications');
  const [search, setSearch]             = useState('');

  useEffect(() => { fetchHelpers(); }, []);

  const fetchHelpers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/moderator/helpers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHelpers(data.data || []);
      } else {
        setError('Failed to load helpers.');
      }
    } catch (err) {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const callAction = async (url, method = 'PATCH', body = null) => {
    const token = localStorage.getItem('token');
    const opts = { method, headers: { Authorization: `Bearer ${token}` } };
    if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch(url, opts);
  };

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    const res = await callAction(`http://localhost:5000/api/moderator/helpers/${id}/approve`);
    if (res.ok) await fetchHelpers();
    setActionLoading(null);
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter a reason for rejection:');
    if (!reason) return;
    setActionLoading(id + '_reject');
    const res = await callAction(`http://localhost:5000/api/moderator/helpers/${id}/reject`, 'PATCH', { rejectionReason: reason });
    if (res.ok) await fetchHelpers();
    setActionLoading(null);
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this helper? They will not be able to receive new bookings.')) return;
    setActionLoading(id + '_suspend');
    const res = await callAction(`http://localhost:5000/api/moderator/helpers/${id}/suspend`);
    if (res.ok) await fetchHelpers();
    setActionLoading(null);
  };

  const handleReactivate = async (id) => {
    setActionLoading(id + '_reactivate');
    const res = await callAction(`http://localhost:5000/api/moderator/helpers/${id}/reactivate`);
    if (res.ok) await fetchHelpers();
    setActionLoading(null);
  };

  if (loading) return (
    <div className={styles.loadingWrap}>
      <div className={styles.spinner}></div>
      <p>Loading helpersâ€¦</p>
    </div>
  );
  if (error) return <div className={styles.error}>{error}</div>;

  const applications = helpers.filter(h => !h.approved && !h.suspended);
  const active       = helpers.filter(h =>  h.approved && !h.suspended);
  const suspended    = helpers.filter(h =>  h.suspended);

  const filterList = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(h =>
      h.name?.toLowerCase().includes(q) ||
      h.email?.toLowerCase().includes(q) ||
      h.category?.name?.toLowerCase().includes(q)
    );
  };

  const counts = { applications: applications.length, active: active.length, suspended: suspended.length };
  const lists  = { applications: filterList(applications), active: filterList(active), suspended: filterList(suspended) };

  const tabLabels = { applications: 'Applications', active: 'Active', suspended: 'Suspended' };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Helpers</h1>
          <p className={styles.subtitle}>Manage helpers in your location</p>
        </div>
        <div className={styles.headerStats}>
          <span className={styles.hStat}><strong>{helpers.length}</strong> Total</span>
          <span className={styles.hStat}><strong>{counts.active}</strong> Active</span>
          {counts.applications > 0 && (
            <span className={`${styles.hStat} ${styles.hStatAlert}`}>
              <strong>{counts.applications}</strong> Pending
            </span>
          )}
        </div>
      </div>

      {/* Tabs + Search */}
      <div className={styles.controls}>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {tabLabels[t]}
              <span className={`${styles.tabCount} ${tab === t ? styles.tabCountActive : ''}`}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name, email or categoryâ€¦"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {lists[tab].length === 0 ? (
          <div className={styles.empty}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>No {tabLabels[tab].toLowerCase()} helpers{search ? ' match your search' : ''}.</p>
          </div>
        ) : (
          <>
            {/* Applications â€” card grid */}
            {tab === 'applications' && (
              <div className={styles.cardGrid}>
                {lists.applications.map(h => (
                  <div key={h._id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.avatar}>{h.name.charAt(0).toUpperCase()}</div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardName}>{h.name}</span>
                        <span className={styles.cardSub}>{h.category?.name || 'No category'}</span>
                      </div>
                      <span className={`${styles.badge} ${styles.badgePending}`}>Pending</span>
                    </div>
                    <div className={styles.cardBody}>
                      <Row label="Email"    val={h.email} />
                      <Row label="Phone"    val={h.mobilenumber || 'â€”'} />
                      <Row label="Gender"   val={h.gender || 'â€”'} />
                      <Row label="Services" val={h.services?.length ?? 0} />
                      <Row label="Applied"  val={h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'â€”'} />
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.approveBtn}
                        onClick={() => handleApprove(h._id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === h._id + '_approve' ? 'Approvingâ€¦' : 'Approve'}
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleReject(h._id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === h._id + '_reject' ? 'Rejectingâ€¦' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active â€” table */}
            {tab === 'active' && (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Helper</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Category</th>
                      <th>Services</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lists.active.map(h => (
                      <tr key={h._id}>
                        <td>
                          <div className={styles.nameCell}>
                            <div className={styles.avatarSm}>{h.name.charAt(0).toUpperCase()}</div>
                            {h.name}
                          </div>
                        </td>
                        <td className={styles.muted}>{h.email}</td>
                        <td className={styles.muted}>{h.mobilenumber || 'â€”'}</td>
                        <td>{h.category?.name || 'â€”'}</td>
                        <td>{h.services?.length ?? 0}</td>
                        <td className={styles.muted}>
                          {h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'â€”'}
                        </td>
                        <td>
                          <button
                            className={styles.suspendBtn}
                            onClick={() => handleSuspend(h._id)}
                            disabled={!!actionLoading}
                          >
                            {actionLoading === h._id + '_suspend' ? 'Suspendingâ€¦' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Suspended â€” card grid */}
            {tab === 'suspended' && (
              <div className={styles.cardGrid}>
                {lists.suspended.map(h => (
                  <div key={h._id} className={`${styles.card} ${styles.cardSuspended}`}>
                    <div className={styles.cardTop}>
                      <div className={`${styles.avatar} ${styles.avatarSuspended}`}>{h.name.charAt(0).toUpperCase()}</div>
                      <div className={styles.cardMeta}>
                        <span className={styles.cardName}>{h.name}</span>
                        <span className={styles.cardSub}>{h.category?.name || 'No category'}</span>
                      </div>
                      <span className={`${styles.badge} ${styles.badgeSuspended}`}>Suspended</span>
                    </div>
                    <div className={styles.cardBody}>
                      <Row label="Email" val={h.email} />
                      <Row label="Phone" val={h.mobilenumber || 'â€”'} />
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.reactivateBtn}
                        onClick={() => handleReactivate(h._id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === h._id + '_reactivate' ? 'Reactivatingâ€¦' : 'Reactivate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, val }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #f7fafc', fontSize: '0.84rem' }}>
    <span style={{ color: '#718096', fontWeight: 600 }}>{label}</span>
    <span style={{ color: '#2d3748' }}>{val}</span>
  </div>
);

export default ModeratorHelpers;
