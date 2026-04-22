import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '';

const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.replace('/login');
    }
    const message =
      err.response?.data?.error ??
      err.response?.data?.message ??
      err.message ??
      'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

// Backward-compatible thin wrappers used by existing Administrator components
export const api = {
  get:    (url, config)       => apiClient.get(url, config).then((r) => r.data),
  post:   (url, data, config) => apiClient.post(url, data, config).then((r) => r.data),
  put:    (url, data, config) => apiClient.put(url, data, config).then((r) => r.data),
  patch:  (url, data, config) => apiClient.patch(url, data, config).then((r) => r.data),
  delete: (url, config)       => apiClient.delete(url, config).then((r) => r.data),
};
