import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginModerator.module.css";
import logoImg from "../../assets/logo.png";

const LoginModerator = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Load dotlottie-player via CDN
  useEffect(() => {
    if (!document.querySelector('script[src*="dotlottie-player"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src =
        "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/auth/login/moderator",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            locationId: data.user.locationId,
            locationName: data.user.locationName,
          })
        );
        navigate("/moderator/dashboard");
      } else {
        setError(data.error || data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Brand panel (left) ── */}
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

      {/* ── Form panel (right) ── */}
      <div className={styles.formPanel}>
        <div className={styles.formWrap}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            &larr; Back
          </button>

          <div className={styles.formCard}>
            <h1 className={styles.title}>Moderator Login</h1>
            <p className={styles.subtitle}>Access your location management dashboard</p>

            {error && <div className={styles.errorText}>{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="moderator@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
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

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? "Logging in…" : "Login"}
              </button>
            </form>

            <p className={styles.switchText}>
              Not a moderator yet?{" "}
              <Link to="/apply/moderator" className={styles.link}>
                Apply Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModerator;
