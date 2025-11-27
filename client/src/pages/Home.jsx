<<<<<<< HEAD
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
=======
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./Home.css";
>>>>>>> a897fd21bb3d04360a6fbae44be0ba097e95140d

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
