import React from "react";
import { Link } from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  return (
    <div className="login-body">
      <h1 className="login-title">Login As</h1>
      <div className="login-buttons">
        <Link to="/login/helper">
          <button className="login-btn helper">Helper</button>
        </Link>
        <Link to="/login/seeker">
          <button className="login-btn seeker">Seeker</button>
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
