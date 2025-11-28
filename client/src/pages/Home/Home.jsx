import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./Home.module.css";
// Import Hero Image
import heroBg from "../../assets/hero.jpg"; 

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <Navbar />

      {/* Pass the background image via inline style so React handles the path */}
      <section 
        className={styles.hero} 
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className={styles.heroContent}>
          <h1>Professional Help - anytime.</h1>
          <p>
            From spotless cleaning to skilled repairs, expert support for every task, 
            big or small. Because a little help goes a long way.
          </p>
          <Link to="/search" className={styles.ctaButton}>
            Book Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;