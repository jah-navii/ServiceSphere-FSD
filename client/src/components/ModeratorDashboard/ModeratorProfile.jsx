import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moderatorApi } from '../../utils/moderatorApi';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import styles from './ModeratorProfile.module.css';

const ModeratorProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
      const data = await moderatorApi.profile();
      const profile = data.profile;
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        locationName: profile.locationName || '',
        status: profile.status || ''
      });
      setEditedData({ name: profile.name || '', phone: profile.phone || '' });
    } catch (err) {
      showToast(`Failed to load profile: ${err.message}`, 'error');
    } finally {
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
    try {
      await moderatorApi.updateProfile({ name: editedData.name, phone: editedData.phone });
      setProfileData(prev => ({ ...prev, name: editedData.name, phone: editedData.phone }));
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...userData, name: editedData.name }));
      showToast('Profile updated successfully!', 'success');
      setIsEditMode(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
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

  if (loading) return <LoadingSpinner message="Loading profile..." />;

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
