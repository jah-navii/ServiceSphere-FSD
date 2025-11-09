import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header/Header/Header';
import HeroSection from './components/HeroSection/HeroSection';
import BrowseRange from './components/BrowseRange/BrowseRange';
import ProductsSection from './components/ProductsSection/ProductsSection';
// import LandingPage from "./pages/LandingPage";
// import SignupPage from "./pages/SignupPage";
// import LoginPage from "./pages/LoginPage";
// import SignupSeeker from "./pages/SignupSeeker";
// import SignupHelper from "./pages/SignupHelper";
// import LoginSeeker from "./pages/LoginSeeker";
// import LoginHelper from "./pages/LoginHelper";
// import LoginAdmin from "./pages/LoginAdmin";
// import Home from "./pages/Home";
function App() {
  return (
    // <Router>
    //   <Routes>
    //     <Route path="/" element={<LandingPage />} />
    //     <Route path="/signup" element={<SignupPage />} />
    //     <Route path="/login" element={<LoginPage />} />
    //     <Route path="/signup/seeker" element={<SignupSeeker />} />
    //     <Route path="/signup/helper" element={<SignupHelper />} />
    //     <Route path="/login/seeker" element={<LoginSeeker />} />
    //     <Route path="/login/helper" element={<LoginHelper />} />
    //     <Route path="/login/admin" element={<LoginAdmin />} />
    //     <Route path="/home" element={<Home />} />
    //     </Routes>
    // </Router>
    <ThemeProvider>
      <div className="App">
        <Header />
        <HeroSection />
        <BrowseRange />
        <ProductsSection />
      </div>
    </ThemeProvider>
  );
}

export default App;
