/**
 * CLIENT-SIDE JWT IMPLEMENTATION EXAMPLES
 * 
 * This file contains examples of how to update your React components
 * to work with JWT authentication.
 */

// ============================================
// 1. EXAMPLE: Fetching Protected Data
// ============================================

import { api } from '../utils/api';

// Before (using credentials):
const fetchProfileOld = async () => {
  const response = await fetch('http://localhost:5000/api/seeker/profile', {
    credentials: 'include'
  });
  const data = await response.json();
  return data;
};

// After (using JWT):
const fetchProfileNew = async () => {
  try {
    const data = await api.get('/api/seeker/profile');
    return data;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  }
};

// ============================================
// 2. EXAMPLE: Making POST Requests
// ============================================

// Before:
const createBookingOld = async (bookingData) => {
  const response = await fetch('http://localhost:5000/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(bookingData)
  });
  const data = await response.json();
  return data;
};

// After:
const createBookingNew = async (bookingData) => {
  try {
    const data = await api.post('/api/bookings', bookingData);
    return data;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
};

// ============================================
// 3. EXAMPLE: Complete Component with JWT
// ============================================

import React, { useEffect, useState } from 'react';
import { api, getCurrentUser } from '../utils/api';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // API automatically includes JWT token
      const data = await api.get('/api/seeker/profile');
      setProfile(data.seeker);
    } catch (err) {
      setError(err.message);
      // If 401 error, user will be automatically redirected to login
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const data = await api.put('/api/seeker/update-profile', updatedData);
      setProfile(data.seeker);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Profile</h1>
      {profile && (
        <div>
          <p>Name: {profile.name}</p>
          <p>Email: {profile.email}</p>
          <p>Mobile: {profile.mobilenumber}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

// ============================================
// 4. EXAMPLE: Axios Instance (Alternative)
// ============================================

import axios from 'axios';
import { getToken } from '../utils/api';

// Create axios instance with JWT interceptor
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Usage with axios
const fetchWithAxios = async () => {
  try {
    const response = await axiosInstance.get('/api/seeker/profile');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// ============================================
// 5. EXAMPLE: Updated Navbar with Logout
// ============================================

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useSelector((state) => state.user);

  const handleLogout = async () => {
    try {
      // Optional: Call server logout endpoint
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and Redux state
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {currentUser?.name}!</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
};

// ============================================
// 6. EXAMPLE: File Upload with JWT
// ============================================

const uploadFile = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, browser will set it automatically
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

// ============================================
// 7. EXAMPLE: Protected Route with Token Check
// ============================================

import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/api';

const EnhancedProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser } = useSelector((state) => state.user);

  // Check both Redux state and localStorage
  if (!isAuthenticated() || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// ============================================
// 8. EXAMPLE: Testing JWT Authentication
// ============================================

// Manual testing in browser console:
// 1. Login and check token
//    localStorage.getItem('token')
//
// 2. Make authenticated request
//    fetch('http://localhost:5000/api/seeker/profile', {
//      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
//    }).then(r => r.json()).then(console.log)
//
// 3. Check token expiration
//    const token = localStorage.getItem('token');
//    const payload = JSON.parse(atob(token.split('.')[1]));
//    console.log('Expires:', new Date(payload.exp * 1000));

// ============================================
// 9. EXAMPLE: App.js Changes
// ============================================

// Add this to your App.js to persist login across page refreshes
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from './redux/userSlice';
import { getCurrentUser, isAuthenticated } from './utils/api';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user) {
        dispatch(loginSuccess(user));
      }
    }
  }, [dispatch]);

  return (
    <div>
      {/* Your app routes here */}
    </div>
  );
}

export default App;
