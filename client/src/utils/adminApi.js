import apiClient from './api';

const unwrap = (p) => p.then((r) => r.data);

export const adminApi = {
  // Dashboard & analytics
  dashboard:    () => unwrap(apiClient.get('/api/administrator/dashboard')),
  analytics:    () => unwrap(apiClient.get('/api/administrator/analytics')),
  activity:     () => unwrap(apiClient.get('/api/administrator/activity')),
  systemHealth: () => unwrap(apiClient.get('/api/administrator/system-health')),

  // Users
  users:       ()              => unwrap(apiClient.get('/api/administrator/users/all')),
  suspendUser: (type, id)      => unwrap(apiClient.patch(`/api/administrator/users/${type}/${id}/suspend`)),

  // Bookings
  bookings: () => unwrap(apiClient.get('/api/administrator/bookings/all')),

  // Categories
  categories:     ()         => unwrap(apiClient.get('/api/administrator/categories')),
  createCategory: (data)     => unwrap(apiClient.post('/api/administrator/categories', data)),
  updateCategory: (id, data) => unwrap(apiClient.patch(`/api/administrator/categories/${id}`, data)),
  deleteCategory: (id)       => unwrap(apiClient.delete(`/api/administrator/categories/${id}`)),

  // Services
  createService: (data)     => unwrap(apiClient.post('/api/administrator/services', data)),
  updateService: (id, data) => unwrap(apiClient.patch(`/api/administrator/services/${id}`, data)),
  deleteService: (id)       => unwrap(apiClient.delete(`/api/administrator/services/${id}`)),

  // Locations
  locations:      ()         => unwrap(apiClient.get('/api/administrator/locations')),
  createLocation: (data)     => unwrap(apiClient.post('/api/administrator/locations', data)),
  updateLocation: (id, data) => unwrap(apiClient.patch(`/api/administrator/locations/${id}`, data)),
  deleteLocation: (id)       => unwrap(apiClient.delete(`/api/administrator/locations/${id}`)),

  // Feedbacks
  feedbacks:      ()   => unwrap(apiClient.get('/api/administrator/feedbacks')),
  deleteFeedback: (id) => unwrap(apiClient.delete(`/api/administrator/feedbacks/${id}`)),

  // Moderator applications
  moderatorApplications: (status) =>
    unwrap(apiClient.get('/api/administrator/moderator-applications', { params: { status } })),
  approveModerator: (id)       => unwrap(apiClient.patch(`/api/administrator/moderator-applications/${id}/approve`)),
  rejectModerator:  (id, data) => unwrap(apiClient.patch(`/api/administrator/moderator-applications/${id}/reject`, data)),
  suspendModerator: (id, data) => unwrap(apiClient.patch(`/api/administrator/moderators/${id}/suspend`, data)),
};
