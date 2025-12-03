import React, { useState } from 'react';

// --- Mock Data simulating backend API response ---
// Note: Dates are stored as Date objects for easy manipulation.
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
  { 
    id: 103, 
    seeker: { name: 'Charlie Brown' }, 
    rating: 3, 
    feedback: 'The painting work was acceptable, but communication could have been better.', 
    date: new Date('2025-11-20T09:15:00Z') 
  },
];
// ------------------------------------------------

// Helper function to render the star rating visualization
const renderRatingStars = (rating) => {
  const fullStars = '⭐️'.repeat(rating);
  const emptyStars = '☆'.repeat(5 - rating);
  return `${fullStars}${emptyStars} (${rating}/5)`;
};

// Helper function to format the date as YYYY-MM-DD
const formatDate = (date) => {
  // Original EJS logic: item.date.toISOString().split('T')[0] 
  // We'll use JS Date methods for robustness.
  if (date instanceof Date) {
      return date.toISOString().split('T')[0];
  }
  return 'N/A';
};


function FeedbackPage() {
  // State to hold the list of feedback items
  // In a real app, this would be fetched on component mount using useEffect
  const [feedbackList] = useState(mockFeedback);

  return (
    // Note: The EJS file included a style block; we assume these styles are 
    // integrated into helperDashboard.css or a dedicated CSS module.
    <section className="feedback-section">
      <h2>Customer Feedback</h2>
      <div className="feedback-list">
        {feedbackList && feedbackList.length > 0 ? (
          feedbackList.map(item => (
            <div className="feedback-item" key={item.id}>
              <div className="feedback-header">
                <span className="seeker-name">{item.seeker.name}</span>
                <span className="rating">
                  {renderRatingStars(item.rating)}
                </span>
              </div>
              <div className="feedback-content">
                <p>{item.feedback}</p>
              </div>
              <div className="feedback-date">
                Date: {formatDate(item.date)}
              </div>
            </div>
          ))
        ) : (
          <p>No feedback available yet.</p>
        )}
      </div>
    </section>
  );
}

export default FeedbackPage;