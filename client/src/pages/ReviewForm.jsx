import React, { useEffect, useState } from "react";
import "../styles/ReviewForm.css"; // adjust path as per your project

// Props version so you can pass data from router / parent
// Example usage:
// <Review
//   serviceType="Cleaning"
//   helperName="John Doe"
//   date="2025-12-02"
//   time="10:00 AM"
//   price={499}
// />
const Review = ({ serviceType, helperName, date, time, price }) => {
  const [bookingId, setBookingId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Get bookingId from URL ?bookingId=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("bookingId");
    if (id) setBookingId(id);
  }, []);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setHoverRating(0);
  };

  const goToCart = () => {
    window.location.href = "/cart"; // or use navigate("/cart") if using react-router
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleStarMouseEnter = (value) => {
    setHoverRating(value);
  };

  const handleStarMouseLeave = () => {
    setHoverRating(0);
  };

  const submitReview = async () => {
    const finalRating = rating;

    // simple check: at least 1 star
    if (finalRating === 0) {
      alert("Please select a rating before submitting.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const urlBookingId = params.get("bookingId");

    const feedbackData = {
      bookingId: urlBookingId || bookingId,
      rating: finalRating,
      review: reviewText,
      helperName: helperName,
      serviceType,
    };

    try {
      const response = await fetch("/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      const result = await response.json();
      console.log("Feedback submitted:", result);

      alert("Thank you for your feedback!");
      closeModal();
      goToCart();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Something went wrong while submitting feedback.");
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="success-container">
      <i className="fas fa-check-circle success-icon"></i>
      <h1 className="success-title">Payment Successful!</h1>
      <p className="success-message">
        Your booking has been confirmed and payment has been completed
        successfully.
      </p>

      <div className="booking-details">
        <div className="booking-item">
          <span>Service:</span>
          <span id="service-name">{serviceType}</span>
        </div>
        <div className="booking-item">
          <span>Helper:</span>
          <span id="helper-name">{helperName}</span>
        </div>
        <div className="booking-item">
          <span>Date &amp; Time:</span>
          <span id="service-datetime">
            {date}, {time}
          </span>
        </div>
        <div className="booking-item">
          <span>Amount Paid:</span>
          <span id="amount-paid">
            ₹
            {typeof price === "number"
              ? price.toFixed(2)
              : price}
          </span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn primary-btn" onClick={openModal}>
          Rate &amp; Review
        </button>
        <button className="btn secondary-btn" onClick={goToCart}>
          Back to Bookings
        </button>
      </div>

      {/* Rating Modal */}
      <div
        id="ratingModal"
        className="modal"
        style={{ display: showModal ? "flex" : "none" }}
      >
        <div className="modal-content">
          <h2 className="modal-title">Rate &amp; Review</h2>

          <label>Your Rating:</label>
          <div className="star-rating">
            {stars.map((value) => (
              <span
                key={value}
                className={
                  "star " +
                  ((hoverRating || rating) >= value ? "active" : "")
                }
                onClick={() => handleStarClick(value)}
                onMouseEnter={() => handleStarMouseEnter(value)}
                onMouseLeave={handleStarMouseLeave}
              >
                &#9733;
              </span>
            ))}
          </div>

          <label htmlFor="review">Your Review:</label>
          <textarea
            id="review"
            rows="3"
            placeholder="Write your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <div className="modal-buttons">
            <button className="btn secondary-btn" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn primary-btn" onClick={submitReview}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
