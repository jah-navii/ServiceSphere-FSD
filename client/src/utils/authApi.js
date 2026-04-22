import apiClient from './api';

const unwrap = (p) => p.then((r) => r.data);

export const authApi = {
  loginSeeker:       (data) => unwrap(apiClient.post('/api/auth/login/seeker', data)),
  loginHelper:       (data) => unwrap(apiClient.post('/api/auth/login/helper', data)),
  loginAdministrator:(data) => unwrap(apiClient.post('/api/auth/login/administrator', data)),
  loginModerator:    (data) => unwrap(apiClient.post('/api/auth/login/moderator', data)),
  signupSeeker:      (data) => unwrap(apiClient.post('/api/auth/signup/seeker', data)),
  signupHelper:      (data) => unwrap(apiClient.post('/api/auth/signup/helper', data)),
  applyModerator:    (data) =>
    unwrap(
      apiClient.post('/api/auth/apply/moderator', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ),
};
