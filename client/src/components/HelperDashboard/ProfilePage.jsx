import React, { useState, useEffect } from 'react';
// Assuming useOutletContext is imported from 'react-router-dom'
import { useOutletContext } from 'react-router-dom';

// Hardcoded array of available services from the EJS file
const availableServices = ['Cleaning', 'Repairs', 'Painting', 'Cooking', 'Maintenance', 'Plumbing', 'Electrical'];

function ProfilePage() {
  // Use context to get the helper's userData and a setter function
  // In a real app, you would fetch this data on component mount
  const { userData, setUserData } = useOutletContext();
  
  // Initialize form state using userData
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    mobilenumber: userData?.mobilenumber || '',
    availability: userData?.availability || '',
    // services: [{ name: 'Cleaning', price: 500.00 }, ...] 
    services: userData?.services || [],
    certifications: userData?.certifications || [],
  });

  // State to manage service prices mapping: { 'Cleaning': '500.00', 'Repairs': '450.00', ... }
  const [servicePrices, setServicePrices] = useState(() => {
    const prices = {};
    (userData?.services || []).forEach(s => {
      // Use toFixed(2) or ensure it's a string for consistent input display
      prices[s.name] = s.price ? String(s.price) : ''; 
    });
    return prices;
  });

  // Handle changes for simple text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle service checkbox toggle
  const handleServiceToggle = (serviceName) => (e) => {
    const isChecked = e.target.checked;
    
    setServicePrices(prevPrices => {
      // If unchecked, clear the price, otherwise keep it or set to an empty string
      return { 
        ...prevPrices, 
        [serviceName]: isChecked ? prevPrices[serviceName] || '' : ''
      };
    });

    setFormData(prevData => {
      if (isChecked) {
        // Add service to formData.services (will be updated fully on submit)
        return { 
          ...prevData, 
          services: [...prevData.services, { name: serviceName, price: 0 }] 
        };
      } else {
        // Remove service from formData.services
        return { 
          ...prevData, 
          services: prevData.services.filter(s => s.name !== serviceName) 
        };
      }
    });
  };

  // Handle price input change
  const handlePriceChange = (serviceName) => (e) => {
    const value = e.target.value;
    // Basic validation: only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setServicePrices(prevPrices => ({ ...prevPrices, [serviceName]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Compile the final services array with names and prices
    const finalServices = availableServices
      .filter(service => servicePrices[service] && parseFloat(servicePrices[service]) > 0)
      .map(service => ({
        name: service,
        price: parseFloat(servicePrices[service])
      }));

    // 2. Prepare the final payload for API submission (not implemented here)
    const payload = {
      ...formData,
      services: finalServices,
      // Note: File handling (certifications) needs to be managed separately using FormData and a dedicated API call.
    };

    console.log("Submitting Profile Update:", payload);

    // 3. Simulate updating the global user data context
    setUserData(prev => ({
      ...prev,
      ...payload,
      services: finalServices // Update the services in the user data
    }));

    // In a real application, you would make an Axios/Fetch POST request here.
    alert("Profile changes saved successfully! (Simulated)");
  };
  
  // Helper function to render the current certification 
  const renderCertification = () => {
    const certifications = formData.certifications;
    if (!Array.isArray(certifications) || certifications.length === 0) {
      // FIX: Removed the trailing text to resolve the syntax error
      return <p>No certification uploaded.</p>; 
    }
    
    const cert = certifications[0]; //

    if (typeof cert === 'string') {
      if (cert.endsWith('.pdf')) {
        // Render PDF in an iframe
        return <iframe src={`/uploads/${cert}`} width="100%" height="400px" title="Certification Document"></iframe>; //
      } else {
        // Render image
        return <img src={`/uploads/${cert}`} alt="Certification" style={{ maxWidth: '100%', height: 'auto' }} />; //
      }
    }
    return <p>Invalid certification format.</p>;
  };


  return (
    // Note: The EJS file included a style block; in React, you'd typically move this 
    // into the main helperDashboard.css or a dedicated ProfilePage.module.css.
    // Since the original CSS has helperDashboard.css already, we rely on the 
    // assumption that the EJS-specific styles are also included there or will be 
    // appended.
    <form id="profile-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <label htmlFor="name">Name:</label>
      <input 
        type="text" 
        id="name" 
        name="name" 
        value={formData.name} 
        onChange={handleInputChange} 
        required 
      />

      <label htmlFor="contact">Contact:</label>
      <input 
        type="text" 
        id="contact" 
        name="mobilenumber" 
        value={formData.mobilenumber} 
        onChange={handleInputChange} 
        required 
      />

      <label>Service Categories and Pricing:</label>

      <div className="service-categories">
        {availableServices.map(service => {
          const isSelected = formData.services.some(s => s.name === service) || servicePrices[service];

          return (
            <div className="service-item" key={service}>
              <label className="service-checkbox">
                <input 
                  type="checkbox" 
                  name="services" 
                  value={service}
                  checked={isSelected}
                  onChange={handleServiceToggle(service)}
                  className="service-toggle" 
                  data-service={service}
                />
                {service}
              </label>
              
              <div className={`price-input ${isSelected ? 'active' : 'inactive'}`}>
                <span>₹</span>
                <input 
                  type="number" 
                  name={`price-${service}`} 
                  placeholder="Price per hour" 
                  value={servicePrices[service] || ''}
                  onChange={handlePriceChange(service)}
                  min="1" 
                  step="0.01"
                  // Disable the input if the service is not selected
                  disabled={!isSelected} 
                  required={isSelected} // Make required only if selected
                />
                <span>/hr</span>
              </div>
            </div>
          );
        })}
      </div>

      <label htmlFor="availability">Availability:</label>
      <input 
        type="text" 
        id="availability" 
        name="availability" 
        value={formData.availability} 
        onChange={handleInputChange} 
        required 
      />

      <label htmlFor="certifications">Certifications:</label>
      {/* Note: File input handling in React typically involves storing the File object 
          in state and handling the upload during form submission with FormData. */}
      <input type="file" id="certifications" name="certifications" accept=".pdf, .jpg, .png" />

      {/* Render the current certification based on the EJS logic */}
      <p>Current Certification:</p>
      {renderCertification()}

      <button type="submit" id="formsubmit">Save Changes</button>
    </form>
  );
}

export default ProfilePage;