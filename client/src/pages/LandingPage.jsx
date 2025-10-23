import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"
import logo from "../assets/logo.png"

const LandingPage = () => {
  return (
    <div className="landing-body">
      <div className="logo">
        {/* Update image path later based on how you serve assets */}
        <img src={logo} alt="ServiceSphere Logo" />
      </div>
      <div className="tag">Your Orbit to Assistance</div>
      <div className="buttons">
        <Link to="/login">
          <button className="login">Login</button>
        </Link>
        <Link to="/signup">
          <button className="signup">Sign Up</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
