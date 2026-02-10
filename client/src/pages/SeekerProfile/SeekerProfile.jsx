import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess, logout } from "../../redux/userSlice";
import { useToast } from "../../context/ToastContext";
import styles from "./SeekerProfile.module.css";

// Use local profile picture from assets
import profilePic from "../../assets/profile-picture.png";

const SeekerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { currentUser } = useSelector((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setMobile(currentUser.mobilenumber || "");
      setAddress(currentUser.address || "");
      setEmail(currentUser.email || "");
    }
  }, [currentUser]);

  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    const trimmed = value.trim();
    if (!trimmed) setNameError("");
    else if (!/^[A-Za-z ]+$/.test(trimmed))
      setNameError("Name should only contain letters and spaces.");
    else setNameError("");
  };

  const handleMobileChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // allow only digits
    setMobile(value);
    if (!value) setMobileError("");
    else if (value.length !== 10)
      setMobileError("Mobile number must be exactly 10 digits.");
    else setMobileError("");
  };

  const handleAddressChange = (e) => setAddress(e.target.value);

  const handleLogout = () => {
    dispatch(logout());
    showToast("Logged out successfully!", "success");
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nameError || mobileError || !name || !mobile) {
      showToast("Please fix the errors before saving.", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/seeker/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id: currentUser.id,
            name,
            mobilenumber: mobile,
            address,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Update failed");
      }

      const updatedUser = { ...currentUser, name, mobilenumber: mobile, address };
      dispatch(loginSuccess(updatedUser));

      showToast("Profile updated successfully!", "success");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile.", "error");
    }
  };

  const nameInputStyle =
    isEditing && nameError ? { borderColor: "red" } : {};
  const mobileInputStyle =
    isEditing && mobileError ? { borderColor: "red" } : {};

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className={styles.seekerPageContainer}>
      <div className={styles.seekerCard}>
        <a
          href="/home"
          className={styles.seekerHomeIcon}
          title="Go to Homepage"
        >
          <span className={styles.seekerHomeIconSymbol}>&#x1F3E0;</span>
        </a>

        <div className={styles.seekerAvatarWrapper}>
          <img
            className={styles.seekerProfilePic}
            src={profilePic}
            alt="Profile"
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.seekerInfo}>
            <h2>
              <input
                type="text"
                name="name"
                value={name}
                onChange={handleNameChange}
                readOnly={!isEditing}
                style={nameInputStyle}
                className={!isEditing ? styles.seekerReadOnlyInput : ""}
              />
            </h2>
            {nameError && (
              <small className={styles.seekerErrorText}>{nameError}</small>
            )}
          </div>

          <div className={styles.seekerDetails}>
            <p>
              <span className={styles.seekerIcon}>&#x260E;</span>
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
              <small className={styles.seekerErrorTextIndented}>
                {mobileError}
              </small>
            )}

            <p>
              <span className={styles.seekerIcon}>&#x2709;</span>
              <input
                type="text"
                name="email"
                value={email}
                readOnly
                disabled
                style={{ opacity: 0.7, cursor: "not-allowed" }}
              />
            </p>

            <p>
              <span className={styles.seekerIcon}>&#x1F4CD;</span>
              <input
                type="text"
                name="address"
                value={address}
                onChange={handleAddressChange}
                readOnly={!isEditing}
                placeholder={
                  isEditing ? "Enter your address" : "No address set"
                }
              />
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              className={`${styles.seekerBtn} ${styles.seekerEditBtn}`}
              onClick={handleEditClick}
            >
              Edit Profile
            </button>
          )}

          {isEditing && (
            <button
              type="submit"
              className={`${styles.seekerBtn} ${styles.seekerEditBtn}`}
            >
              Save Changes
            </button>
          )}
        </form>

        <a href="/cart">
          <button type="button" className={styles.seekerBtn}>
            My Active Bookings
          </button>
        </a>

        <a href="/previous-bookings">
          <button type="button" className={styles.seekerBtn}>
            View Previous Bookings
          </button>
        </a>

        <button
          type="button"
          className={`${styles.seekerBtn} ${styles.seekerLogoutBtn}`}
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </div>
  );
};

export default SeekerProfile;
