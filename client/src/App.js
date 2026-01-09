import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import SignupSeeker from "./pages/SignupSeeker/SignupSeeker";
import SignupHelper from "./pages/SignupHelper/SignupHelper";
import SignupAdmin from "./pages/SignupAdmin/SignupAdmin";
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

import BookingForm from "./pages/BookingForm/BookingForm";
import CartPage from "./pages/CartPage/CartPage";
import PaymentPage from "./pages/PaymentPage/PaymentPage";
import ReviewForm from "./pages/ReviewForm";
import SeekerProfile from "./pages/SeekerProfile/SeekerProfile";

import AboutUs from "./pages/AboutUs/AboutUs";

import AdminLayout from "./components/AdminDashboard/AdminLayout";
import DashboardHome from "./components/AdminDashboard/DashboardHome";
import ManageUsers from "./components/AdminDashboard/ManageUsers";
import ManageServices from "./components/AdminDashboard/ManageServices";
import AdminEarnings from "./components/AdminDashboard/AdminEarnings";
import ManageLocations from "./components/AdminDashboard/ManageLocations";

import AdminContact from "./pages/AdminContact/AdminContact";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions";
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
          <Route index element={<RequestsPage />} />

          <Route path="dashboard" element={<RequestsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>

        <Route path="/booking" element={<BookingForm />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path='/seeker-profile' element={<SeekerProfile />} />

        <Route path="/login/admin" element={<LoginAdmin />} />
        <Route path="/signup/admin" element={<SignupAdmin />} />
        <Route path="/about" element={<AboutUs />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="earnings" element={<AdminEarnings />} />
          <Route path="locations" element={<ManageLocations />} />
        </Route>


        <Route path="/AdminContact" element={<AdminContact />} />
        <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
      </Routes>
    </Router>
  );
}

export default App;
