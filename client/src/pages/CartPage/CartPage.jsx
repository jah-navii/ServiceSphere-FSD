import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { bookingApi } from "../../utils/bookingApi";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await bookingApi.list(user.id);
      if (data.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setBookings(
          data.bookings.filter((b) => {
            const bookingDate = new Date(b.date);
            return bookingDate >= today || !(b.status === "Accepted" && b.paid === true);
          })
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

  useEffect(() => { fetchBookings(); }, [user, refreshKey]);

  // --- FIX IS HERE ---
  // We accept the whole 'booking' object, not just an ID
  const handlePayment = (booking) => {
    navigate('/payment', { 
      state: { 
        bookingId: booking.id || booking._id, // Handle both ID formats
        serviceName: booking.serviceType || booking.serviceName, // Map service name
        price: booking.price,
        helperName: booking.helperName,
        date: booking.date,
        time: booking.time
      } 
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <Navbar />
      
      <div className={styles.pageContainer}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.pageTitle}>
              <h1>My Bookings</h1>
              <p>Manage your active service bookings</p>
            </div>
            
            <div className={styles.headerActions}>
                <button 
                    onClick={handleRefresh} 
                    className={styles.refreshBtn}
                >
                    ↻ Refresh
                </button>
                <Link to="/previous-bookings" className={styles.outlineBtn}>
                    Previous Bookings
                </Link>
                <Link to="/home" className={styles.homeButton}>
                    Home
                </Link>
            </div>
          </div>
        </header>

        <main>
          {error ? (
            <ErrorState message={error} onRetry={fetchBookings} />
          ) : loading ? (
            <LoadingSpinner message="Loading bookings..." />
          ) : bookings.length > 0 ? (
            <div className={styles.bookingsContainer}>
              {bookings.map((booking) => {
                const statusClass = booking.status ? booking.status.toLowerCase() : "pending";
                
                return (
                  <div className={`${styles.bookingCard} ${styles[statusClass]}`} key={booking._id || booking.id}>
                    
                    {/* Header */}
                    <div className={styles.bookingHeader}>
                      <h3>{booking.serviceName || booking.serviceType}</h3>
                      <div className={`${styles.statusBadge} ${styles[statusClass]}`}>
                        {booking.status || "Pending"}
                      </div>
                    </div>

                    {/* Details */}
                    <div className={styles.bookingDetails}>
                      <div className={styles.helperInfo}>
                        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        <span>{booking.helperName}</span>
                      </div>

                      <div className={styles.bookingTime}>
                        <div className={styles.timeItem}>
                          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                          {/* Handle Date formatting safely */}
                          <span>
                            {booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className={styles.timeItem}>
                          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                          <span>{booking.time}</span>
                        </div>
                      </div>

                      <div className={styles.bookingCost}>
                        <span className={styles.price}>
                          ₹{booking.price}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className={styles.bookingActions}>
                      {booking.status === "Accepted" && !booking.paid ? (
                        <button 
                            className={styles.paymentBtn}
                            // --- FIX: Pass the whole booking object ---
                            onClick={() => handlePayment(booking)} 
                        >
                          Complete Payment
                        </button>
                      ) : booking.status === "Accepted" && booking.paid ? (
                        <div className={`${styles.paymentStatus} ${styles.textPaid}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                          Payment Complete
                        </div>
                      ) : booking.status === "Rejected" ? (
                        <div className={`${styles.paymentStatus} ${styles.textRejected}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>
                          Booking Rejected
                        </div>
                      ) : (
                        <div className={`${styles.paymentStatus} ${styles.textPending}`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                          Awaiting Confirmation
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No bookings yet"
              description="When you book services, they will appear here."
              ctaLabel="Browse Services"
              ctaTo="/search"
            />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;