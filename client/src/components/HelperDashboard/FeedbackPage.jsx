import React, { useState } from 'react';
import styles from './FeedbackPage.module.css';

const mockFeedback = [
  { 
    id: 101, 
    seeker: { name: 'Alice Smith' }, 
    rating: 5, 
    feedback: 'Excellent cleaning service! Punctual and very thorough. Highly recommend.', 
    date: new Date('2025-11-30T10:00:00Z') 
  },
  { 
    id: 102, 
    seeker: { name: 'Bob Johnson' }, 
    rating: 4, 
    feedback: 'Good service for the plumbing repair. Took a little longer than expected but the fix was solid.', 
    date: new Date('2025-11-25T14:30:00Z') 
  },
];

const renderRatingStars = (rating) => {
  const fullStars = '⭐️'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return `${fullStars}${emptyStars} (${rating}/5)`;
};

const formatDate = (date) => {
  if (date instanceof Date) {
      return date.toLocaleDateString();
  }
  return 'N/A';
};

function FeedbackPage() {
  const [feedbackList] = useState(mockFeedback);

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Customer Feedback</h2>
      
      <div className={styles.list}>
        {feedbackList && feedbackList.length > 0 ? (
          feedbackList.map(item => (
            <div className={styles.card} key={item.id}>
              <div className={styles.header}>
                <span className={styles.seekerName}>{item.seeker.name}</span>
                <span className={styles.rating}>
                  {renderRatingStars(item.rating)}
                </span>
              </div>
              
              <div className={styles.content}>
                {item.feedback}
              </div>
              
              <div className={styles.date}>
                Date: {formatDate(item.date)}
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