import apiClient from './api';

const unwrap = (p) => p.then((r) => r.data);

export const serviceApi = {
  categories:  ()       => unwrap(apiClient.get('/api/services/categories')),
  locations:   ()       => unwrap(apiClient.get('/api/locations')),
  locationsOpen: ()     => unwrap(apiClient.get('/api/locations/open')),
  search:      (params) => unwrap(apiClient.get('/api/services', { params })),
  postFeedback:(data)   => unwrap(apiClient.post('/api/feedback', data)),
};
