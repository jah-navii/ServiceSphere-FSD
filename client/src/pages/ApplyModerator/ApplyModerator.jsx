import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ApplyModerator.module.css";

const ApplyModerator = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    desiredLocation: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/locations");
      const data = await response.json();
      setLocations(data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.desiredLocation) {
      setError("All fields are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/auth/apply/moderator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Application failed");
        return;
      }

      setSuccess(data.message || "Application submitted successfully!");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        desiredLocation: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1>Apply to Become a Moderator</h1>
          <p className={styles.subtitle}>
            Join our team and help manage your local service community
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              className={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address *</label>
            <input
              type="email"
              name="email"
              className={styles.input}
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              className={styles.input}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Desired Location *</label>
            <select
              name="desiredLocation"
              className={styles.select}
              value={formData.desiredLocation}
              onChange={handleChange}
              required
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location._id} value={location._id}>
                  {location.name}
                  {location.city && `, ${location.city}`}
                  {location.state && `, ${location.state}`}
                </option>
              ))}
            </select>
            <small className={styles.hint}>
              You will be responsible for managing this location
            </small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              className={styles.input}
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              className={styles.input}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account?{" "}
            <a href="/login/moderator" className={styles.link}>
              Login here
            </a>
          </p>
          <p>
            <a href="/" className={styles.link}>
              Back to Home
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplyModerator;
