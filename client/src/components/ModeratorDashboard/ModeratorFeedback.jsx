import React, { useState, useEffect } from 'react';
import styles from './ModeratorFeedback.module.css';

const StarRating = ({ rating, size = 'md' }) => (
  <div className={`${styles.stars} ${styles[`stars_${size}`]}`}>
    {[1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        className={star <= rating ? styles.starFilled : styles.starEmpty}
      >
        ★
      </span>
    ))}
  </div>
);

const getInitials = (name = '') =>
  name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const ratingLabel = (r) => ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'][r - 1];
const ratingColor = (r) => ['#e53e3e', '#ed8936', '#ecc94b', '#48bb78', '#38a169'][r - 1];

const ModeratorFeedback = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterHelper, setFilterHelper] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/moderator/feedbacks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      } else {
        setError('Failed to load feedback data.');
      }
    } catch (err) {
      console.error('Feedback fetch error:', err);
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFeedbacks = () => {
    let list = data?.feedbacks || [];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        f =>
          f.seeker?.name?.toLowerCase().includes(q) ||
          f.helper?.name?.toLowerCase().includes(q) ||
          f.feedback?.toLowerCase().includes(q)
      );
    }

    if (filterRating !== 'all') {
      list = list.filter(f => f.rating === parseInt(filterRating));
    }

    if (filterHelper !== 'all') {
      list = list.filter(f => f.helper?._id === filterHelper);
    }

    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'highest') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list = [...list].sort((a, b) => a.rating - b.rating);
    }

    return list;
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner}></div>
        <p>Loading reviews…</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const { stats = {}, helperStats = [] } = data || {};
  const feedbacks = getFilteredFeedbacks();
  const maxDist = Math.max(...(stats.ratingDistribution || [0]), 1);

  const uniqueHelpers = [...new Map(
    (data?.feedbacks || [])
      .filter(f => f.helper)
      .map(f => [f.helper._id, f.helper])
  ).values()];

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Feedback &amp; Reviews</h1>
          <p className={styles.subtitle}>Quality overview for helpers in your location</p>
        </div>
        <div className={styles.overallBadge}>
          <span className={styles.overallScore}>{stats.averageRating ?? '—'}</span>
          <span className={styles.overallMax}> / 5</span>
          <div className={styles.overallStars}>
            <StarRating rating={Math.round(stats.averageRating || 0)} size="sm" />
          </div>
          <span className={styles.overallLabel}>Overall Rating</span>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>💬</span>
          <div>
            <p className={styles.statValue}>{stats.total ?? 0}</p>
            <p className={styles.statLabel}>Total Reviews</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⭐</span>
          <div>
            <p className={styles.statValue}>{stats.averageRating ?? '—'}</p>
            <p className={styles.statLabel}>Avg Rating</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>🏆</span>
          <div>
            <p className={styles.statValue}>{stats.ratingDistribution?.[4] ?? 0}</p>
            <p className={styles.statLabel}>5-Star Reviews</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⚠️</span>
          <div>
            <p className={styles.statValue}>
              {(stats.ratingDistribution?.[0] ?? 0) + (stats.ratingDistribution?.[1] ?? 0)}
            </p>
            <p className={styles.statLabel}>Low Ratings (1–2★)</p>
          </div>
        </div>
      </div>

      {/* ── Rating Distribution ── */}
      <div className={styles.distCard}>
        <h2 className={styles.sectionTitle}>Rating Distribution</h2>
        <div className={styles.distBars}>
          {[5, 4, 3, 2, 1].map(r => {
            const count = stats.ratingDistribution?.[r - 1] ?? 0;
            const pct = maxDist ? (count / maxDist) * 100 : 0;
            return (
              <div key={r} className={styles.distRow}>
                <span className={styles.distLabel}>{r}★</span>
                <div className={styles.distBarWrap}>
                  <div
                    className={styles.distBar}
                    style={{ width: `${pct}%`, background: ratingColor(r) }}
                  />
                </div>
                <span className={styles.distCount}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Top Helpers Summary ── */}
      {helperStats.length > 0 && (
        <div className={styles.helperSummaryCard}>
          <h2 className={styles.sectionTitle}>Helper Ratings Summary</h2>
          <div className={styles.helperSummaryGrid}>
            {helperStats.map(hs => (
              <div key={hs.helper._id} className={styles.helperSummaryItem}>
                <div className={styles.helperAvatar}>
                  {getInitials(hs.helper.name)}
                </div>
                <div className={styles.helperSummaryInfo}>
                  <span className={styles.helperSummaryName}>{hs.helper.name}</span>
                  <StarRating rating={Math.round(hs.averageRating)} size="xs" />
                  <span className={styles.helperSummaryMeta}>
                    {hs.averageRating} avg · {hs.totalReviews} review{hs.totalReviews !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className={styles.filtersBar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by helper, seeker or keyword…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearSearch} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <select
          className={styles.filterSelect}
          value={filterRating}
          onChange={e => setFilterRating(e.target.value)}
        >
          <option value="all">All Ratings</option>
          {[5, 4, 3, 2, 1].map(r => (
            <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filterHelper}
          onChange={e => setFilterHelper(e.target.value)}
        >
          <option value="all">All Helpers</option>
          {uniqueHelpers.map(h => (
            <option key={h._id} value={h._id}>{h.name}</option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* ── Result Count ── */}
      <p className={styles.resultCount}>
        Showing <strong>{feedbacks.length}</strong> of <strong>{stats.total ?? 0}</strong> review{(stats.total ?? 0) !== 1 ? 's' : ''}
      </p>

      {/* ── Review Cards ── */}
      {feedbacks.length === 0 ? (
        <div className={styles.empty}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p>No reviews match your filters.</p>
        </div>
      ) : (
        <div className={styles.reviewList}>
          {feedbacks.map(f => (
            <div key={f._id} className={styles.reviewCard}>
              {/* Left: seeker avatar */}
              <div
                className={styles.seekerAvatar}
                style={{ background: `linear-gradient(135deg, #667eea, #764ba2)` }}
              >
                {getInitials(f.seeker?.name || '?')}
              </div>

              {/* Middle: content */}
              <div className={styles.reviewContent}>
                <div className={styles.reviewMeta}>
                  <div className={styles.reviewNames}>
                    <span className={styles.seekerName}>{f.seeker?.name || 'Unknown Seeker'}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.helperName}>{f.helper?.name || 'Unknown Helper'}</span>
                  </div>
                  <span className={styles.reviewDate}>{formatDate(f.date)}</span>
                </div>

                <div className={styles.ratingRow}>
                  <StarRating rating={f.rating} size="md" />
                  <span
                    className={styles.ratingPill}
                    style={{ background: ratingColor(f.rating) + '22', color: ratingColor(f.rating) }}
                  >
                    {ratingLabel(f.rating)}
                  </span>
                </div>

                <p className={styles.reviewText}>"{f.feedback}"</p>
              </div>

              {/* Right: rating badge */}
              <div
                className={styles.ratingBadge}
                style={{ background: ratingColor(f.rating) }}
              >
                {f.rating}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeratorFeedback;
