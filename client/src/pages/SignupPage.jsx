import React from "react";
import SelectionPage from "../components/SelectionPage/SelectionPage";

const SignupPage = () => {
  return (
    <SelectionPage 
      title="Sign Up as" 
      helperPath="/signup/helper" 
      seekerPath="/signup/seeker" 
    />
  );
};

export default SignupPage;