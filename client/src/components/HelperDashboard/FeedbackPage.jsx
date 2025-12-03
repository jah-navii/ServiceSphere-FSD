import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './FeedbackPage.module.css';

function FeedbackPage() {
  const { userData } = useOutletContext();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get Helper ID safely
  const helperId = userData?.helper?._id || userData?.helper?.id || userData?._id;

  // 1. Fetch Feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      if (!helperId) return;

      try {
        const res = await fetch(`http://localhost:5000/api/helper/feedback/${helperId}`);
        const data = await res.json();

        if (res.ok) {
          setFeedbackList(data);
        } else {
          console.error("Failed to load feedback");
        }
      } catch (err) {
        console.error("Network error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [helperId]);

  // Helper to render stars
  const renderRatingStars = (rating) => {
    const fullStars = '⭐️'.repeat(rating);
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
      <h2 className={styles.heading}>Customer Feedback</h2>
      
      <div className={styles.list}>
        {feedbackList && feedbackList.length > 0 ? (
          feedbackList.map(item => (
            <div className={styles.card} key={item._id}>
              <div className={styles.header}>
                {/* Check if seeker exists (might be deleted user) */}
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
                Date: {formatDate(item.createdAt || item.date)}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.empty}>No feedback available yet.</p>
        )}
      </div>
    </section>
  );
}

export default FeedbackPage;