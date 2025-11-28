import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />

      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Professional Help — Anytime.</h1>
          <p>
            From spotless cleaning to skilled repairs — expert support for every
            task, big or small. Because a little help goes a long way.
          </p>
          <a href="/search" className="cta-button">
            Book Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
