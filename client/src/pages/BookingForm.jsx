// src/pages/BookingForm.jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateField,
  clearForm,
  addBooking,
} from "../redux/bookingFormSlice.js"; // adjust path if needed
import "../styles/BookingForm.css";

// Mock data (same idea as before)
const MOCK_HELPER = { id: "helper_123", name: "Alex Johnson" };
const MOCK_SERVICE = "Deep Cleaning";
const MOCK_PRICE = 95.0;

// Selector with safe fallback so it never becomes undefined
const selectBookingForm = (state) => state.bookingForm || {};

const BookingForm = () => {
  const dispatch = useDispatch();
  const bookingForm = useSelector(selectBookingForm);

  // Make sure each field has at least an empty string
  const formData = {
    customerName: bookingForm.customerName || "",
    date: bookingForm.date || "",
    time: bookingForm.time || "",
    address: bookingForm.address || "",
  };

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field-level validation used while typing
  const validateField = (name, value, currentData) => {
    const data = { ...currentData, [name]: value };

    if (name === "customerName") {
      const trimmedName = value.trim();
      const nameRegex = /^[a-zA-Z\s]+$/;

      if (trimmedName.length < 3) {
        return "Your Name must be at least 3 characters long.";
      }
      if (!nameRegex.test(trimmedName)) {
        return "Your Name can only contain alphabetic characters and spaces.";
      }
    }

    if (name === "date") {
      if (!value) {
        return "Please select a date.";
      }
      const selectedDate = new Date(value);
      if (Number.isNaN(selectedDate.getTime())) {
        return "Invalid date selected.";
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      if (selectedDate < tomorrow) {
        return "Please select a valid date (tomorrow or later).";
      }
    }

    if (name === "time") {
      if (!value) {
        return "Please select a valid time.";
      }
    }

    if (name === "address") {
      const trimmedAddress = value.trim();
      if (trimmedAddress.length <5) {
        return "Please enter the address"  };
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update Redux
    dispatch(updateField({ name, value }));

    // Clear success when user edits again
    if (successMessage) setSuccessMessage("");

    // Run field-level validation and show error immediately
    const fieldError = validateField(name, value, formData);
    setError(fieldError);
  };

  // Full-form validation used on submit
  const validateForm = (data) => {
    const { customerName, date, time, address } = data;

    const trimmedName = customerName.trim();
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (trimmedName.length < 3) {
      return "Your Name must be at least 3 characters long.";
    }
    if (!nameRegex.test(trimmedName)) {
      return "Your Name can only contain alphabetic characters and spaces.";
    }

    if (!date) {
      return "Please select a date.";
    }

    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) {
      return "Invalid date selected.";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      return "Please select a valid date (tomorrow or later).";
    }

    if (!time) {
      return "Please select a valid time.";
    }

    const trimmedAddress = address.trim();
    if (trimmedAddress.length < 10) {
      return "Please enter a more detailed address (at least 10 characters).";
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    const bookingData = {
      ...formData,
      helperID: MOCK_HELPER.id,
      helperName: MOCK_HELPER.name,
      servicetype: MOCK_SERVICE,
      price: MOCK_PRICE,
      status: "Pending",
      paid: false,
    };

    // Save to Redux list
    dispatch(addBooking(bookingData));
    dispatch(clearForm());

    setSuccessMessage("Booking confirmed successfully!");
    setIsSubmitting(false);
  };

  return (
    <div className="booking-container">
      <h1 className="sequel-sans">
        Book <span>{MOCK_HELPER.name}</span>
      </h1>

      <div className="form-card sequel-sans">
        <form onSubmit={handleSubmit}>
          {/* Error */}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Success */}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          {/* Hidden context fields */}
          <input type="hidden" name="helperID" value={MOCK_HELPER.id} />
          <input type="hidden" name="servicetype" value={MOCK_SERVICE} />
          <input type="hidden" name="price" value={MOCK_PRICE} />

          {/* Name */}
          <label htmlFor="customerName">Your Name:</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            className="input-field"
            value={formData.customerName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />

          {/* Date */}
          <label htmlFor="date">Select Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            className="input-field"
            value={formData.date}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />

          {/* Time */}
          <label htmlFor="time">Select Time:</label>
          <input
            type="time"
            id="time"
            name="time"
            className="input-field"
            value={formData.time}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />

          {/* Address */}
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            className="input-field"
            rows="4"
            value={formData.address}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          ></textarea>

          {/* Submit */}
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Confirming..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
