import apiClient from './api';

const unwrap = (p) => p.then((r) => r.data);

export const bookingApi = {
  list:   (userId) => unwrap(apiClient.get('/api/bookings', { params: { userId } })),
  create: (data)   => unwrap(apiClient.post('/api/bookings', data)),
  pay:    (id)     => unwrap(apiClient.patch(`/api/bookings/${id}/pay`)),
};
