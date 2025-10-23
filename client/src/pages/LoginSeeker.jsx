import React, { useState, useEffect } from "react";
import "./LoginSeeker.css";

const LoginSeeker = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Load Lottie animation dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
    document.body.appendChild(script);
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/login/seeker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Invalid credentials");
      alert("Login successful!");
      setFormData({ email: "", password: "" });
      setError("");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="login-seeker-container">
      <dotlottie-player
        class="bg-animation"
        src="https://lottie.host/97ea0de2-8839-4b2e-92ce-455e8731f33c/WSoZpRrAis.lottie"
        background="transparent"
        speed="1"
        style={{ width: "700px", height: "700px", marginTop: "100px" }}
        loop
        autoplay
      ></dotlottie-player>

      <div className="login-box">
        <h1>Login as a Seeker</h1>

        {error && <div className="error-message">{error}</div>}

        <form id="seeker-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <button type="submit">Login</button>
          </div>
        </form>

        <p>
          Don’t have an account?{" "}
          <a href="/signup/seeker" className="signup-link">
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginSeeker;
