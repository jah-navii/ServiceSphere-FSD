import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./SearchPage.module.css";
import defaultProfile from "../../assets/logo.png"; 
// backend api need to be updated to filter by 'place'

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [helpers, setHelpers] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize local state from URL
  const [price, setPrice] = useState(searchParams.get("price") || 1500);
  const [gender, setGender] = useState(searchParams.get("gender") || "all");
  const [type, setType] = useState(searchParams.get("type") || "all");
  // 1. New State for 'place'
  const [place, setPlace] = useState(searchParams.get("place") || "all"); 

  // List of places for the dropdown
  const PLACES = ["Chennai", "Banglore", "Hyderabad"];

  // 1. FETCH DATA (Triggers whenever URL changes)
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString(); 
        // NOTE: Your backend API at http://localhost:5000/api/services 
        // MUST be updated to accept and filter by the 'place' query parameter.
        const response = await fetch(`http://localhost:5000/api/services?${query}`);
        const data = await response.json();
        
        if (data.success) {
          setHelpers(data.helpers);
          // Only set service types once to avoid dropdown flickering
          if (serviceTypes.length === 0) {
              setServiceTypes(data.serviceTypes);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchParams]);

  // 2. HANDLE IMMEDIATE CHANGES (Dropdowns)
  const updateFilter = (key, value) => {
    // Create a new URLSearchParams object based on current params
    const currentParams = Object.fromEntries([...searchParams]);
    
    // Update the specific key
    const newParams = { ...currentParams, [key]: value };
    
    // Update State & URL immediately
    if (key === "gender") setGender(value);
    if (key === "type") setType(value);
    // 2. Update 'place' state
    if (key === "place") setPlace(value); 
    
    setSearchParams(newParams);
  };

  // 3. HANDLE PRICE SLIDER (Debounced)
  // We update the UI immediately, but the URL (and API call) after 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParams = Object.fromEntries([...searchParams]);
      if (currentParams.price !== price) {
        setSearchParams({ ...currentParams, price });
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer); // Cleanup timer if user slides again
  }, [price, searchParams, setSearchParams]);

  // 4. RESET
  const resetFilters = () => {
    setPrice(1500);
    setGender("all");
    setType("all");
    // 3. Reset 'place' state
    setPlace("all"); 
    setSearchParams({});
  };

  return (
    <div>
      <Navbar />
      
      <div className={styles.container}>
        {/* FILTERS SIDEBAR */}
        <div className={styles.filters}>
          <h2>Filters</h2>
          
          <div className={styles.filterSection}>
            <h3>Price: ₹{price}</h3>
            <input 
              type="range" 
              min="100" 
              max="5000" 
              value={price} 
              className={styles.rangeInput}
              // Update local state immediately for smooth sliding
              onChange={(e) => setPrice(e.target.value)} 
            />
          </div>

          <div className={styles.filterSection}>
            <h3>Service Type</h3>
            <select 
              value={type} 
              onChange={(e) => updateFilter("type", e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">All Services</option>
              {serviceTypes.map(s => (
                <option key={s._id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          
          {/* 4. NEW PLACE FILTER SECTION */}
          <div className={styles.filterSection}>
            <h3>Place</h3>
            <select 
              value={place} 
              onChange={(e) => updateFilter("place", e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">All Places</option>
              {PLACES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterSection}>
            <h3>Gender</h3>
            <select 
              value={gender} 
              onChange={(e) => updateFilter("gender", e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <button type="button" onClick={resetFilters} className={styles.resetBtn}>Reset All</button>
        </div>

        {/* RESULTS GRID */}
        <div className={styles.servicesGrid}>
          {loading ? (
            <p style={{ width: '100%', textAlign: 'center' }}>Updating results...</p>
          ) : helpers.length === 0 ? (
            <p>No services found matching your criteria.</p>
          ) : (
            helpers.map((helper, index) => (
              <div key={`${helper.id}-${index}`} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.details}>
                    <h3>{helper.name}</h3>
                    <p><strong>Service:</strong> {helper.service}</p>
                    <p><strong>Price:</strong> ₹{helper.price}</p>
                    <p><strong>Gender:</strong> {helper.gender}</p>
                    {/* Add Place display if helper object contains it */}
                    {helper.place && <p><strong>Place:</strong> {helper.place}</p>} 
                    <div className={styles.rating}>⭐ {helper.rating}</div>
                  </div>
                  <img 
                    src={defaultProfile} 
                    alt={helper.name} 
                    className={styles.profileImg} 
                  />
                </div>
                
                <button 
                  className={styles.bookBtn}
                  onClick={() => alert(`Booking ${helper.service} with ${helper.name}`)}
                >
                  Book Now
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;