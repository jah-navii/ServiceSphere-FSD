import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";

const LoginHelper = () => {
  return (
    <LoginForm 
      title="Welcome Back, Helper!" 
      apiEndpoint="/login/helper" 
      signupPath="/signup/helper"
      redirectPath="/helper/dashboard" /* Change this to where helpers go */
    />
  );
};

export default LoginHelper;