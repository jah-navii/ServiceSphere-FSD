import React, { useState, useEffect } from "react";
import "./SignupHelper.css";

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

  // Load dotlottie-player via CDN
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
    document.body.appendChild(script);
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
      const response = await fetch("/signup/helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Signup failed");
      alert("Helper registered successfully!");
      setFormData({
        name: "",
        gender: "",
        mobilenumber: "",
        aadharnumber: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setError("");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="signup-helper-container">
      <dotlottie-player
        class="bg-animation"
        src="https://lottie.host/97ea0de2-8839-4b2e-92ce-455e8731f33c/WSoZpRrAis.lottie"
        background="transparent"
        speed="1"
        style={{ width: "700px", height: "700px", marginTop: "100px" }}
        loop
        autoplay
      ></dotlottie-player>

      <div className="registration-container">
        <h1>Join ServiceSphere as a Helper</h1>

        {error && <div className="error-message">{error}</div>}

        <form id="helper-registration-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <div className="radio-group">
              <input
                type="radio"
                id="male"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
              />
              <label htmlFor="male">Male</label>

              <input
                type="radio"
                id="female"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
              />
              <label htmlFor="female">Female</label>
            </div>
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobilenumber"
              placeholder="Enter your Mobile Number"
              value={formData.mobilenumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Aadhar Number</label>
            <input
              type="number"
              name="aadharnumber"
              placeholder="Enter your Aadhar Number"
              value={formData.aadharnumber}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <button type="submit">Register</button>
          </div>
        </form>

        <p>
          Already a helper?{" "}
          <a href="/login/helper" className="login-link">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupHelper;
