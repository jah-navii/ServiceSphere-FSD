import apiClient from './api';

const unwrap = (p) => p.then((r) => r.data);

export const helperApi = {
  dashboard:     (id)  => unwrap(apiClient.get(`/api/helper/dashboard/${id}`)),
  profile:       ()    => unwrap(apiClient.get('/api/helper/profile')),
  updateProfile: (data) =>
    unwrap(
      apiClient.put('/api/helper/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ),
  requests:      (id)  => unwrap(apiClient.get(`/api/helper/requests/${id}`)),
  updateRequest: (data) => unwrap(apiClient.patch('/api/helper/requests/update', data)),
  schedule:      (id)  => unwrap(apiClient.get(`/api/helper/schedule/${id}`)),
  earnings:      (id)  => unwrap(apiClient.get(`/api/helper/earnings/${id}`)),
  feedback:      (id)  => unwrap(apiClient.get(`/api/helper/feedback/${id}`)),
};
