import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from './ProfilePage.module.css'; // Import the CSS Module

const availableServices = ['Cleaning', 'Repairs', 'Painting', 'Cooking', 'Maintenance', 'Plumbing', 'Electrical'];

function ProfilePage() {
  const { userData, setUserData } = useOutletContext();
  
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    mobilenumber: userData?.mobilenumber || '',
    availability: userData?.availability || '',
    services: userData?.services || [],
    certifications: userData?.certifications || [],
  });

  const [servicePrices, setServicePrices] = useState(() => {
    const prices = {};
    (userData?.services || []).forEach(s => {
      prices[s.name] = s.price ? String(s.price) : ''; 
    });
    return prices;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (serviceName) => (e) => {
    const isChecked = e.target.checked;
    
    setServicePrices(prevPrices => ({ 
      ...prevPrices, 
      [serviceName]: isChecked ? prevPrices[serviceName] || '' : ''
    }));

    setFormData(prevData => {
      if (isChecked) {
        return { 
          ...prevData, 
          services: [...prevData.services, { name: serviceName, price: 0 }] 
        };
      } else {
        return { 
          ...prevData, 
          services: prevData.services.filter(s => s.name !== serviceName) 
        };
      }
    });
  };

  const handlePriceChange = (serviceName) => (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setServicePrices(prevPrices => ({ ...prevPrices, [serviceName]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalServices = availableServices
      .filter(service => servicePrices[service] && parseFloat(servicePrices[service]) > 0)
      .map(service => ({
        name: service,
        price: parseFloat(servicePrices[service])
      }));

    const payload = {
      ...formData,
      services: finalServices,
    };

    console.log("Submitting:", payload);

    setUserData(prev => ({
      ...prev,
      ...payload,
      services: finalServices 
    }));

    alert("Profile changes saved successfully!");
  };
  
  const renderCertification = () => {
    const certifications = formData.certifications;
    if (!Array.isArray(certifications) || certifications.length === 0) {
      return <p style={{color: '#666', fontStyle: 'italic'}}>No certification uploaded.</p>; 
    }
    
    const cert = certifications[0]; 

    if (typeof cert === 'string') {
      if (cert.endsWith('.pdf')) {
        return <iframe src={`/uploads/${cert}`} width="100%" height="400px" title="Certification" className={styles.certPreview}></iframe>;
      } else {
        return <img src={`/uploads/${cert}`} alt="Certification" className={styles.certPreview} style={{maxWidth: '100%'}} />;
      }
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form} encType="multipart/form-data">
        
        {/* Name */}
        <div>
          <label htmlFor="name" className={styles.label}>Name:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            className={styles.input}
            value={formData.name} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        {/* Contact */}
        <div>
          <label htmlFor="contact" className={styles.label}>Contact:</label>
          <input 
            type="text" 
            id="contact" 
            name="mobilenumber" 
            className={styles.input}
            value={formData.mobilenumber} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        {/* Services */}
        <div>
          <label className={styles.label}>Service Categories and Pricing:</label>
          <div className={styles.serviceCategories}>
            {availableServices.map(service => {
              const isSelected = formData.services.some(s => s.name === service) || (servicePrices[service] !== undefined && servicePrices[service] !== '');

              return (
                <div className={styles.serviceItem} key={service}>
                  <label className={styles.serviceCheckbox}>
                    <input 
                      type="checkbox" 
                      name="services" 
                      value={service}
                      checked={isSelected}
                      onChange={handleServiceToggle(service)}
                      className={styles.checkbox}
                    />
                    {service}
                  </label>
                  
                  <div className={`${styles.priceWrapper} ${isSelected ? styles.activePrice : ''}`}>
                    <span className={styles.currency}>₹</span>
                    <input 
                      type="number" 
                      placeholder="Price" 
                      className={styles.priceInput}
                      value={servicePrices[service] || ''}
                      onChange={handlePriceChange(service)}
                      min="1" 
                      step="0.01"
                      disabled={!isSelected} 
                      required={isSelected} 
                    />
                    <span className={styles.unit}>/hr</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label htmlFor="availability" className={styles.label}>Availability:</label>
          <input 
            type="text" 
            id="availability" 
            name="availability" 
            className={styles.input}
            value={formData.availability} 
            onChange={handleInputChange} 
            required 
          />
        </div>

        {/* Certifications */}
        <div>
          <label htmlFor="certifications" className={styles.label}>Certifications:</label>
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