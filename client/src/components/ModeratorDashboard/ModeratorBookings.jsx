import React, { useState, useEffect } from 'react';
import { moderatorApi } from '../../utils/moderatorApi';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorState from '../ui/ErrorState';
import styles from './ModeratorBookings.module.css';

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_CLASSES = {
  pending: styles.tagPending,
  confirmed: styles.tagConfirmed,
  in_progress: styles.tagInProgress,
  completed: styles.tagCompleted,
  cancelled: styles.tagCancelled,
};

const ModeratorBookings = () => {
  const [bookings, setBookings]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [searchTerm, setSearchTerm]           = useState('');
  const [statusFilter, setStatusFilter]       = useState('all');
  const [paymentFilter, setPaymentFilter]     = useState('all');
  const [sortBy, setSortBy]                   = useState('date_desc');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const data = await moderatorApi.bookings();
      setBookings(data.data || data.bookings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Derived stats (always from full list) ---
  const today = new Date().toISOString().split('T')[0];
  const stats = {
    total:     bookings.length,
    today:     bookings.filter(b => b.date === today).length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    revenue:   bookings.filter(b => b.paid).reduce((s, b) => s + (b.price || 0), 0),
  };

  // --- Filtering + Sorting ---
  const filtered = bookings
    .filter(b => {
      const q = searchTerm.toLowerCase();
      if (q && !(
        b.seeker?.name?.toLowerCase().includes(q) ||
        b.helper?.name?.toLowerCase().includes(q) ||
        b.service_type?.toLowerCase().includes(q)
      )) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (paymentFilter === 'paid'   && !b.paid)  return false;
      if (paymentFilter === 'unpaid' && b.paid)   return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return (b.date || '').localeCompare(a.date || '');
      if (sortBy === 'date_asc')  return (a.date || '').localeCompare(b.date || '');
      if (sortBy === 'amount_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'amount_asc')  return (a.price || 0) - (b.price || 0);
      return 0;
    });

  if (loading) return <LoadingSpinner message="Loading bookings..." />;
  if (error)   return <ErrorState message={error} onRetry={fetchBookings} />;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Bookings</h1>
        <p className={styles.subtitle}>All service bookings in your location</p>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total',     value: stats.total },
          { label: 'Today',     value: stats.today },
          { label: 'Pending',   value: stats.pending,   accent: '#ed8936' },
          { label: 'Completed', value: stats.completed, accent: '#48bb78' },
          { label: 'Cancelled', value: stats.cancelled, accent: '#f56565' },
          { label: 'Revenue',   value: `\u20B9${stats.revenue.toLocaleString('en-IN')}`, accent: '#667eea' },
        ].map(c => (
          <div key={c.label} className={styles.statCard} style={c.accent ? { borderTopColor: c.accent } : {}}>
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
            placeholder="Search seeker, helper, or serviceâ€¦"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className={styles.filterSelect} value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
        <select className={styles.filterSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="amount_desc">Amount Highâ†’Low</option>
          <option value="amount_asc">Amount Lowâ†’High</option>
        </select>
      </div>

      <p className={styles.resultCount}>
        Showing <strong>{filtered.length}</strong> of <strong>{bookings.length}</strong> bookings
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p>{bookings.length === 0 ? 'No bookings found for your location.' : 'No bookings match your filters.'}</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Service</th>
                <th>Seeker</th>
                <th>Helper</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id}>
                  <td className={styles.idCell}>{b._id.substring(0, 8)}â€¦</td>
                  <td className={styles.serviceCell}>{b.service_type || 'â€”'}</td>
                  <td>{b.seeker?.name || 'â€”'}</td>
                  <td className={styles.muted}>{b.helper?.name || 'â€”'}</td>
                  <td className={styles.muted}>{b.date || 'â€”'}</td>
                  <td className={styles.amount}>&#8377;{(b.price || 0).toLocaleString('en-IN')}</td>
                  <td>
                    {b.paid
                      ? <span className={`${styles.paidBadge} ${styles.paidYes}`}>Paid</span>
                      : <span className={`${styles.paidBadge} ${styles.paidNo}`}>Unpaid</span>
                    }
                  </td>
                  <td>
                    <span className={`${styles.statusTag} ${STATUS_CLASSES[b.status] || ''}`}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ModeratorBookings;
