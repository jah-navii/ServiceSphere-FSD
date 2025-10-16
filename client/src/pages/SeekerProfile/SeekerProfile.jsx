import React, { useState } from 'react';
import styles from './SeekerProfile.module.css';

const SeekerProfile = ({ seeker }) => {
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(seeker?.name || '');
  const [mobile, setMobile] = useState(seeker?.mobilenumber || '');
  const [address, setAddress] = useState(seeker?.address || '');
  const email = seeker?.email || '';

  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    const trimmed = value.trim();
    if (!trimmed) {
      setNameError('');
    } else if (!/^[A-Za-z ]+$/.test(trimmed)) {
      setNameError('Name should only contain letters and spaces.');
    } else {
      setNameError('');
    }
  };

  const handleMobileChange = (e) => {
    let value = e.target.value;

    // allow only digits
    value = value.replace(/\D/g, '');
    setMobile(value);

    if (!value) {
      setMobileError('');
    } else if (value.length !== 10) {
      setMobileError('Mobile number must be exactly 10 digits.');
    } else {
      setMobileError('');
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleSubmit = (e) => {
    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const errors = [];

    if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      errors.push('Name should only contain letters and spaces.');
      setNameError('Name should only contain letters and spaces.');
    }

    if (!/^\d{10}$/.test(trimmedMobile)) {
      errors.push('Mobile number must be exactly 10 digits.');
      setMobileError('Mobile number must be exactly 10 digits.');
    }

    if (errors.length > 0) {
      e.preventDefault();
      alert(errors.join('\n'));
      return;
    }

    // if valid, allow normal form submit to backend
    setIsEditing(false);
  };

  // Dynamic border colors (without touching your CSS file)
  const nameInputStyle = {};
  if (isEditing) {
    if (nameError) {
      nameInputStyle.borderColor = 'red';
    } else if (name.trim()) {
      nameInputStyle.borderColor = 'green';
    }
  }

  const mobileInputStyle = {};
  if (isEditing) {
    if (mobileError) {
      mobileInputStyle.borderColor = 'red';
    } else if (mobile.trim().length === 10) {
      mobileInputStyle.borderColor = 'green';
    }
  }

  return (
    <div className={styles.card}>
      {/* Home icon link */}
      <a href="/home" className={styles['home-icon']} title="Go to Homepage">
        <span className={styles['home-icon-symbol']}>&#x1F3E0;</span>
      </a>

      <div className={styles.relative}>
        <img
          className={styles['profile-pic']}
          src="/pics/profile-picture.png"
          alt="Profile"
        />
      </div>

      <form action="/update-seeker-profile" method="POST" onSubmit={handleSubmit}>
        <div className={styles.info}>
          <h2>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              readOnly={!isEditing}
              style={nameInputStyle}
            />
          </h2>
          {nameError && <small style={{ color: 'red' }}>{nameError}</small>}
        </div>

        <div className={styles.details}>
          <p>
            <span className={styles.icon}>&#x260E;</span>
            <input
              type="text"
              name="mobilenumber"
              value={mobile}
              onChange={handleMobileChange}
              readOnly={!isEditing}
              style={mobileInputStyle}
            />
          </p>
          {mobileError && (
            <small style={{ color: 'red' }}>{mobileError}</small>
          )}

          <p>
            <span className={styles.icon}>&#x2709;</span>
            <input
              type="text"
              name="email"
              value={email}
              readOnly
              disabled
            />
          </p>

          <p>
            <span className={styles.icon}>&#x1F4CD;</span>
            <input
              type="text"
              name="address"
              value={address}
              onChange={handleAddressChange}
              readOnly={!isEditing}
            />
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            className={`${styles.btn} ${styles['edit-btn']}`}
            onClick={handleEditClick}
          >
            Edit Profile
          </button>
        )}

        {isEditing && (
          <button
            type="submit"
            className={`${styles.btn} ${styles['edit-btn']}`}
          >
            Save Changes
          </button>
        )}
      </form>

      <form action="/prevbookings" method="GET">
        <button type="submit" className={styles.btn}>
          View Previous Bookings
        </button>
      </form>
    </div>
  );
};

export default SeekerProfile;
