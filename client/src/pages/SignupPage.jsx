import React from "react";
import { Link } from "react-router-dom";
import "./SignupPage.css";

const SignupPage = () => {
  return (
    <div className="signup-body">
      <h1 className="signup-title">Sign Up as</h1>
      <div className="signup-buttons">
        <Link to="/signup/helper">
          <button className="signup-btn helper">Helper</button>
        </Link>
        <Link to="/signup/seeker">
          <button className="signup-btn seeker">Seeker</button>
        </Link>
      </div>
    </div>
  );
};

export default SignupPage;
