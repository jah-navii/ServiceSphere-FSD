import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 1. Import the Toast Hook
import { useToast } from "../../context/ToastContext";
import styles from "./SignupHelper.module.css"; 

const SignupHelper = () => {
  const navigate = useNavigate();
  // 2. Get the showToast function
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    mobilenumber: "",
    aadharnumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "", 
    location: "",
    category: "", 
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (!document.querySelector('script[src*="dotlottie-player"]')) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
      document.body.appendChild(script);
    }

    const fetchData = async () => {
      try {
        const catRes =await fetch("http://localhost:5000/api/services/categories");
        const catData = await catRes.json();
        setCategories(catData.categories || []);

        const locRes = await fetch("http://localhost:5000/api/locations");
        const locData = await locRes.json();
        setLocations(locData || []);
      } catch (err) {
        console.error("Failed to load options", err);
        // Optional: showToast("Failed to load form options", "error");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    if (!formData.location) {
        setError("Please select your city/location.");
        return;
    }

    if (!formData.category) {
      setError("Please select your specialty category.");
      return;
    }

    const finalPayload = {
      ...formData,
      services: [] 
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup/helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(finalPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Signup failed.";
        setError(errorMsg);
        // Also show a toast for visibility
        showToast(errorMsg, "error");
        return;
      }

      // 3. SUCCESS TOAST (Replaces Alert)
      showToast("Registration successful! Please login.", "success");
      
      navigate("/login/helper");
    } catch (err) {
      setError("Registration failed. Please try again later.");
      showToast("Network error. Please try again.", "error");
    }
  };

  return (
    <div className={styles.pageContainer}>
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

      <div className={styles.formCard}>
        <h1 className={styles.title}>Join as a Helper</h1>
        {error && <div className={styles.errorText}>{error}</div>}

        <form onSubmit={handleSubmit}>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <input className={styles.input} type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Gender</label>
            <div className={styles.radioGroup}>
              <input type="radio" id="male" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleChange} />
              <label htmlFor="male" className={styles.radioLabel}>Male</label>
              
              <input type="radio" id="female" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleChange} />
              <label htmlFor="female" className={styles.radioLabel}>Female</label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mobile & Aadhar</label>
            <div style={{display:'flex', gap:'10px'}}>
                <input className={styles.input} type="tel" name="mobilenumber" placeholder="Mobile Number" value={formData.mobilenumber} onChange={handleChange} required />
                <input className={styles.input} type="number" name="aadharnumber" placeholder="Aadhar Number" value={formData.aadharnumber} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Location / City</label>
            <select 
              className={styles.selectInput} 
              name="location" 
              value={formData.location} 
              onChange={(e) => {
                const selectedLocation = locations.find(loc => loc._id === e.target.value);
                setFormData({
                  ...formData,
                  location: e.target.value,
                  address: selectedLocation ? selectedLocation.name : ''
                });
              }} 
              required
            >
                <option value="">-- Select Your City --</option>
                {locations.length > 0 ? (
                    locations.map(loc => (
                        <option key={loc._id} value={loc._id}>{loc.name}</option>
                    ))
                ) : (
                    <option disabled>Loading locations...</option>
                )}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Login Details</label>
            <input className={styles.input} type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{marginBottom:'10px'}}/>
            <div style={{display:'flex', gap:'10px'}}>
                <input className={styles.input} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <input className={styles.input} type="password" name="confirmPassword" placeholder="Confirm" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.categorySection}>
            <label className={styles.categoryLabel}>Select Your Specialty</label>
            <p className={styles.subText}>You can add specific services later in your profile.</p>
            
            <select name="category" className={styles.selectInput} value={formData.category} onChange={handleChange} required>
              <option value="">-- Choose Category --</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className={styles.submitButton}>Register</button>
        </form>

        <p style={{textAlign: 'center', marginTop: '15px'}}>
          Already a helper? <a href="/login/helper" className={styles.link}>Login here</a>
        </p>
      </div>
    </div>
  );
};

export default SignupHelper;