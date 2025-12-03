import React from "react";
// Note: Adjust the import path depending on where you saved the component
import LoginForm from "../components/LoginForm/LoginForm";

const LoginAdmin = () => {
  return (
    <LoginForm
      title="Welcome Back, Admin!"
      apiEndpoint="/login/admin"      // Points to the Admin API we just updated
      signupPath="/signup/admin"      // Points to the Admin Signup page
      redirectPath="/admin/dashboard" // Redirects to the Admin Dashboard on success
    />
  );
};

export default LoginAdmin;