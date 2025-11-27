import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-text">
          <div className="new-badge">New Arrival</div>
          <h1>Discover Our New Collection</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis.</p>
          <button className="btn-primary">BUY NOW</button>
        </div>
        <div className="hero-image">
          <img src="https://via.placeholder.com/600x500/333/fff?text=Interior" alt="Modern interior" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;