import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../../redux/userSlice";
import styles from "./LoginForm.module.css";
import logoImg from "../../assets/logo.png";

const LoginForm = ({ title, apiEndpoint, signupPath, redirectPath }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (!document.querySelector('script[src*="dotlottie-player"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
      document.body.appendChild(script);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    try {
      const response = await fetch(`http://localhost:5000${apiEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        dispatch(loginFailure(data.message || data.error || "Login failed"));
        return;
      }
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      dispatch(loginSuccess(data.user));
      navigate(redirectPath || "/home");
    } catch (err) {
      console.error(err);
      dispatch(loginFailure("Network error. Please try again later"));
    }
  };

  return (
    <div className={styles.page}>
      {/* ── Brand panel ── */}
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
        <p className={styles.panelTagline}>Your orbit to assistance</p>
      </div>

      {/* ── Form panel ── */}
      <div className={styles.formPanel}>
        <div className={styles.formWrap}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            &larr; Back
          </button>

          <div className={styles.formCard}>
            <h1 className={styles.title}>{title}</h1>

            {error && (
              <div className={styles.errorText}>
                {typeof error === "string" ? error : error.message || "Login failed"}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

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
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)} tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            <p className={styles.switchText}>
              Don&apos;t have an account?{" "}
              <a href={signupPath} className={styles.link}>Sign up here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
