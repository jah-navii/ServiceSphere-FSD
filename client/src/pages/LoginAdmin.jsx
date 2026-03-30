import React from "react";
// Note: Adjust the import path depending on where you saved the component
import LoginForm from "../components/LoginForm/LoginForm";

const LoginAdmin = () => {
  return (
    <LoginForm
      title="Welcome Back, Administrator!"
      apiEndpoint="/api/auth/login/admin"
      signupPath="/signup/admin"
      redirectPath="/administrator/dashboard"
    />
  );
};

export default LoginAdmin;