import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Professional Help - Anytime.</h1>
          <p className="hero-description">
            From spotless cleaning to skilled repairs, expert support for every task, 
            big or small. Because a little help goes a long way.
          </p>
          <Link to="/search" className="cta-button">
            Book Now
          </Link>
          
          <div className="service-highlight">
            <span className="service-tag">Cleaning</span>
            <span className="service-tag">Repairs</span>
            <span className="service-tag">Expert Support</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;