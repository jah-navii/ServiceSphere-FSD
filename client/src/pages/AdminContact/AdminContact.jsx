import React, { useState } from 'react';
import styles from './AdminContact.module.css';

const AdminContact = () => {
  // 1. State for form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    adminId: '',
    phone: '',
    issueType: '',
    message: '',
  });

  // 2. Handle input changes to update state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // 3. Handle form submission and validation
const handleSubmit = (event) => {
  event.preventDefault();
  const { name, email, adminId, phone, issueType, message } = formData;

  const phonePattern = /^[0-9]{10}$/;
  const namePattern = /^[A-Za-z ]+$/; 

  if (!name || !email || !adminId || !phone || !issueType || !message) {
    alert("All fields are required!");
    return;
  }

  // Name validation  <-- Added this validation block
  if (!namePattern.test(name)) {
    alert("Name should contain only alphabets and spaces.");
    return;
  }

  // Regex validation for phone
  if (!phonePattern.test(phone)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  console.log("Form submitting with data:", formData);
  alert("Form submitted successfully! (Check console for data)");
};


  return (
    <div className={styles.contactPageWrapper}>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h1>Contact Admin</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter full name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="adminId">Admin ID</label>
              <input
                type="text"
                id="adminId"
                name="adminId"
                placeholder="Enter Admin ID"
                required
                value={formData.adminId}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                placeholder="Enter 10-digit mobile number"
                required
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="issueType">Select Issue Type</label>
              <select
                id="issueType"
                name="issueType"
                required
                value={formData.issueType}
                onChange={handleChange}
              >
                <option value="">Select an issue</option>
                <option value="technical">Technical Issue</option>
                <option value="user-management">User Management</option>
                <option value="service-issues">Service Issues</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Enter Message</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                placeholder="Enter details of your issue"
                required
                value={formData.message}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className={styles.submitBtn}>Submit</button>
          </form>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.sidebarBox}>
            <h3>Admin Support</h3>
            <p>For urgent admin-related queries, please log in to the Admin Panel and access the Support Section for faster resolution.</p>
            {/* Note: Use React Router <Link> in a real app */}
            <a href="#" className={styles.helpLink}>Go to Admin Panel →</a>
          </div>
          <div className={styles.sidebarBox}>
            <h3>Need Immediate Assistance?</h3>
            <p>If your issue is critical, contact our admin support team directly at <b>admin-support@servicesphere.com</b>. Response time: 12-24 hours.</p>
          </div>
          <div className={styles.sidebarBox}>
            <h3>System Maintenance</h3>
            <p>Check our system maintenance schedule to stay informed about planned updates and downtime.</p>
             {/* Note: Use React Router <Link> in a real app */}
            <a href="#" className={styles.helpLink}>View Maintenance Schedule →</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContact;