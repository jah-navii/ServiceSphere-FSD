import React from 'react';
import styles from './TermsAndConditions.module.css';

const TermsAndConditions = () => {
  return (
    <div className={styles.termsContainer}>
      <header className={styles.termsHeader}>
        Terms & Conditions | Service Sphere
      </header>

      <div className={styles.container}>
        <h1>Welcome to Service Sphere</h1>
        <p>By using our services, you agree to the following terms and conditions. Please read them carefully before booking a service.</p>

        <h2>1. User Account & Responsibilities</h2>
        <ul>
          <li>Users must register with accurate information.</li>
          <li>You are responsible for maintaining the confidentiality of your login details.</li>
          <li>Service Sphere is not liable for any unauthorized access due to negligence.</li>
        </ul>

        <h2>2. Service Booking & Payments</h2>
        <ul>
          <li>All service bookings are subject to availability.</li>
          <li>Prices may vary based on service location and provider.</li>
          <li>Payments are processed securely through our payment gateway.</li>
        </ul>

        <h2>3. Cancellations & Refund Policy</h2>
        <ul>
          <li>Users can cancel bookings as per the service provider’s cancellation policy.</li>
          <li>Refunds, if applicable, will be processed within 7 working days.</li>
          <li>Cancellation charges may apply based on the timing of the cancellation.</li>
        </ul>

        <h2>4. Service Provider Guidelines</h2>
        <ul>
          <li>All professionals listed on Service Sphere are independent providers.</li>
          <li>Service quality and safety are the responsibility of the service provider.</li>
          <li>Users are advised to review the service provider before booking.</li>
        </ul>

        <h2>5. User Conduct & Restrictions</h2>
        <ul>
          <li>Users must not abuse, harass, or misbehave with service providers.</li>
          <li>False complaints or fraudulent activities will result in account suspension.</li>
          <li>Service Sphere reserves the right to refuse service to any user violating terms.</li>
        </ul>

        <h2>6. Liability & Disclaimers</h2>
        <p>Service Sphere acts as an aggregator and is not responsible for any damage, service delays, or misconduct by third-party service providers.</p>

        <h2>7. Privacy Policy</h2>
        <p>Your personal data is secure with us. Read our <a href="#">Privacy Policy</a> to know how we handle your data.</p>

        <h2>8. Updates & Modifications</h2>
        <p>Service Sphere reserves the right to update these terms at any time. Continued use of our services implies acceptance of any modifications.</p>
      </div>

      <footer className={styles.termsFooter}>
        &copy; 2025 Service Sphere | All Rights Reserved
      </footer>
    </div>
  );
};

export default TermsAndConditions;