import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authApi } from "../../utils/authApi";
import { serviceApi } from "../../utils/serviceApi";
import styles from "./ApplyModerator.module.css";
import logoImg from "../../assets/logo.png";

const ApplyModerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    desiredLocation: "",
    coverLetter: "",
    experience: "",
    linkedinProfile: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Pre-select location from query param once locations are loaded
  useEffect(() => {
    if (locations.length > 0) {
      const params = new URLSearchParams(location.search);
      const preselect = params.get("location");
      if (preselect) {
        setFormData((prev) => ({ ...prev, desiredLocation: preselect }));
      }
    }
  }, [locations, location.search]);

  const fetchLocations = async () => {
    try {
      const data = await serviceApi.locations();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching locations:", err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setError("Only PDF files are accepted for resume.");
      e.target.value = "";
      setResumeFile(null);
      return;
    }
    setError("");
    setResumeFile(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.desiredLocation ||
      !formData.coverLetter
    ) {
      setError("All required fields must be filled.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!resumeFile) {
      setError("Please upload your resume (PDF).");
      return;
    }

    try {
      setLoading(true);
      const body = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val) body.append(key, val);
      });
      body.append("resume", resumeFile);

      const data = await authApi.applyModerator(body);
      setSuccess(data.message || "Application submitted! We'll review it shortly.");

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        desiredLocation: "",
        coverLetter: "",
        experience: "",
        linkedinProfile: "",
      });
      setResumeFile(null);

      setTimeout(() => navigate("/home"), 2500);
    } catch (err) {
      setError(err.message || "Application failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Brand panel (left) */}
      <div className={styles.brandPanel}>
        <Link to="/home" className={styles.panelLogo}>
          <img src={logoImg} alt="ServiceSphere" className={styles.panelLogoImg} />
          <span className={styles.panelLogoName}>Service Sphere</span>
        </Link>
        <div className={styles.animationWrapper}>
          <dotlottie-player
            src="https://lottie.host/97ea0de2-8839-4b2e-92ce-455e8731f33c/WSoZpRrAis.lottie"
            background="transparent"
            speed="1"
            style={{ width: "100%", height: "100%" }}
            loop
            autoplay
          ></dotlottie-player>
        </div>
        <p className={styles.panelTagline}>Lead your local community.</p>
      </div>

      {/* Form panel (right) */}
      <div className={styles.formPanel}>
        <div className={styles.formWrap}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            &larr; Back
          </button>

          <div className={styles.formCard}>
            <h1 className={styles.title}>Apply as Moderator</h1>
            <p className={styles.subtitle}>
              Oversee services and helpers in your local area. Applications are
              reviewed by our admin team.
            </p>

            {error && <div className={styles.errorText}>{error}</div>}
            {success && <div className={styles.successText}>{success}</div>}

            <form onSubmit={handleSubmit}>
              {/* Section: Personal Info */}
              <p className={styles.sectionLabel}>Personal Information</p>

              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input
                  className={styles.input}
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    className={styles.input}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number</label>
                  <input
                    className={styles.input}
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Section: Location */}
              <p className={styles.sectionLabel}>Location Preference</p>

              <div className={styles.formGroup}>
                <label className={styles.label}>Desired Location</label>
                <select
                  name="desiredLocation"
                  className={styles.input}
                  value={formData.desiredLocation}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a location</option>
                  {locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                      {loc.city && `, ${loc.city}`}
                      {loc.state && `, ${loc.state}`}
                    </option>
                  ))}
                </select>
                <small className={styles.hint}>
                  You will manage services and helpers in this area.
                </small>
              </div>

              {/* Section: Application */}
              <p className={styles.sectionLabel}>Your Application</p>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Cover Letter <span className={styles.required}>*</span>
                </label>
                <textarea
                  className={styles.textarea}
                  name="coverLetter"
                  rows={5}
                  placeholder="Tell us why you'd make a great moderator for this location - your motivation, relevant background, and what you'd bring to the role."
                  value={formData.coverLetter}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Relevant Experience</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="experience"
                    placeholder="e.g. 2 years in community management"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    LinkedIn Profile{" "}
                    <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    className={styles.input}
                    type="url"
                    name="linkedinProfile"
                    placeholder="https://linkedin.com/in/yourname"
                    value={formData.linkedinProfile}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Resume / CV <span className={styles.required}>*</span>
                </label>
                <label className={styles.fileLabel}>
                  <input
                    className={styles.fileInput}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    required
                  />
                  <span className={styles.fileButton}>Choose PDF</span>
                  <span className={styles.fileName}>
                    {resumeFile ? resumeFile.name : "No file chosen"}
                  </span>
                </label>
                <small className={styles.hint}>PDF only, max 5 MB.</small>
              </div>

              {/* Section: Account */}
              <p className={styles.sectionLabel}>Account Credentials</p>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password (min 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={styles.input}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>

            <p className={styles.switchText}>
              Already have an account?{" "}
              <Link to="/login/moderator" className={styles.link}>
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyModerator;
