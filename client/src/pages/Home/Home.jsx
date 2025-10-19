import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./Home.module.css";
import heroBg from "../../assets/hero.jpg";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Festive Cleaning Offers",
      text: "Get up to 25% off on deep home cleaning this season.",
      badge: "Limited Time",
    },
    {
      id: 2,
      title: "Relax at Home",
      text: "On-demand spa & wellness services right at your doorstep.",
      badge: "New",
    },
    {
      id: 3,
      title: "Instant Electrician Help",
      text: "Certified electricians for safe and reliable repairs.",
      badge: "Top Rated",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className={styles.homeContainer}>
      <Navbar />

      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className={styles.heroInner}>
          {/* Top carousel strip */}
          <div className={styles.adCarousel}>
            <div key={slides[currentSlide].id} className={styles.adContent}>
              <span className={styles.adBadge}>{slides[currentSlide].badge}</span>
              <div className={styles.adTextBlock}>
                <h3>{slides[currentSlide].title}</h3>
                <p>{slides[currentSlide].text}</p>
              </div>
            </div>

            <div className={styles.adDots}>
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  className={`${styles.adDot} ${
                    index === currentSlide ? styles.adDotActive : ""
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Main hero box (moved a bit upwards, no main Book button) */}
          <div className={styles.heroContent}>
            <h1>Professional Help - anytime.</h1>
            <p>
              From spotless cleaning to skilled repairs, get expert support for
              every task, big or small. Because a little help goes a long way.
            </p>
          </div>

          {/* Service cards row */}
          <div className={styles.serviceCards}>
            <div className={`${styles.serviceCard} ${styles.card1}`}>
              <div className={styles.cardIcon}>💆‍♀️</div>
              <h3>Home Spa & Relaxation</h3>
              <p>
                Unwind with professional spa and massage services without
                leaving your home.
              </p>
              <Link to="/search" className={styles.cardButton}>
                Book Now
              </Link>
            </div>

            <div className={`${styles.serviceCard} ${styles.card2}`}>
              <div className={styles.cardIcon}>🧹</div>
              <h3>Home Cleaning</h3>
              <p>
                From daily tidying to deep cleaning, keep every corner spotless
                and fresh.
              </p>
              <Link to="/search" className={styles.cardButton}>
                Book Now
              </Link>
            </div>

            <div className={`${styles.serviceCard} ${styles.card3}`}>
              <div className={styles.cardIcon}>🔌</div>
              <h3>Electrical Repairs</h3>
              <p>
                Certified electricians for safe installations and quick
                troubleshooting.
              </p>
              <Link to="/search" className={styles.cardButton}>
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
