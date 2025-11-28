import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SignupSeeker from "./pages/SignupSeeker/SignupSeeker";
import SignupHelper from "./pages/SignupHelper/SignupHelper";
import LoginSeeker from "./pages/LoginSeeker";
import LoginHelper from "./pages/LoginHelper";
import LoginAdmin from "./pages/LoginAdmin";
import Home from "./pages/Home/Home";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup/seeker" element={<SignupSeeker />} />
        <Route path="/signup/helper" element={<SignupHelper />} />
        <Route path="/login/seeker" element={<LoginSeeker />} />
        <Route path="/login/helper" element={<LoginHelper />} />
        <Route path="/login/admin" element={<LoginAdmin />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
