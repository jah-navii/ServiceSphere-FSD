import React from 'react';
import styles from './AboutUs.module.css';

const AboutUs = () => {
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.aboutWrapper}>
        <header className={styles.aboutHeader}>
          Service Sphere - About Us
        </header>

        <div className={styles.content}>
          <h2>Welcome to Service Sphere</h2>
          <p>
            At <b>Service Sphere</b>, we aim to simplify your life by connecting you with top professionals across various service categories. From home maintenance to personal services, we provide trusted experts to meet your needs.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to make finding and booking services <b>hassle-free, reliable, and affordable</b>. We ensure that you get the best service experience with trust, transparency, and efficiency.
          </p>

          <div className={styles.highlights}>
            <h3>Why Choose Us?</h3>
            <ul>
              <li>Trusted and Verified Professionals</li>
              <li>Quick and Easy Booking</li>
              <li>Transparent Pricing</li>
              <li>Wide Range of Services</li>
              <li>Customer Satisfaction Guarantee</li>
            </ul>
          </div>

          <div className={styles.applySection}>
            <p className={styles.applyText}>You could be a part of our journey. Interested?</p>
            {/* Note: In a real React app, use react-router-dom's <Link> instead of <a> */}
            <a className={styles.applyButton} href="/search">BOOK NOW</a>
          </div>
        </div>

        <footer className={styles.aboutFooter}>
          &copy; 2025 Service Sphere | All Rights Reserved
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;