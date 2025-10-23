import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginHelper.css";

const LoginHelper = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Dynamically load Lottie player
  useEffect(() => {
    if (window.customElements.get("dotlottie-player")) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
    document.body.appendChild(script);

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/login/helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Login successful!");
        navigate("/helper/dashboard"); // redirect after success
      } else {
        setError(result.error || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="login-helper-page">
      {/* Background animation */}
      <dotlottie-player
        className="bg-animation"
        src="https://lottie.host/97ea0de2-8839-4b2e-92ce-455e8731f33c/WSoZpRrAis.lottie"
        background="transparent"
        speed="1"
        loop
        autoplay
      ></dotlottie-player>

      {/* Login Form */}
      <div className="login-container">
        <h1>Welcome Back, Helper!</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="signup-text">
          Don’t have an account?{" "}
          <a href="/signup/helper" className="signup-link">
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginHelper;
