import apiClient from './api';

const unwrap = (p) => p.then((r) => r.data);

export const moderatorApi = {
  dashboard:       ()      => unwrap(apiClient.get('/api/moderator/dashboard')),
  helpers:         ()      => unwrap(apiClient.get('/api/moderator/helpers')),
  approveHelper:   (id)    => unwrap(apiClient.patch(`/api/moderator/helpers/${id}/approve`)),
  rejectHelper:    (id, d) => unwrap(apiClient.patch(`/api/moderator/helpers/${id}/reject`, d)),
  suspendHelper:   (id)    => unwrap(apiClient.patch(`/api/moderator/helpers/${id}/suspend`)),
  reactivateHelper:(id)    => unwrap(apiClient.patch(`/api/moderator/helpers/${id}/reactivate`)),
  bookings:        ()      => unwrap(apiClient.get('/api/moderator/bookings')),
  users:           ()      => unwrap(apiClient.get('/api/moderator/users')),
  services:        ()      => unwrap(apiClient.get('/api/moderator/services')),
  earningsData:    ()      => unwrap(apiClient.get('/api/moderator/earnings-data')),
  feedbacks:       ()      => unwrap(apiClient.get('/api/moderator/feedbacks')),
  profile:         ()      => unwrap(apiClient.get('/api/moderator/profile')),
  updateProfile:   (data)  => unwrap(apiClient.put('/api/moderator/profile', data)),
};
