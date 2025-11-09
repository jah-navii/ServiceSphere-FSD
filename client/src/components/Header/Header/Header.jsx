import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import logo from '../../../assets/logo.png';
import './Header.css';

// Icons (using Heroicons style – replace with actual SVGs if needed)
const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Header = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="container header-content">
        {/* Left: Logo + Nav */}
        <div className="left-section">
          <div className="logo">
            <img src={logo} alt="Service Sphere Logo" />
            <div className="logo-text">
              <span>Service</span>
              <span>Sphere</span>
            </div>
          </div>
          <nav className="nav">
            <ul>
              <li><a href="/" className="active">Home</a></li>
              <li><a href="/shop">Shop</a></li>
            </ul>
          </nav>
        </div>

        {/* Right: Icons + Theme Toggle */}
        <div className="right-section">
          <button className="icon-btn"><SearchIcon /></button>
          <button className="icon-btn"><ProfileIcon /></button>
          <button className="icon-btn"><CartIcon /></button>
          <button onClick={toggleTheme} className="theme-toggle">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;