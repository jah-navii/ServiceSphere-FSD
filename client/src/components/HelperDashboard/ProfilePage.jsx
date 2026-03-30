import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import styles from './ProfilePage.module.css';

function ProfilePage() {
  const { userData, setUserData } = useOutletContext();
  const { showToast } = useToast();

  // --- 1. DATA EXTRACTION ---
  // We handle two possible structures:
  // A) { helper: {...}, availableServices: [...] } -> From backend response
  // B) { ...helperFields, availableServices: [...] } -> If flattened
  const helperProfile = userData?.helper || userData || {};
  const availableServices = userData?.availableServices || [];

  // --- 2. LOCAL STATE ---
  const [formData, setFormData] = useState({
    name: '',
    mobilenumber: '',
    availability: '',
    address: '', // This will hold the Location Name
    services: [],
    certifications: [],
  });

  const [servicePrices, setServicePrices] = useState({});
  const [locations, setLocations] = useState([]); 

  // --- 3. INITIAL FETCH (Locations) ---
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/locations");
        const data = await res.json();
        setLocations(data || []);
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    };
    fetchLocations();
  }, []);

  // --- 4. SYNC STATE WITH USER DATA ---
  useEffect(() => {
    console.log("ProfilePage syncing with data:", helperProfile); // Debug Log

    if (helperProfile._id || helperProfile.id) {
      setFormData({
        name: helperProfile.name || '',
        mobilenumber: helperProfile.mobilenumber || '',
        availability: helperProfile.availability || '',
        address: helperProfile.address || '',
        services: helperProfile.services || [],
        certifications: helperProfile.certifications || [],
      });

      // Map prices for selected services to local state
      // This ensures checkboxes are checked and prices are filled
      const prices = {};
      (helperProfile.services || []).forEach(s => {
        // Handle both populated object or flat ID
        const serviceId = s.serviceId?._id || s.serviceId; 
        if (serviceId) {
            prices[serviceId] = s.price;
        }
      });
      setServicePrices(prices);
    }
  }, [userData]); 

  // --- HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (serviceId) => (e) => {
    const isChecked = e.target.checked;
    setServicePrices(prev => {
      const newPrices = { ...prev };
      if (isChecked) {
        newPrices[serviceId] = newPrices[serviceId] || ''; 
      } else {
        delete newPrices[serviceId];
      }
      return newPrices;
    });
  };

  const handlePriceChange = (serviceId) => (e) => {
    const value = e.target.value;
    setServicePrices(prev => ({ ...prev, [serviceId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct Services Array for Backend
    const finalServices = availableServices
      .filter(svc => servicePrices[svc._id] !== undefined)
      .map(svc => ({
        serviceId: svc._id,
        name: svc.name,
        price: Number(servicePrices[svc._id])
      }));

    // Validation
    if (finalServices.some(s => !s.price || s.price <= 0)) {
        showToast("Please enter valid prices for all selected services", "error");
        return;
    }

    // Use FormData for file upload support
    const submitData = new FormData();
    submitData.append("id", helperProfile.id || helperProfile._id);
    submitData.append("name", formData.name);
    submitData.append("mobilenumber", formData.mobilenumber);
    submitData.append("availability", formData.availability);
    submitData.append("address", formData.address);
    submitData.append("services", JSON.stringify(finalServices));

    const fileInput = document.getElementById("certifications");
    if (fileInput && fileInput.files[0]) {
      submitData.append("certifications", fileInput.files[0]);
    }

    try {
      // UPDATED URL based on your request
      const response = await fetch("http://localhost:5000/api/helper/profile", { 
        method: "PUT",
        credentials: "include",
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        // Update Context so the UI (and Sidebar) reflects changes immediately
        setUserData({
            ...userData,
            helper: data.user 
        });
        showToast("Profile updated successfully!", "success");
      } else {
        showToast(data.error || "Update failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    }
  };
  
  const renderCertification = () => {
    const certifications = formData.certifications;
    if (!Array.isArray(certifications) || certifications.length === 0) {
      return <p style={{color: '#666', fontStyle: 'italic', fontSize: '0.9rem'}}>No certification uploaded.</p>; 
    }
    
    // Show most recent cert
    const cert = certifications[certifications.length - 1]; 
    if (typeof cert === 'string') {
      const url = `http://localhost:5000/uploads/${cert}`;
      if (cert.endsWith('.pdf')) {
        return (
          <div style={{textAlign: 'center', marginTop: '10px'}}>
            <iframe 
              src={url} 
              width="100%" 
              height="400px" 
              title="Certification" 
              className={styles.certPreview}
              style={{border: '1px solid #ddd', borderRadius: '4px'}}
            ></iframe>
            <div style={{marginTop: '10px'}}>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                📄 Open PDF in new tab
              </a>
            </div>
          </div>
        );
      } else {
        return <img src={url} alt="Certification" className={styles.certPreview} style={{maxWidth: '100%', maxHeight: '300px', objectFit:'contain'}} />;
      }
    }
    return null;
  };

  if (!userData) return <p style={{padding:'20px'}}>Loading profile data...</p>;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
        
        <div>
          <label htmlFor="name" className={styles.label}>Name:</label>
          <input 
            type="text" 
            name="name" 
            className={styles.input}
            value={formData.name} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        <div>
          <label htmlFor="contact" className={styles.label}>Contact:</label>
          <input 
            type="text" 
            name="mobilenumber" 
            className={styles.input}
            value={formData.mobilenumber} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        {/* Address Dropdown */}
        <div>
          <label htmlFor="address" className={styles.label}>Location / City:</label>
          <select 
            name="address" 
            className={styles.input} 
            value={formData.address} 
            onChange={handleInputChange} 
            required
          >
            <option value="">-- Select Location --</option>
            {locations.length > 0 ? (
                locations.map(loc => (
                    <option key={loc._id} value={loc.name}>{loc.name}</option>
                ))
            ) : (
                <option disabled>Loading locations...</option>
            )}
          </select>
        </div>

        {/* Services Section */}
        <div>
          <label className={styles.label}>My Services:</label>
          <div className={styles.serviceCategories}>
            {availableServices.length > 0 ? (
                availableServices.map(service => {
                const isSelected = servicePrices[service._id] !== undefined;

                return (
                    <div className={styles.serviceItem} key={service._id}>
                    <label className={styles.serviceCheckbox}>
                        <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={handleServiceToggle(service._id)}
                        className={styles.checkbox}
                        />
                        {service.name}
                    </label>
                    
                    <div className={`${styles.priceWrapper} ${isSelected ? styles.activePrice : ''}`}>
                        <span className={styles.currency}>₹</span>
                        <input 
                        type="number" 
                        placeholder="Price" 
                        className={styles.priceInput}
                        value={servicePrices[service._id] || ''}
                        onChange={handlePriceChange(service._id)}
                        min="1" 
                        disabled={!isSelected} 
                        required={isSelected} 
                        />
                        <span className={styles.unit}>/hr</span>
                    </div>
                    </div>
                );
                })
            ) : (
                <div style={{padding: '15px', textAlign: 'center', color: '#666'}}>
                    <p style={{marginBottom: '5px'}}><strong>No services found for your category.</strong></p>
                    <p style={{fontSize: '0.9rem'}}>
                        Your category is: <strong>{helperProfile.category?.name || "Unknown"}</strong>.
                        <br/>
                        Please contact Admin to add services to this category.
                    </p>
                </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="availability" className={styles.label}>Availability (e.g. 9AM - 5PM):</label>
          <input 
            type="text" 
            name="availability" 
            className={styles.input}
            value={formData.availability} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        <div>
          <label htmlFor="certifications" className={styles.label}>Update Certification:</label>
          <input 
            type="file" 
            id="certifications" 
            name="certifications" 
            accept=".pdf, .jpg, .png" 
            className={styles.fileInput}
          />
          <div style={{marginTop: '10px'}}>
            <span className={styles.label} style={{fontSize: '0.9rem'}}>Current Document:</span>
            {renderCertification()}
          </div>
        </div>

        <button type="submit" className={styles.submitBtn}>Save Changes</button>
      </form>
    </div>
  );
}

export default ProfilePage;