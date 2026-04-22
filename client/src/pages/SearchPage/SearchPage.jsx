import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { serviceApi } from "../../utils/serviceApi";
import styles from "./SearchPage.module.css";
import defaultProfile from "../../assets/profile-picture.png";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [helpers, setHelpers] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [price, setPrice] = useState(searchParams.get("price") || 1500);
  const [gender, setGender] = useState(searchParams.get("gender") || "all");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "all");

  const activeCategoryId = searchParams.get("category");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [locData, catData] = await Promise.all([
          serviceApi.locations(),
          serviceApi.categories(),
        ]);
        setLocationsList(locData || []);
        const cats = catData.categories || [];
        setAllCategories(cats);
        if (!activeCategoryId && cats.length > 0) {
          setSearchParams((prev) => { prev.set("category", cats[0]._id); return prev; });
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOptions();
  }, [activeCategoryId, setSearchParams]);

  useEffect(() => {
    if (!activeCategoryId) return;
    const fetchHelpers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = Object.fromEntries(searchParams.entries());
        const data = await serviceApi.search(params);
        if (data.success) {
          setHelpers(data.helpers);
          setServiceTypes(data.serviceTypes || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHelpers();
  }, [searchParams, activeCategoryId]);

  const handleCategoryChange = (catId) => {
    setSearchParams({ category: catId, price: 1500, gender: "all", location });
    setType("all");
  };

  const updateFilter = (key, value) => {
    const current = Object.fromEntries([...searchParams]);
    if (key === "gender") setGender(value);
    if (key === "type") setType(value);
    if (key === "location") setLocation(value);
    setSearchParams({ ...current, [key]: value });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = Object.fromEntries([...searchParams]);
      if (current.price !== String(price)) setSearchParams({ ...current, price });
    }, 500);
    return () => clearTimeout(timer);
  }, [price, searchParams, setSearchParams]);

  const resetFilters = () => {
    setPrice(1500); setGender("all"); setType("all"); setLocation("all");
    setSearchParams({ category: activeCategoryId });
  };

  const retry = () => {
    setError(null);
    setSearchParams((p) => new URLSearchParams(p));
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <div className={styles.categoryTabs}>
        {allCategories.map((cat) => (
          <button key={cat._id}
            className={`${styles.tab} ${activeCategoryId === cat._id ? styles.activeTab : ""}`}
            onClick={() => handleCategoryChange(cat._id)}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className={styles.container}>
        <div className={styles.filters}>
          <div className={styles.filterHeader}>
            <h2>Filters</h2>
            <button onClick={resetFilters} className={styles.resetLink}>Reset</button>
          </div>

          <div className={styles.filterSection}>
            <h3>Max Price: ₹{price}</h3>
            <input type="range" min="100" max="5000" value={price}
              className={styles.rangeInput}
              onChange={(e) => setPrice(e.target.value)} />
          </div>

          <div className={styles.filterSection}>
            <h3>Location</h3>
            <select value={location} onChange={(e) => updateFilter("location", e.target.value)}
              className={styles.selectInput}>
              <option value="all">All Locations</option>
              {locationsList.map((loc) => (
                <option key={loc._id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterSection}>
            <h3>Service Type</h3>
            <select value={type} onChange={(e) => updateFilter("type", e.target.value)}
              className={styles.selectInput}>
              <option value="all">All Services</option>
              {serviceTypes.map((s) => (
                <option key={s._id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterSection}>
            <h3>Gender</h3>
            <select value={gender} onChange={(e) => updateFilter("gender", e.target.value)}
              className={styles.selectInput}>
              <option value="all">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div className={styles.resultsArea}>
          <div className={styles.servicesGrid}>
            {error ? (
              <ErrorState message={error} onRetry={retry} />
            ) : loading ? (
              <LoadingSpinner message="Finding experts..." />
            ) : helpers.length === 0 ? (
              <EmptyState
                title="No helpers found"
                description="Try adjusting the location or price filters."
              />
            ) : (
              helpers.map((helper, index) => (
                <div key={`${helper.id}-${index}`} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <img src={defaultProfile} alt={helper.name}
                      className={styles.profileImg} loading="lazy" decoding="async" />
                    <div className={styles.details}>
                      <span className={styles.serviceTag}>{helper.service}</span>
                      <h3>{helper.name}</h3>
                      <div className={styles.infoRow}><span>Price:</span><strong>₹{helper.price}/hr</strong></div>
                      <div className={styles.infoRow}><span>Location:</span><strong>{helper.address || "N/A"}</strong></div>
                      <div className={styles.infoRow}><span>Gender:</span><strong>{helper.gender}</strong></div>
                      <div className={styles.rating}>Rating: {helper.rating}/5</div>
                    </div>
                  </div>
                  <button className={styles.bookBtn}
                    onClick={() => navigate("/booking", {
                      state: { helperId: helper.id, helperName: helper.name, serviceName: helper.service, price: helper.price }
                    })}>
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
