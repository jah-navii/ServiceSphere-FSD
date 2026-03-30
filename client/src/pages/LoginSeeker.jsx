import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";

const LoginSeeker = () => {
  return (
    <LoginForm 
      title="Login as a Seeker" 
      apiEndpoint="/api/auth/login/seeker"
      signupPath="/signup/seeker"
      redirectPath="/home" /* Change this to where seekers go */
    />
  );
};

export default LoginSeeker;