import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import styles from "./AdministratorBookings.module.css";

const AdministratorBookings = () => {
  const [bookingsData, setBookingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/administrator/bookings/all");
      setBookingsData(data.data);
    } catch (err) {
      setError(err.message);
      console.error("Bookings Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    if (!bookingsData) return [];

    let bookings;
    if (activeStatus === "all") {
      bookings = bookingsData.bookings || [];
    } else {
      bookings = bookingsData.byStatus?.[activeStatus] || [];
    }

    // Apply search filter
    if (searchTerm) {
      bookings = bookings.filter(
        (booking) =>
          booking.seeker?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.helper?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return bookings;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  // Calculate if booking is completed
  const isBookingCompleted = (booking) => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return booking.paid === true && bookingDate < today;
  };

  // Get display status
  const getDisplayStatus = (booking) => {
    if (isBookingCompleted(booking)) return 'completed';
    return booking.status; // pending, accepted, or rejected
  };

  const filteredBookings = getFilteredBookings();
  const { stats } = bookingsData || {};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>All Bookings</h1>
        <p className={styles.subtitle}>Complete booking management and oversight</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats?.total || 0}</div>
            <div className={styles.statLabel}>Total Bookings</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.completed}`}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats?.completed || 0}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.pending}`}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats?.pending || 0}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.cancelled}`}>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats?.cancelled || 0}</div>
            <div className={styles.statLabel}>Cancelled</div>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className={styles.statusFilters}>
        <button
          className={`${styles.filterBtn} ${activeStatus === "all" ? styles.active : ""}`}
          onClick={() => setActiveStatus("all")}
        >
          All Bookings
        </button>
        <button
          className={`${styles.filterBtn} ${activeStatus === "completed" ? styles.active : ""}`}
          onClick={() => setActiveStatus("completed")}
        >
          Completed
        </button>
        <button
          className={`${styles.filterBtn} ${activeStatus === "pending" ? styles.active : ""}`}
          onClick={() => setActiveStatus("pending")}
        >
          Pending
        </button>
        <button
          className={`${styles.filterBtn} ${activeStatus === "cancelled" ? styles.active : ""}`}
          onClick={() => setActiveStatus("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search by seeker, helper, or service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bookings Table */}
      <div className={styles.tableWrapper}>
        {filteredBookings.length > 0 ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Seeker</th>
                <th>Helper</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className={styles.idCell}>
                    {booking._id.slice(-8).toUpperCase()}
                  </td>
                  <td className={styles.nameCell}>
                    {booking.seeker?.name || "Unknown"}
                    <div className={styles.emailText}>{booking.seeker?.email}</div>
                  </td>
                  <td className={styles.nameCell}>
                    {booking.helper?.name || "Unknown"}
                    <div className={styles.emailText}>{booking.helper?.email}</div>
                  </td>
                  <td>{booking.service_type || "N/A"}</td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>{booking.time || "N/A"}</td>
                  <td>{booking.address || "N/A"}</td>
                  <td className={styles.amountCell}>
                    ₹{booking.price?.toLocaleString() || 0}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${styles[getDisplayStatus(booking)]}`}>
                      {getDisplayStatus(booking)}
                      {getDisplayStatus(booking) === 'completed' && ' ✓'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.noData}>
            No bookings found{searchTerm ? " matching your search" : ""}
          </p>
        )}
      </div>

      {/* Summary */}
      {stats && (
        <div className={styles.summary}>
          <h3>Revenue Summary</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Revenue:</span>
              <span className={styles.summaryValue}>
                ₹{stats.totalRevenue?.toLocaleString() || 0}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Average Booking:</span>
              <span className={styles.summaryValue}>
                ₹{stats.averageBookingAmount?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministratorBookings;
