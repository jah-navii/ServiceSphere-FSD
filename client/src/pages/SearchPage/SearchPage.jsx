import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./SearchPage.module.css";
import defaultProfile from "../../assets/profile-picture.png"; 

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Data
  const [helpers, setHelpers] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [price, setPrice] = useState(searchParams.get("price") || 1500);
  const [gender, setGender] = useState(searchParams.get("gender") || "all");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "all");
  
  // Get Category from URL
  const activeCategoryId = searchParams.get("category");

  // 1. Fetch Options (Categories & Locations)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [locRes, catRes] = await Promise.all([
          fetch("http://localhost:5000/api/locations"),
          fetch("http://localhost:5000/api/services/categories")
        ]);
        
        const locData = await locRes.json();
        const catData = await catRes.json();

        setLocationsList(locData || []);
        const cats = catData.categories || [];
        setAllCategories(cats);

        // --- ENFORCE CATEGORY LOGIC ---
        // If no category in URL, default to the first one immediately
        if (!activeCategoryId && cats.length > 0) {
            setSearchParams(prev => {
                prev.set("category", cats[0]._id);
                return prev;
            });
        }

      } catch (err) {
        console.error("Failed to load options");
      }
    };
    fetchOptions();
  }, [activeCategoryId, setSearchParams]);

  // 2. Fetch Helpers
  useEffect(() => {
    // Don't fetch if we are in the middle of redirecting to a default category
    if (!activeCategoryId) return;

    const fetchServices = async () => {
      setLoading(true);
      try {
        const query = searchParams.toString(); 
        const response = await fetch(`http://localhost:5000/api/services?${query}`);
        const data = await response.json();
        
        if (data.success) {
          setHelpers(data.helpers);
          setServiceTypes(data.serviceTypes || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [searchParams, activeCategoryId]);

  // Handlers
  const handleCategoryChange = (catId) => {
    // When switching category, reset other filters but keep location if you want
    // Here we reset 'service type' because types belong to specific categories
    const newParams = { category: catId, price: 1500, gender: "all", location: location };
    setSearchParams(newParams);
    setType("all"); // Reset local state dropdown
  };

  const updateFilter = (key, value) => {
    const currentParams = Object.fromEntries([...searchParams]);
    const newParams = { ...currentParams, [key]: value };
    
    if (key === "gender") setGender(value);
    if (key === "type") setType(value);
    if (key === "location") setLocation(value);
    
    setSearchParams(newParams);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentParams = Object.fromEntries([...searchParams]);
      if (currentParams.price !== price) {
        setSearchParams({ ...currentParams, price });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [price, searchParams, setSearchParams]);

  const resetFilters = () => {
    setPrice(1500);
    setGender("all");
    setType("all");
    setLocation("all");
    // Keep the current category
    const params = { category: activeCategoryId };
    setSearchParams(params);
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      
      {/* CATEGORY TABS (Always Visible) */}
      <div className={styles.categoryTabs}>
        {allCategories.map(cat => (
            <button
                key={cat._id}
                className={`${styles.tab} ${activeCategoryId === cat._id ? styles.activeTab : ''}`}
                onClick={() => handleCategoryChange(cat._id)}
            >
                {cat.name}
            </button>
        ))}
      </div>

      <div className={styles.container}>
        {/* FILTERS */}
        <div className={styles.filters}>
          <div className={styles.filterHeader}>
            <h2>Filters</h2>
            <button onClick={resetFilters} className={styles.resetLink}>Reset</button>
          </div>
          
          <div className={styles.filterSection}>
            <h3>Max Price: ₹{price}</h3>
            <input type="range" min="100" max="5000" value={price} className={styles.rangeInput} onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div className={styles.filterSection}>
            <h3>Location</h3>
            <select value={location} onChange={(e) => updateFilter("location", e.target.value)} className={styles.selectInput}>
              <option value="all">All Locations</option>
              {locationsList.map(loc => <option key={loc._id} value={loc.name}>{loc.name}</option>)}
            </select>
          </div>

          <div className={styles.filterSection}>
            <h3>Service Type</h3>
            <select value={type} onChange={(e) => updateFilter("type", e.target.value)} className={styles.selectInput}>
              <option value="all">All Services</option>
              {serviceTypes.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div className={styles.filterSection}>
            <h3>Gender</h3>
            <select value={gender} onChange={(e) => updateFilter("gender", e.target.value)} className={styles.selectInput}>
              <option value="all">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* RESULTS */}
        <div className={styles.resultsArea}>
          <div className={styles.servicesGrid}>
            {loading ? (
              <p style={{width:'100%', textAlign:'center'}}>Finding experts...</p>
            ) : helpers.length === 0 ? (
              <div className={styles.noResults}>
                  <h3>No helpers found in this category.</h3>
                  <p>Try changing the location or price filters.</p>
              </div>
            ) : (
              helpers.map((helper, index) => (
                <div key={`${helper.id}-${index}`} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <img src={defaultProfile} alt={helper.name} className={styles.profileImg} />
                    <div className={styles.details}>
                      <span className={styles.serviceTag}>{helper.service}</span>
                      <h3>{helper.name}</h3>
                      
                      <div className={styles.infoRow}>
                        <span>Price:</span> 
                        <strong>₹{helper.price}/hr</strong>
                      </div>
                      <div className={styles.infoRow}>
                        <span>Location:</span> 
                        <strong>{helper.address || "N/A"}</strong>
                      </div>
                      <div className={styles.infoRow}>
                        <span>Gender:</span> 
                        <strong>{helper.gender}</strong>
                      </div>

                      <div className={styles.rating}>Rating: {helper.rating}/5</div>
                    </div>
                  </div>
                  
                  <button 
                    className={styles.bookBtn}
                    onClick={() => navigate("/booking", { 
                      state: { helperId: helper.id, helperName: helper.name, serviceName: helper.service, price: helper.price } 
                    })}
                  >
                    Book Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;