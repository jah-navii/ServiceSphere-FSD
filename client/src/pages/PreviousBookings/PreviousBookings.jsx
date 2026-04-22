import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ReviewModal from "./ReviewModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { bookingApi } from "../../utils/bookingApi";
import styles from "./PreviousBookings.module.css";

const PreviousBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchPastBookings = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.list(user.id);
      if (data.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setBookings(
          data.bookings.filter((b) =>
            b.status === "Accepted" && b.paid === true && new Date(b.date) < today
          )
        );
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPastBookings(); }, [user]);

  const handleReviewClick = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setSelectedBooking(null);
  };

  return (
    <div>
      <Navbar />

      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.pageTitle}>
              <h1>Previous Bookings</h1>
              <p>Review your completed service bookings</p>
            </div>

            <div className={styles.headerActions}>
              <Link to="/cart" className={styles.outlineBtn}>
                Active Bookings
              </Link>
              <Link to="/home" className={styles.headerButton}>
                Home
              </Link>
            </div>
          </div>
        </header>

        <main>
          {error ? (
            <ErrorState message={error} onRetry={fetchPastBookings} />
          ) : loading ? (
            <LoadingSpinner message="Loading bookings..." />
          ) : bookings.length > 0 ? (
            <div className={styles.bookingsContainer}>
              {bookings.map((booking) => {
                return (
                  <div
                    className={styles.bookingCard}
                    key={booking._id || booking.id}
                  >
                    {/* Header */}
                    <div className={styles.bookingHeader}>
                      <h3>{booking.serviceName || booking.serviceType}</h3>
                      <div className={`${styles.statusBadge} ${styles.completed}`}>
                        Completed
                      </div>
                    </div>

                    {/* Details */}
                    <div className={styles.bookingDetails}>
                      <div className={styles.helperInfo}>
                        <svg
                          className={styles.icon}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span>{booking.helperName}</span>
                      </div>

                      <div className={styles.bookingTime}>
                        <div className={styles.timeItem}>
                          <svg
                            className={styles.icon}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                          </svg>
                          <span>
                            {booking.date
                              ? new Date(booking.date).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className={styles.timeItem}>
                          <svg
                            className={styles.icon}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                          </svg>
                          <span>{booking.time}</span>
                        </div>
                      </div>

                      <div className={styles.bookingCost}>
                        <span className={styles.price}>₹{booking.price}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.bookingActions}>
                      <button
                        className={styles.reviewBtn}
                        onClick={() => handleReviewClick(booking)}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          style={{ marginRight: "6px" }}
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        Write a Review
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No completed bookings yet"
              description="When you complete service bookings, they will appear here."
              ctaLabel="Browse Services"
              ctaTo="/search"
            />
          )}
        </main>
      </div>

      <Footer />

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PreviousBookings;
