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
// import BookingForm from "./pages/BookingForm/BookingForm";
import CartPage from "./pages/CartPage/CartPage";
// import PaymentForm from "./pages/PaymentForm";
import ReviewForm from "./pages/ReviewForm";
import SeekerProfile from "./pages/SeekerProfile/SeekerProfile";

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
        {/* <Route path="/booking" element={<BookingForm />} /> */}
        <Route path="/cart" element={<CartPage />} />
        <Route path='/seeker-profile' element={<SeekerProfile />} />
      </Routes>
    </Router>
    // <BookingForm /> 
    // <CartPage/>
    // <PaymentForm />
    // <ReviewForm />


    
);
}

export default App;
