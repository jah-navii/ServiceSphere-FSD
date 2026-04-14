import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ReviewModal from "./ReviewModal";
import styles from "./PreviousBookings.module.css";

const PreviousBookings = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch completed past bookings
  useEffect(() => {
    const fetchPastBookings = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/bookings?userId=${currentUser.id}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();

        if (data.success) {
          // Filter for completed bookings in the past
          const completedPastBookings = data.bookings.filter((booking) => {
            const bookingDate = new Date(booking.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Show only completed and paid bookings that are in the past
            return (
              booking.status === "Accepted" &&
              booking.paid === true &&
              bookingDate < today
            );
          });
          setBookings(completedPastBookings);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching past bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPastBookings();
  }, [currentUser]);

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
          {loading ? (
            <p style={{ textAlign: "center" }}>Loading bookings...</p>
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
            <div className={styles.emptyState}>
              <svg
                className={styles.emptyIcon}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
              </svg>
              <h3>No completed bookings yet</h3>
              <p>When you complete service bookings, they will appear here</p>
              <Link to="/search" className={styles.browseButton}>
                Browse Services
              </Link>
            </div>
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
