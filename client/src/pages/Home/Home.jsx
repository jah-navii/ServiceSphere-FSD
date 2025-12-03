import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./Home.module.css";
import heroBg from "../../assets/hero.jpg";

// Local images for carousel offers
import christmasOffer from "../../assets/christmas-offer.png";
import newYearOffer from "../../assets/newyear-offer.jpeg";
import weekendOffer from "../../assets/weekend-offer.png";

// Local images for service cards
import spaService from "../../assets/spa-service.png";
import cleaningService from "../../assets/cleaning-service.png";
import electricianService from "../../assets/electrician-service.png";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Christmas Home Care Sale",
      text: "Get your home guest-ready with up to 30% off on cleaning, spa, and repair services.",
      badge: "Christmas Offer",
      image: christmasOffer,
    },
    {
      id: 2,
      title: "New Year, New Space",
      text: "Start the year fresh with deep cleaning and home makeover services at special prices.",
      badge: "New Year Offer",
      image: newYearOffer,
    },
    {
      id: 3,
      title: "Weekend Flash Deals",
      text: "Exclusive weekend discounts on spa, cleaning, and electrical repairs near you.",
      badge: "Limited Time",
      image: weekendOffer,
    },
  ];

  useEffect(() => {
    // 2 seconds per slide
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2000);

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
          {/* Large carousel with offer images */}
          <div className={styles.adCarousel}>
            <div className={styles.adImageWrapper}>
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className={styles.adImage}
              />
              <div className={styles.adImageOverlay}></div>
            </div>

            <div key={slides[currentSlide].id} className={styles.adContent}>
              <span className={styles.adBadge}>
                {slides[currentSlide].badge}
              </span>
              <div className={styles.adTextBlock}>
                <h3>{slides[currentSlide].title}</h3>
                <p>{slides[currentSlide].text}</p>
              </div>
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

          {/* Main hero content (no Book button here) */}
          <div className={styles.heroContent}>
            <h1>Professional Help - anytime.</h1>
            <p>
              From spotless cleaning to skilled repairs, get expert support for
              every task, big or small. Because a little help goes a long way.
            </p>
          </div>

          {/* Service cards with images and Book buttons */}
          <div className={styles.serviceCards}>
            <div className={`${styles.serviceCard} ${styles.card1}`}>
              <div className={styles.cardMedia}>
                <img
                  src={spaService}
                  alt="Home spa and wellness"
                  className={styles.cardImage}
                />
                <div className={styles.cardImageOverlay}></div>
              </div>
              <div className={styles.cardBody}>
                <h3>Home Spa & Relaxation</h3>
                <p>
                  Unwind with professional spa and massage services in the
                  comfort of your home.
                </p>
                <Link to="/search" className={styles.cardButton}>
                  Book Now
                </Link>
              </div>
            </div>

            <div className={`${styles.serviceCard} ${styles.card2}`}>
              <div className={styles.cardMedia}>
                <img
                  src={cleaningService}
                  alt="Home cleaning service"
                  className={styles.cardImage}
                />
                <div className={styles.cardImageOverlay}></div>
              </div>
              <div className={styles.cardBody}>
                <h3>Cleaning Assist</h3>
                <p>
                  From daily upkeep to deep cleaning, keep every room fresh and
                  sparkling.
                </p>
                <Link to="/search" className={styles.cardButton}>
                  Book Now
                </Link>
              </div>
            </div>

            <div className={`${styles.serviceCard} ${styles.card3}`}>
              <div className={styles.cardMedia}>
                <img
                  src={electricianService}
                  alt="Electrical repair service"
                  className={styles.cardImage}
                />
                <div className={styles.cardImageOverlay}></div>
              </div>
              <div className={styles.cardBody}>
                <h3>Repairs Assist</h3>
                <p>
                  Certified electricians for safe installations, quick fixes,
                  and smart home setups.
                </p>
                <Link to="/search" className={styles.cardButton}>
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
