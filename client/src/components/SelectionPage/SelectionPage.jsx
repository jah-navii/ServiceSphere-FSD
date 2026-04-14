import React from "react";
import { Link } from "react-router-dom";
import styles from "./SelectionPage.module.css";
import logoImg from "../../assets/logo.png";

// Icon components kept inline to avoid extra files
const HelperIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const SeekerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const ROLES = {
  helper: {
    icon: <HelperIcon />,
    label: "Helper",
    tagline: "Offer your skills",
    points: [
      "Set your own schedule & availability",
      "Accept service requests in your area",
      "Build your reputation with reviews",
    ],
  },
  seeker: {
    icon: <SeekerIcon />,
    label: "Seeker",
    tagline: "Find expert help",
    points: [
      "Browse verified professionals nearby",
      "Book services in just a few clicks",
      "Pay securely, review after",
    ],
  },
};

const SelectionPage = ({ title, helperPath, seekerPath }) => {
  const isLogin = title.toLowerCase().includes("login");

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topBar}>
        <Link to="/home" className={styles.logoLink}>
          <img src={logoImg} alt="ServiceSphere" className={styles.logo} />
          <span className={styles.logoName}>Service Sphere</span>
        </Link>
        <Link to="/home" className={styles.backLink}>
          &larr; Back to home
        </Link>
      </header>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.headingBlock}>
          <h1 className={styles.heading}>{title}</h1>
          <p className={styles.subheading}>
            {isLogin
              ? "Select your account type to continue."
              : "Choose a role to create your account."}
          </p>
        </div>

        <div className={styles.cards}>
          {/* Helper card */}
          <Link to={helperPath} className={styles.card}>
            <span className={styles.cardIcon} style={{ color: "#007ea7" }}>
              {ROLES.helper.icon}
            </span>
            <h2 className={styles.cardTitle}>{ROLES.helper.label}</h2>
            <p className={styles.cardTagline}>{ROLES.helper.tagline}</p>
            <ul className={styles.cardList}>
              {ROLES.helper.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <span className={styles.cardCta}>
              {isLogin ? "Log in as Helper" : "Sign up as Helper"}
            </span>
          </Link>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          {/* Seeker card */}
          <Link to={seekerPath} className={`${styles.card} ${styles.cardAccent}`}>
            <span className={styles.cardIcon} style={{ color: "#007ea7" }}>
              {ROLES.seeker.icon}
            </span>
            <h2 className={styles.cardTitle}>{ROLES.seeker.label}</h2>
            <p className={styles.cardTagline}>{ROLES.seeker.tagline}</p>
            <ul className={styles.cardList}>
              {ROLES.seeker.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <span className={styles.cardCta}>
              {isLogin ? "Log in as Seeker" : "Sign up as Seeker"}
            </span>
          </Link>
        </div>

        <p className={styles.switchText}>
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className={styles.switchLink}>Sign up</Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link to="/login" className={styles.switchLink}>Log in</Link>
            </>
          )}
        </p>
      </main>
    </div>
  );
};

export default SelectionPage;