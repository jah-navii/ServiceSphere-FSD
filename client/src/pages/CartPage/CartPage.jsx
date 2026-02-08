import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); 
  const navigate = useNavigate(); // Initialize Navigation

  // Fetch Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/bookings?userId=${currentUser.id}`, {
          credentials: "include"
        });
        const data = await response.json();
        
        if (data.success) {
            setBookings(data.bookings);
        } else {
            setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser, refreshKey]);

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
              <p>Manage your confirmed service bookings</p>
            </div>
            
            <div style={{display: 'flex', gap: '10px'}}>
                <button 
                    onClick={handleRefresh} 
                    className={styles.homeButton} 
                    style={{backgroundColor: '#6c757d'}}
                >
                    ↻ Refresh
                </button>
                <Link to="/home" className={styles.homeButton}>
                    Home
                </Link>
            </div>
          </div>
        </header>

        <main>
          {loading ? (
             <p style={{textAlign:'center'}}>Loading bookings...</p>
          ) : bookings.length > 0 ? (
            <div className={styles.bookingsContainer}>
              {bookings.map((booking) => {
                const statusClass = booking.status ? booking.status.toLowerCase() : "pending";
                
                return (
                  <div className={styles.bookingCard} key={booking._id || booking.id}>
                    
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
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
              <h3>No bookings yet</h3>
              <p>When you book services, they will appear here</p>
              <Link to="/search" className={styles.browseButton}>
                Browse Services
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;