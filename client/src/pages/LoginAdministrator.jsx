import React from "react";
import LoginForm from "../components/LoginForm/LoginForm";

const LoginAdministrator = () => {
  return (
    <LoginForm
      title="Welcome Back, Administrator!"
      apiEndpoint="/api/auth/login/administrator"
      signupPath="/signup/administrator"
      redirectPath="/administrator/dashboard"
    />
  );
};

export default LoginAdministrator;
