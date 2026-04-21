import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignupSeeker from "./pages/SignupSeeker/SignupSeeker";
import SignupHelper from "./pages/SignupHelper/SignupHelper";
import SelectionPage from "./components/SelectionPage/SelectionPage";
import LoginForm from "./components/LoginForm/LoginForm";
import ApplyModerator from "./pages/ApplyModerator/ApplyModerator";
import LoginModerator from "./pages/LoginModerator/LoginModerator";

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
import SeekerProfile from "./pages/SeekerProfile/SeekerProfile";
import PreviousBookings from "./pages/PreviousBookings/PreviousBookings";

import AboutUs from "./pages/AboutUs/AboutUs";

import AdministratorLayout from "./components/AdministratorDashboard/AdministratorLayout";
import AdministratorHome from "./components/AdministratorDashboard/AdministratorHome";
import AdministratorUsers from "./components/AdministratorDashboard/AdministratorUsers";
import AdministratorBookings from "./components/AdministratorDashboard/AdministratorBookings";
import AdministratorServices from "./components/AdministratorDashboard/AdministratorServices";
import AdministratorLocations from "./components/AdministratorDashboard/AdministratorLocations";
import AdministratorFeedbacks from "./components/AdministratorDashboard/AdministratorFeedbacks";

import ModeratorLayout from "./components/ModeratorDashboard/ModeratorLayout";
import ModeratorHome from "./components/ModeratorDashboard/ModeratorHome";
import ModeratorHelpers from "./components/ModeratorDashboard/ModeratorHelpers";
import ModeratorBookings from "./components/ModeratorDashboard/ModeratorBookings";
import ModeratorUsers from "./components/ModeratorDashboard/ModeratorUsers";
import ModeratorProfile from "./components/ModeratorDashboard/ModeratorProfile";
import ModeratorEarnings from "./components/ModeratorDashboard/ModeratorEarnings";
import ModeratorFeedback from "./components/ModeratorDashboard/ModeratorFeedback";

import AdminContact from "./pages/AdminContact/AdminContact";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/signup" element={<SelectionPage title="Sign Up as" helperPath="/signup/helper" seekerPath="/signup/seeker" />} />
        <Route path="/login" element={<SelectionPage title="Login As" helperPath="/login/helper" seekerPath="/login/seeker" />} />
        <Route path="/signup/seeker" element={<SignupSeeker />} />
        <Route path="/signup/helper" element={<SignupHelper />} />
        <Route path="/login/seeker" element={<LoginForm title="Login as a Seeker" apiEndpoint="/api/auth/login/seeker" signupPath="/signup/seeker" redirectPath="/home" />} />
        <Route path="/login/helper" element={<LoginForm title="Welcome Back, Helper!" apiEndpoint="/api/auth/login/helper" signupPath="/signup/helper" redirectPath="/helper/dashboard" />} />
        <Route path="/login/administrator" element={<LoginForm title="Welcome Back, Administrator!" apiEndpoint="/api/auth/login/administrator" signupPath="/signup/administrator" redirectPath="/administrator/dashboard" />} />
        <Route path="/login/moderator" element={<LoginModerator />} />
        <Route path="/apply/moderator" element={<ApplyModerator />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/AdminContact" element={<AdminContact />} />
        <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
        
        {/* Public Home Route */}
        <Route path="/home" element={<Home />} />
        <Route path="/search" element={
          <ProtectedRoute redirectTo="/login/seeker" allowedRoles={['seeker']}>
            <SearchPage />
          </ProtectedRoute>
        } />
        <Route path="/booking" element={
          <ProtectedRoute redirectTo="/login/seeker" allowedRoles={['seeker']}>
            <BookingForm />
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute redirectTo="/login/seeker" allowedRoles={['seeker']}>
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path="/previous-bookings" element={
          <ProtectedRoute redirectTo="/login/seeker" allowedRoles={['seeker']}>
            <PreviousBookings />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute redirectTo="/login/seeker" allowedRoles={['seeker']}>
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path='/seeker-profile' element={
          <ProtectedRoute redirectTo="/login/seeker" allowedRoles={['seeker']}>
            <SeekerProfile />
          </ProtectedRoute>
        } />

        {/* Helper Protected Routes */}
        <Route path="/helper" element={
          <ProtectedRoute redirectTo="/login/helper" allowedRoles={['helper']}>
            <HelperDashboard />
          </ProtectedRoute>
        }>
          <Route index element={<RequestsPage />} />
          <Route path="dashboard" element={<RequestsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
        </Route>

        {/* Administrator Protected Routes */}
        <Route path="/administrator" element={
          <ProtectedRoute redirectTo="/login/administrator" requireAdministrator={true}>
            <AdministratorLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdministratorHome />} />
          <Route path="users" element={<AdministratorUsers />} />
          <Route path="bookings" element={<AdministratorBookings />} />
          <Route path="services" element={<AdministratorServices />} />
          <Route path="locations" element={<AdministratorLocations />} />
          <Route path="feedbacks" element={<AdministratorFeedbacks />} />
        </Route>

        {/* Moderator Protected Routes */}
        <Route path="/moderator" element={
          <ProtectedRoute redirectTo="/login/moderator" requireModerator={true}>
            <ModeratorLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ModeratorHome />} />
          <Route path="helpers" element={<ModeratorHelpers />} />
          <Route path="users" element={<ModeratorUsers />} />
          <Route path="bookings" element={<ModeratorBookings />} />
          <Route path="earnings" element={<ModeratorEarnings />} />
          <Route path="profile" element={<ModeratorProfile />} />
          <Route path="feedback" element={<ModeratorFeedback />} />
        </Route>

        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
