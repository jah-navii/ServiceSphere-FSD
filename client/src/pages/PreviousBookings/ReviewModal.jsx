import React, { useState } from "react";
import { useToast } from "../../context/ToastContext";
import { serviceApi } from "../../utils/serviceApi";
import styles from "./ReviewModal.module.css";

const ReviewModal = ({ booking, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }

    if (!review.trim()) {
      showToast("Please write a review", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      await serviceApi.postFeedback({
        bookingId: booking._id || booking.id,
        rating,
        review: review.trim(),
      });
      showToast("Review submitted successfully!", "success");
      onClose();
    } catch (error) {
      showToast(error.message || "Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Write a Review</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.bookingInfo}>
          <h3>{booking.serviceName || booking.serviceType}</h3>
          <p>Helper: {booking.helperName}</p>
          <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.ratingSection}>
            <label>Rate your experience:</label>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`${styles.star} ${
                    star <= (hoverRating || rating) ? styles.filled : ""
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </button>
              ))}
            </div>
            <p className={styles.ratingText}>
              {rating === 0
                ? "Select a rating"
                : rating === 1
                ? "Poor"
                : rating === 2
                ? "Fair"
                : rating === 3
                ? "Good"
                : rating === 4
                ? "Very Good"
                : "Excellent"}
            </p>
          </div>

          <div className={styles.reviewSection}>
            <label htmlFor="review">Your Review:</label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this service..."
              rows="5"
              maxLength="500"
              required
            />
            <p className={styles.charCount}>{review.length}/500</p>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
