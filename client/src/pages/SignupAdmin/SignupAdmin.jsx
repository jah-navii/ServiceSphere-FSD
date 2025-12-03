import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignupAdmin.module.css"; // Uses the same styles as Seeker/Helper

const SignupAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // Load Animation
  useEffect(() => {
    if (!document.querySelector('script[src*="dotlottie-player"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      alert("Admin registered successfully!");
      navigate("/login/admin");
      
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.animationWrapper}>
        <dotlottie-player
          src="https://lottie.host/97ea0de2-8839-4b2e-92ce-455e8731f33c/WSoZpRrAis.lottie"
          background="transparent"
          speed="1"
          style={{ width: "100%", height: "100%" }}
          loop
          autoplay
        ></dotlottie-player>
      </div>

      <div className={styles.formCard}>
        <h1 className={styles.title}>Register as Admin</h1>

        {error && <div className={styles.errorText}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
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
            <label className={styles.label}>Email Address</label>
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
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              className={styles.input}
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
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

          <button type="submit" className={styles.submitButton}>Register</button>
        </form>

        <p className={styles.loginText}>
          Already an admin? <a href="/login/admin" className={styles.link}>Login here</a>
        </p>
      </div>
    </div>
  );
};

export default SignupAdmin;