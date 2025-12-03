import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { updateField, clearForm } from "../../redux/bookingFormSlice";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import { useToast } from "../../context/ToastContext";
import styles from "./BookingForm.module.css";

const BookingForm = () => {
  // ... hooks and logic remain the same ...

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // 1. Get Data passed from Search Page
  const { helperId, helperName, serviceName, price } = location.state || {};

  // Redux State
  const bookingForm = useSelector((state) => state.bookingForm);
  const { currentUser } = useSelector((state) => state.user);

  // Local UI State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if accessed directly without selecting a service
  useEffect(() => {
    if (!helperId) {
      showToast("Please select a service first", "error");
      navigate("/search");
    }
    // Pre-fill name if user is logged in
    if (currentUser?.name && !bookingForm.customerName) {
        dispatch(updateField({ name: "customerName", value: currentUser.name }));
    }
  }, [helperId, navigate, currentUser, dispatch, bookingForm.customerName]);

  // Validation Logic
  const validate = () => {
    let tempErrors = {};
    if (!bookingForm.customerName || bookingForm.customerName.length < 3) 
        tempErrors.customerName = "Name must be at least 3 characters.";
    
    if (!bookingForm.date) tempErrors.date = "Date is required.";
    
    // Check if date is in the past
    const selectedDate = new Date(bookingForm.date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if(selectedDate < today) tempErrors.date = "Date cannot be in the past.";

    if (!bookingForm.time) tempErrors.time = "Time is required.";
    
    if (!bookingForm.address || bookingForm.address.length < 10) 
        tempErrors.address = "Address must be at least 10 characters.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateField({ name, value }));
    // Clear specific error when typing
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const bookingPayload = {
      ...bookingForm,
      helperId,
      helperName,
      serviceName,
      price,
      userId: currentUser?.id || "guest", // Handle guest checkout if needed
    };

    try {
      // API Call
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Booking failed");

      showToast("Booking Confirmed Successfully!", "success");
      dispatch(clearForm());
      navigate("/home"); // Or /profile to see bookings

    } catch (err) {
      console.error(err);
      showToast("Failed to book service. Try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!helperId) return null; 

  return (
    <div>
      <Navbar />
      
      <div className={styles.bookingContainer}>
        {/* Fix: Using className instead of inline styles prevents overlap */}
        <h1 className={styles.heading}>
          Book <span className={styles.highlight}>{helperName}</span>
        </h1>
        
        <p className={styles.subHeading}>
            for <strong>{serviceName}</strong> (₹{price})
        </p>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
             {/* ... Form inputs remain exactly the same ... */}
             
             {/* Example of one input to check formatting: */}
             <label htmlFor="customerName" className={styles.label}>Your Name:</label>
             <input
              type="text"
              name="customerName"
              className={styles.inputField}
              value={bookingForm.customerName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.customerName && <div className={styles.fieldError}>{errors.customerName}</div>}

            {/* ... Rest of the form ... */}

            {/* Date */}
            <label htmlFor="date" className={styles.label}>Select Date:</label>
            <input
              type="date"
              name="date"
              className={styles.inputField}
              value={bookingForm.date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.date && <div className={styles.fieldError}>{errors.date}</div>}

            {/* Time */}
            <label htmlFor="time" className={styles.label}>Select Time:</label>
            <input
              type="time"
              name="time"
              className={styles.inputField}
              value={bookingForm.time}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.time && <div className={styles.fieldError}>{errors.time}</div>}

            {/* Address */}
            <label htmlFor="address" className={styles.label}>Address:</label>
            <textarea
              name="address"
              className={styles.inputField}
              rows="4"
              value={bookingForm.address}
              onChange={handleChange}
              disabled={isSubmitting}
            ></textarea>
            {errors.address && <div className={styles.fieldError}>{errors.address}</div>}

             <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Confirming..." : `Pay & Confirm ₹${price}`}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingForm;