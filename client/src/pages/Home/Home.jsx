import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./Home.module.css";
import heroBg from "../../assets/hero.jpg";

// Images
import spaService from "../../assets/spa-service.png";
import cleaningService from "../../assets/cleaning-service.png";
import electricianService from "../../assets/electrician-service.png";

const Home = () => {
  const [categories, setCategories] = useState([]);

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // We reuse the admin endpoint that returns { categories: [...] }
        const res = await fetch("http://localhost:5000/api/services/categories");
        const data = await res.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Helper to pick an image based on category name
  const getCategoryImage = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("repair") || lowerName.includes("maintenance")) return electricianService;
    if (lowerName.includes("care") || lowerName.includes("spa")) return spaService;
    return cleaningService; // Default
  };

  return (
    <div className={styles.homeContainer}>
      <Navbar />

      <section
        className={styles.hero}
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className={styles.heroContent}>
          <h1>Professional Help, Anytime.</h1>
          <p>From spotless cleaning to skilled repairs, find expert support for every task.</p>
          {/* Main CTA goes to general search */}
          <Link to="/search" className={styles.ctaButton}>
            Browse All Services
          </Link>
        </div>
      </section>

      <div className={styles.servicesSection}>
        <h2 className={styles.sectionTitle}>Browse by Category</h2>
        
        <div className={styles.cardsGrid}>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <div className={styles.card} key={cat._id}>
                <img 
                  src={getCategoryImage(cat.name)} 
                  alt={cat.name} 
                  className={styles.cardImage} 
                />
                <div className={styles.cardBody}>
                  <h3>{cat.name}</h3>
                  <p>{cat.description || "Expert professionals ready to help."}</p>
                  
                  {/* DYNAMIC LINK: Passes category ID to search page */}
                  <Link to={`/search?category=${cat._id}`} className={styles.cardButton}>
                    View {cat.name}
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>Loading categories...</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;