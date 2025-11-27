import React, { useState, useEffect } from "react";
import styles from "./SignupSeeker.module.css";

const SignupSeeker = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobilenumber: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [error, setError] = useState("");

  // Load dotlottie-player via CDN
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/signup/seeker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
         setError(data.error || "Signup failed");
         return;
      }
      
      alert("Seeker registered successfully!");
      // Ideally navigate to login here: navigate('/login/seeker');
      
      setFormData({
        name: "",
        email: "",
        mobilenumber: "",
        password: "",
        confirmPassword: "",
        address: "",
      });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Lottie Background Animation Container */}
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
        <h1 className={styles.title}>Join ServiceSphere as a Seeker</h1>

        {error && <div className={styles.errorText}>{error}</div>}

        <form onSubmit={handleSubmit}>
          
          {/* Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <input
              className={styles.input}
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Mobile */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Mobile Number</label>
            <input
              className={styles.input}
              type="tel"
              name="mobilenumber"
              placeholder="Enter your Mobile Number"
              value={formData.mobilenumber}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input
              className={styles.input}
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Address */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Address</label>
            <textarea
              className={styles.textarea}
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={styles.submitButton}>Register</button>
        </form>

        <p className={styles.loginText}>
          Already a seeker?{" "}
          <a href="/login/seeker" className={styles.link}>
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupSeeker;