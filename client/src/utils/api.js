// API utility for making authenticated requests with JWT

const API_BASE_URL = 'http://localhost:5000';

/**
 * Get the JWT token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get the current user from localStorage
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Remove token and user data (logout)
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get authorization header with JWT token
 */
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/seeker/profile')
 * @param {object} options - Fetch options (method, body, etc.)
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    // If unauthorized, clear auth and redirect to login
    if (response.status === 401) {
      clearAuth();
      window.location.href = '/login';
      throw new Error('Unauthorized - Please login again');
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, data, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  
  put: (endpoint, data, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  patch: (endpoint, data, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
  
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Example usage:
 * 
 * import { api, getCurrentUser, clearAuth } from './utils/api';
 * 
 * // Get data
 * const profile = await api.get('/api/seeker/profile');
 * 
 * // Post data
 * const result = await api.post('/api/bookings', { helper_id: '123', date: '2024-01-15' });
 * 
 * // Get current user
 * const user = getCurrentUser();
 * 
 * // Logout
 * clearAuth();
 * navigate('/login');
 */
