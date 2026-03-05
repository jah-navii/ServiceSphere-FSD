import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ModeratorProfile.module.css';

const ModeratorProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    locationName: '',
    status: ''
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching moderator profile...');
      
      const response = await fetch(
        `http://localhost:5000/api/moderator/profile`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      console.log('Profile data received:', data);
      const profile = data.profile;
      
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        locationName: profile.locationName || '',
        status: profile.status || ''
      });
      
      setEditedData({
        name: profile.name || '',
        phone: profile.phone || ''
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: `Failed to load profile: ${error.message}` });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:5000/api/moderator/profile',
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: editedData.name,
            phone: editedData.phone
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();

      // Update profileData with saved values
      setProfileData(prev => ({
        ...prev,
        name: editedData.name,
        phone: editedData.phone
      }));

      // Update localStorage user name
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUserData = {
        ...userData,
        name: editedData.name
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditMode(false);
      setSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData({
      name: profileData.name,
      phone: profileData.phone
    });
    setIsEditMode(false);
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Profile</h1>
        {!isEditMode ? (
          <button className={styles.editBtn} onClick={() => setIsEditMode(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Profile
          </button>
        ) : (
          <div className={styles.actionBtns}>
            <button className={styles.cancelBtn} onClick={handleCancel} disabled={saving}>
              Cancel
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.profileCard}>
        <div className={styles.section}>
          <h2>Personal Information</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Full Name</label>
              {isEditMode ? (
                <input
                  type="text"
                  name="name"
                  value={editedData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              ) : (
                <p>{profileData.name}</p>
              )}
            </div>

            <div className={styles.field}>
              <label>Email</label>
              <p className={styles.readonly}>{profileData.email}</p>
              <span className={styles.hint}>Email cannot be changed</span>
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>
              {isEditMode ? (
                <input
                  type="text"
                  name="phone"
                  value={editedData.phone}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Enter phone number"
                />
              ) : (
                <p>{profileData.phone || 'Not provided'}</p>
              )}
            </div>

            <div className={styles.field}>
              <label>Assigned Location</label>
              <p className={styles.readonly}>{profileData.locationName || 'Not assigned'}</p>
              <span className={styles.hint}>Location is assigned by administrator</span>
            </div>

            <div className={styles.field}>
              <label>Account Status</label>
              <p className={styles.readonly}>{profileData.status || 'N/A'}</p>
              <span className={styles.hint}>Status is managed by administrator</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorProfile;
