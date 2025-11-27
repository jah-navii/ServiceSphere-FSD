import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// IMPORT STYLES AS AN OBJECT
import styles from "./SignupHelper.module.css"; 

const SignupHelper = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    mobilenumber: "",
    aadharnumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load Animation Script
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
      const response = await fetch("http://localhost:5000/signup/helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // Parse server response

      if (!response.ok) {
        setError(data.error || "Signup failed. Please try again.");
        console.error("Server error details:", data);
        return;
      }

      // If successful
      navigate("/login/helper");
    } catch (err) {
      console.error("Network error:", err);
      setError("Registration failed. Please try again later.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Animation */}
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

      {/* Form */}
      <div className={styles.formCard}>
        <h1 className={styles.title}>Join ServiceSphere as a Helper</h1>

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

          {/* Gender */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Gender</label>
            <div className={styles.radioGroup}>
              <input
                type="radio"
                id="male"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
              />
              <label htmlFor="male" className={styles.radioLabel}>Male</label>

              <input
                type="radio"
                id="female"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
              />
              <label htmlFor="female" className={styles.radioLabel}>Female</label>
            </div>
          </div>

          {/* Mobile */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Mobile Number</label>
            <input className={styles.input} type="tel" name="mobilenumber" placeholder="Mobile Number" value={formData.mobilenumber} onChange={handleChange} required />
          </div>

          {/* Aadhar */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Aadhar Number</label>
            <input className={styles.input} type="number" name="aadharnumber" placeholder="Aadhar Number" value={formData.aadharnumber} onChange={handleChange} required />
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input className={styles.input} type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" className={styles.submitButton}>Register</button>
        </form>

        <p style={{textAlign: 'center', marginTop: '15px'}}>
          Already a helper? <a href="/login/helper" className={styles.link}>Login here</a>
        </p>
      </div>
    </div>
  );
};

export default SignupHelper;