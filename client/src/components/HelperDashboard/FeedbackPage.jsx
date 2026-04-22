import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { helperApi } from '../../utils/helperApi';
import styles from './FeedbackPage.module.css';

function FeedbackPage() {
  const { userData } = useOutletContext();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('all');

  // Get Helper ID safely
  const helperId = userData?.helper?._id || userData?.helper?.id || userData?._id;

  // 1. Fetch Feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!helperId) return;

      try {
        const data = await helperApi.feedback(helperId);
        setFeedbackList(data);
      } catch (err) {
        console.error("Failed to load feedback:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [helperId]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!feedbackList.length) return null;
    
    const totalReviews = feedbackList.length;
    const avgRating = (feedbackList.reduce((sum, item) => sum + item.rating, 0) / totalReviews).toFixed(1);
    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: feedbackList.filter(item => item.rating === star).length
    }));
    
    return { totalReviews, avgRating, ratingDistribution };
  }, [feedbackList]);

  // Filter feedback by rating
  const filteredFeedback = useMemo(() => {
    if (filterRating === 'all') return feedbackList;
    return feedbackList.filter(item => item.rating === parseInt(filterRating));
  }, [feedbackList, filterRating]);

  // Helper to render stars
  const renderRatingStars = (rating) => {
    const fullStars = '★'.repeat(rating);
    const emptyStars = '☆'.repeat(5 - rating);
    return `${fullStars}${emptyStars} (${rating}/5)`;
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <p style={{padding:'20px'}}>Loading feedback...</p>;

  return (
    <section className={styles.section}>
      {/* Statistics Dashboard */}
      {stats && (
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.avgRating}</div>
            <div className={styles.statLabel}>Average Rating</div>
            <div className={styles.stars}>
              {renderRatingStars(Math.round(parseFloat(stats.avgRating)))}
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalReviews}</div>
            <div className={styles.statLabel}>Total Reviews</div>
          </div>
          
          <div className={styles.ratingBreakdown}>
            <div className={styles.breakdownTitle}>Rating Distribution</div>
            {stats.ratingDistribution.map(({ star, count }) => (
              <div key={star} className={styles.breakdownRow}>
                <span className={styles.breakdownStar}>{star} ★</span>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${(count / stats.totalReviews) * 100}%` }}
                  />
                </div>
                <span className={styles.breakdownCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      {feedbackList.length > 0 && (
        <div className={styles.filterContainer}>
          <label className={styles.filterLabel}>Filter by rating:</label>
          <select 
            className={styles.filterSelect} 
            value={filterRating} 
            onChange={(e) => setFilterRating(e.target.value)}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      )}
      
      {/* Feedback List */}
      <div className={styles.list}>
        {filteredFeedback && filteredFeedback.length > 0 ? (
          filteredFeedback.map(item => (
            <div className={styles.card} key={item._id}>
              <div className={styles.header}>
                <span className={styles.seekerName}>
                    {item.seeker?.name || "Unknown User"}
                </span>
                <span className={styles.rating}>
                  {renderRatingStars(item.rating)}
                </span>
              </div>
              
              <div className={styles.content}>
                {item.feedback}
              </div>
              
              <div className={styles.date}>
                {formatDate(item.createdAt || item.date)}
              </div>
            </div>
          ))
        ) : feedbackList.length > 0 ? (
          <p className={styles.empty}>No feedback matches the selected filter.</p>
        ) : (
          <p className={styles.empty}>No feedback received yet. Keep up the great work!</p>
        )}
      </div>
    </section>
  );
}

export default FeedbackPage;