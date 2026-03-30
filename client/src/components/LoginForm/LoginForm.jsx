import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../../redux/userSlice";
import styles from "./LoginForm.module.css";

const LoginForm = ({ title, apiEndpoint, signupPath, redirectPath }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error } = useSelector((state) => state.user);

  // Load Lottie Script
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

    dispatch(loginStart());

    try {
      const response = await fetch(`http://localhost:5000${apiEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        dispatch(loginFailure(data.message || data.error || "Login failed"));
        return;
      }

      // Success! Store JWT token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      dispatch(loginSuccess(data.user));
      navigate(redirectPath || "/home"); // Default to home if no path given
      
    } catch (err) {
      console.error(err);
      dispatch(loginFailure("Network error. Please try again later"));
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
        <h1 className={styles.title}>{title}</h1>

        {error && <div className={styles.errorText}>{typeof error === 'string' ? error : error.message || 'Login failed'}</div>}

        <form onSubmit={handleSubmit}>
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

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <button type="submit" className={styles.submitButton}>
              Login
            </button>
          </div>
        </form>

        <p className={styles.signupText}>
          Don't have an account?{" "}
          <a href={signupPath} className={styles.link}>
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;