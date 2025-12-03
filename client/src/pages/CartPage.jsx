// src/pages/CartPage.jsx
import React from "react";
import "../styles/CartPage.css";

// Optional: mock bookings if none are passed as props
const mockBookings = [
  {
    id: "b1",
    serviceType: "Deep Cleaning",
    status: "Accepted",
    helperName: "Alex Johnson",
    date: "2025-12-10",
    time: "10:00",
    price: 500,
    paid: false,
  },
  {
    id: "b2",
    serviceType: "Gardening",
    status: "Pending",
    helperName: "Priya Sharma",
    date: "2025-12-12",
    time: "16:30",
    price: 350,
    paid: false,
  },
];

const CartPage = ({ bookings = mockBookings }) => {
  const hasBookings = bookings && bookings.length > 0;

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <div className="page-title">
            <h1>My Bookings</h1>
            <p>Manage your confirmed service bookings</p>
          </div>
          <a href="/home" className="home-button">
            <i className="fas fa-home"></i> Home
          </a>
        </div>
      </header>

      <main>
        {hasBookings ? (
          <div className="bookings-container">
            {bookings.map((booking) => {
              const {
                id,
                serviceType,
                status,
                helperName,
                date,
                time,
                price,
                paid,
              } = booking;

              const safeStatus = status || "Pending";
              const statusClass = safeStatus.toLowerCase();
              const numericPrice = Number(price) || 0;

              return (
                <div className="booking-card" data-id={id} key={id}>
                  <div className="booking-header">
                    <h3>{serviceType}</h3>
                    <div className={`status-badge ${statusClass}`}>
                      {safeStatus}
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="helper-info">
                      <i className="fas fa-user-circle"></i>
                      <span>{helperName}</span>
                    </div>

                    <div className="booking-time">
                      <div className="time-item">
                        <i className="fas fa-calendar"></i>
                        <span>{date}</span>
                      </div>
                      <div className="time-item">
                        <i className="fas fa-clock"></i>
                        <span>{time}</span>
                      </div>
                    </div>

                    <div className="booking-cost">
                      <span className="price">
                        ₹{numericPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="booking-actions">
                    {safeStatus === "Accepted" && !paid ? (
                      <form action="/payment" method="GET">
                        <input
                          type="hidden"
                          name="bookingId"
                          value={id}
                        />
                        <button type="submit" className="payment-btn">
                          Complete Payment
                        </button>
                      </form>
                    ) : safeStatus === "Accepted" && paid ? (
                      <div className="payment-status paid">
                        <i className="fas fa-check-circle"></i> Payment Complete
                      </div>
                    ) : safeStatus === "Rejected" ? (
                      <div className="payment-status rejected">
                        <i className="fas fa-times-circle"></i> Booking Rejected
                      </div>
                    ) : (
                      <div className="payment-status pending">
                        <i className="fas fa-clock"></i> Awaiting Confirmation
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-shopping-cart"></i>
            <h3>No bookings yet</h3>
            <p>When you book services, they will appear here</p>
            <a href="/search" className="browse-button">
              Browse Services
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
