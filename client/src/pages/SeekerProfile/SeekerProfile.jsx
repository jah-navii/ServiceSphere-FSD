import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice'; // Re-use this to update local state
import { useToast } from '../../context/ToastContext'; // Use your toast context
import styles from './SeekerProfile.module.css';

const SeekerProfile = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  // 1. Get current user from Redux
  const { currentUser } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);

  // 2. Initialize state with Redux data
  // We use useEffect to update local state if Redux state changes (e.g. on page load)
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setMobile(currentUser.mobilenumber || '');
      setAddress(currentUser.address || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const [nameError, setNameError] = useState('');
  const [mobileError, setMobileError] = useState('');

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    const trimmed = value.trim();
    if (!trimmed) setNameError('');
    else if (!/^[A-Za-z ]+$/.test(trimmed)) setNameError('Name should only contain letters and spaces.');
    else setNameError('');
  };

  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // allow only digits
    setMobile(value);
    if (!value) setMobileError('');
    else if (value.length !== 10) setMobileError('Mobile number must be exactly 10 digits.');
    else setMobileError('');
  };

  const handleAddressChange = (e) => setAddress(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (nameError || mobileError || !name || !mobile) {
      showToast("Please fix the errors before saving.", "error");
      return;
    }

    try {
      // 3. API Call to update backend
      // Assuming you create this endpoint: PUT /api/seeker/profile
      const response = await fetch(`http://localhost:5000/api/seeker/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id, // Identify who to update
          name,
          mobilenumber: mobile,
          address
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      // 4. Update Redux Store so the rest of the app knows the data changed
      // We merge the old user data with the new updates
      const updatedUser = { ...currentUser, name, mobilenumber: mobile, address };
      dispatch(loginSuccess(updatedUser));

      showToast("Profile updated successfully!", "success");
      setIsEditing(false);

    } catch (err) {
      console.error(err);
      showToast("Failed to update profile.", "error");
    }
  };

  // Dynamic Styles for validation
  const nameInputStyle = isEditing && nameError ? { borderColor: 'red' } : {};
  const mobileInputStyle = isEditing && mobileError ? { borderColor: 'red' } : {};

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        <a href="/home" className={styles['home-icon']} title="Go to Homepage">
          <span className={styles['home-icon-symbol']}>&#x1F3E0;</span>
        </a>

        <div className={styles.relative}>
          <img
            className={styles['profile-pic']}
            src="/pics/profile-picture.png" // Ensure this image exists in public/pics/
            alt="Profile"
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.info}>
            <h2>
              <input
                type="text"
                name="name"
                value={name}
                onChange={handleNameChange}
                readOnly={!isEditing}
                style={nameInputStyle}
                className={isEditing ? '' : styles.readOnlyInput}
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
              <small style={{ color: 'red', display: 'block', marginLeft: '30px' }}>{mobileError}</small>
            )}

            <p>
              <span className={styles.icon}>&#x2709;</span>
              <input
                type="text"
                name="email"
                value={email}
                readOnly
                disabled // Email is usually not editable
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
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
                placeholder={isEditing ? "Enter your address" : "No address set"}
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

        <a href="/cart"> {/* Changed to Link to Cart/Bookings page */}
            <button type="button" className={styles.btn}>
                View Previous Bookings
            </button>
        </a>
      </div>
    </div>
  );
};

export default SeekerProfile;