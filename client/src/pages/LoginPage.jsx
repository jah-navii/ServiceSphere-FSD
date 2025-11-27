import React from "react";
import SelectionPage from "../components/SelectionPage/SelectionPage";

const LoginPage = () => {
  return (
    <SelectionPage 
      title="Login As" 
      helperPath="/login/helper" 
      seekerPath="/login/seeker" 
    />
  );
};

export default LoginPage;