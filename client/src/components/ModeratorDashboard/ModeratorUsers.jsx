import React, { useState, useEffect } from 'react';
import styles from './ModeratorUsers.module.css';

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ModeratorUsers = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState('bookings');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/moderator/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      } else {
        setError('Failed to load user data.');
      }
    } catch (err) {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className={styles.loadingWrap}>
      <div className={styles.spinner}></div>
      <p>Loading users…</p>
    </div>
  );
  if (error) return <div className={styles.error}>{error}</div>;

  const { users = [], stats = {} } = data || {};

  const filtered = users
    .filter(u => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.seeker?.name?.toLowerCase().includes(q) ||
        u.seeker?.email?.toLowerCase().includes(q) ||
        u.seeker?.mobilenumber?.includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'bookings') return b.totalBookings - a.totalBookings;
      if (sortBy === 'spent')    return b.totalSpent - a.totalSpent;
      if (sortBy === 'recent')   return (b.lastBookingDate || '').localeCompare(a.lastBookingDate || '');
      return 0;
    });

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Seekers who have used services in your location</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total Seekers',    value: stats.totalUsers ?? 0 },
          { label: 'Total Bookings',   value: stats.totalBookings ?? 0 },
          { label: 'Total Revenue',    value: `\u20B9${(stats.totalRevenue ?? 0).toLocaleString('en-IN')}` },
        ].map(c => (
          <div key={c.label} className={styles.statCard}>
            <p className={styles.statValue}>{c.value}</p>
            <p className={styles.statLabel}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="bookings">Sort by Bookings</option>
          <option value="spent">Sort by Amount Spent</option>
          <option value="recent">Sort by Recent Activity</option>
        </select>
      </div>

      <p className={styles.resultCount}>
        Showing <strong>{filtered.length}</strong> of <strong>{users.length}</strong> seekers
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p>{users.length === 0 ? 'No seekers have booked services in this location yet.' : 'No seekers match your search.'}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Seeker</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Bookings</th>
                <th>Total Spent</th>
                <th>Last Booking</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const s = u.seeker;
                if (!s) return null;
                return (
                  <tr key={s._id}>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.avatar}>{getInitials(s.name)}</div>
                        <div className={styles.nameInfo}>
                          <span className={styles.name}>{s.name}</span>
                          <span className={styles.email}>{s.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className={styles.muted}>{s.mobilenumber || '—'}</td>
                    <td className={styles.muted}>{s.address || '—'}</td>
                    <td>
                      <span className={styles.bookingCount}>{u.totalBookings}</span>
                    </td>
                    <td className={styles.amount}>
                      &#8377;{u.totalSpent.toLocaleString('en-IN')}
                    </td>
                    <td className={styles.muted}>{formatDate(u.lastBookingDate)}</td>
                    <td>
                      {s.suspended ? (
                        <span className={`${styles.statusBadge} ${styles.badgeSuspended}`}>Suspended</span>
                      ) : (
                        <span className={`${styles.statusBadge} ${styles.badgeActive}`}>Active</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ModeratorUsers;
