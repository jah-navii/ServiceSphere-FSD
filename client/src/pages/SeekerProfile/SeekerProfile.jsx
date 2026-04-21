import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginSuccess, logout } from "../../redux/userSlice";
import { useToast } from "../../context/ToastContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
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

  const handleCancelEdit = () => {
    // Reset fields to current saved values
    setName(currentUser.name || "");
    setMobile(currentUser.mobilenumber || "");
    setAddress(currentUser.address || "");
    setNameError("");
    setMobileError("");
    setIsEditing(false);
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

    // Guard: React's re-render can fire a submit event when the button
    // type swaps from "button" to "submit" on the same click. Bail out
    // if we're not actually in edit mode yet.
    if (!isEditing) return;

    if (nameError || mobileError || !name || !mobile) {
      showToast("Please fix the errors before saving.", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/seeker/profile`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          },
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

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.pageContent}>
        <div className={styles.profileCard}>

          {/* Colored banner at top of card */}
          <div className={styles.cardBanner}></div>

          <div className={styles.avatarWrapper}>
            <img
              className={styles.profilePic}
              src={profilePic}
              alt="Profile"
            />
          </div>

          <div className={styles.cardBody}>
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className={styles.nameSection}>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={handleNameChange}
                  readOnly={!isEditing}
                  className={isEditing ? styles.nameInputEditing : styles.nameInput}
                  style={isEditing && nameError ? { borderColor: "#ef4444" } : {}}
                />
                {nameError && (
                  <small className={styles.errorText}>{nameError}</small>
                )}
              </div>

              {/* Details */}
              <div className={styles.detailsSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>📞</span>
                  <input
                    type="text"
                    name="mobilenumber"
                    value={mobile}
                    onChange={handleMobileChange}
                    readOnly={!isEditing}
                    className={isEditing ? styles.detailInputEditing : styles.detailInput}
                    style={isEditing && mobileError ? { borderColor: "#ef4444" } : {}}
                    placeholder="Mobile number"
                  />
                </div>
                {mobileError && (
                  <small className={styles.errorText}>{mobileError}</small>
                )}

                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>✉️</span>
                  <input
                    type="text"
                    name="email"
                    value={email}
                    readOnly
                    disabled
                    className={styles.detailInputDisabled}
                  />
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>📍</span>
                  <input
                    type="text"
                    name="address"
                    value={address}
                    onChange={handleAddressChange}
                    readOnly={!isEditing}
                    className={isEditing ? styles.detailInputEditing : styles.detailInput}
                    placeholder={isEditing ? "Enter your address" : "No address set"}
                  />
                </div>
              </div>

              {!isEditing ? (
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={handleEditClick}
                >
                  Edit Profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="submit" className={styles.actionBtn}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className={styles.outlineBtn}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>

            <div className={styles.cardActions}>
              <Link to="/cart" className={styles.actionBtn}>
                My Active Bookings
              </Link>
              <Link to="/previous-bookings" className={styles.outlineBtn}>
                View Previous Bookings
              </Link>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SeekerProfile;
