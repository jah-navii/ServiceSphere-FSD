import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./Home.module.css";
import heroBg from "../../assets/hero.jpg";

import spaService from "../../assets/spa-service.png";
import cleaningService from "../../assets/cleaning-service.png";
import electricianService from "../../assets/electrician-service.png";

const STATS = [
  { value: "500+", label: "Verified Helpers" },
  { value: "20+", label: "Service Categories" },
  { value: "10,000+", label: "Bookings Completed" },
  { value: "4.8★", label: "Average Rating" },
];

const FEATURES = [
  {
    icon: "✓",
    title: "Verified Professionals",
    desc: "Every helper is background-checked and skill-verified before joining the platform.",
  },
  {
    icon: "⚡",
    title: "Book in Minutes",
    desc: "Browse, compare, and book a service in under three minutes — no calls needed.",
  },
  {
    icon: "🔒",
    title: "Secure Payments",
    desc: "Your payment is held safely and only released once the job is done to your satisfaction.",
  },
  {
    icon: "★",
    title: "Rated & Reviewed",
    desc: "Honest reviews from real customers help you pick the right helper every time.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Search a Service", desc: "Browse categories or search by keyword to find exactly what you need." },
  { step: "02", title: "Pick a Helper", desc: "Compare profiles, ratings, and pricing to choose the best fit." },
  { step: "03", title: "Sit Back & Relax", desc: "Book, pay securely, and let your helper take care of the rest." },
];

const Home = () => {
  const [categories, setCategories] = useState([]);
  const { isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/services/categories");
        const data = await res.json();
        if (data.categories) setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const getCategoryImage = (name) => {
    const n = name.toLowerCase();
    if (n.includes("repair") || n.includes("maintenance") || n.includes("electric")) return electricianService;
    if (n.includes("care") || n.includes("spa") || n.includes("beauty")) return spaService;
    return cleaningService;
  };

  const handleCategoryClick = (catId) => {
    if (isAuthenticated) {
      navigate(`/search?category=${catId}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className={styles.homeContainer}>
      <Navbar />

      {/* ── HERO ── */}
      <section className={styles.hero} style={{ backgroundImage: `url(${heroBg})` }}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Trusted Home Services Platform</span>
          <h1>Professional Help,<br />Whenever You Need It.</h1>
          <p>From spotless cleaning to skilled repairs — find verified experts for every task, right at your doorstep.</p>
          <div className={styles.heroCtas}>
            <Link to="/search" className={styles.ctaPrimary}>Browse Services</Link>
            {!isAuthenticated && (
              <Link to="/signup" className={styles.ctaSecondary}>Get Started Free</Link>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className={styles.statsStrip}>
        {STATS.map((s) => (
          <div className={styles.statItem} key={s.label}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>How It Works</h2>
          <p>Three simple steps to get any job done.</p>
        </div>
        <div className={styles.stepsGrid}>
          {HOW_IT_WORKS.map((item) => (
            <div className={styles.stepCard} key={item.step}>
              <span className={styles.stepNumber}>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className={`${styles.section} ${styles.sectionGray}`}>
        <div className={styles.sectionHeader}>
          <h2>Browse by Category</h2>
          <p>Whatever you need, we have a professional ready for it.</p>
        </div>
        <div className={styles.cardsGrid}>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div className={styles.card} key={cat._id}>
                <div className={styles.cardImageWrap}>
                  <img src={getCategoryImage(cat.name)} alt={cat.name} className={styles.cardImage} />
                </div>
                <div className={styles.cardBody}>
                  <h3>{cat.name}</h3>
                  <p>{cat.description || "Expert professionals ready to help."}</p>
                  <button
                    className={styles.cardButton}
                    onClick={() => handleCategoryClick(cat._id)}
                  >
                    View Services
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.loadingText}>Loading categories…</p>
          )}
        </div>
      </section>

      {/* ── WHY SERVICESPHERE ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Why ServiceSphere?</h2>
          <p>Built around trust, speed, and simplicity.</p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div className={styles.featureCard} key={f.title}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      {!isAuthenticated && (
        <section className={styles.ctaBanner}>
          <h2>Ready to get started?</h2>
          <p>Join thousands of happy customers who trust ServiceSphere every day.</p>
          <div className={styles.bannerCtas}>
            <Link to="/signup" className={styles.ctaPrimary}>Create an Account</Link>
            <Link to="/login" className={styles.ctaOutline}>Log In</Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;