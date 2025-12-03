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
import SearchPage from "./pages/SearchPage/SearchPage";

import HelperDashboard from "./components/HelperDashboard/HelperDashboard";
import ProfilePage from "./components/HelperDashboard/ProfilePage";
import RequestsPage from "./components/HelperDashboard/RequestsPage";
import SchedulePage from "./components/HelperDashboard/SchedulePage";
import EarningsPage from "./components/HelperDashboard/EarningsPage";
import FeedbackPage from "./components/HelperDashboard/FeedbackPage";

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
        <Route path="/search" element={<SearchPage />} />

        <Route path="/helper" element={<HelperDashboard />}>
          {/* Index Route: This loads by default when navigating to /helper */}
          {/* We default to the Requests page, as per the usual dashboard pattern */}
          <Route index element={<RequestsPage />} />

          {/* Child Routes: These load into the <Outlet /> inside HelperDashboard */}
          {/* Dashboard alias route so /helper/dashboard works (maps to RequestsPage) */}
          <Route path="dashboard" element={<RequestsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
