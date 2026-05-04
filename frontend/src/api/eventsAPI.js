import axiosInstance from './axiosInstance';

const eventsAPI = {
  getAll: (params = {}) =>
    axiosInstance.get('/api/events', { params }),

  getOne: (id) =>
    axiosInstance.get(`/api/events/${id}`),

  create: (data) =>
    axiosInstance.post('/api/events', data),

  update: (id, data) =>
    axiosInstance.put(`/api/events/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/api/events/${id}`),

  getCalendar: (params = {}) =>
    axiosInstance.get('/api/events/calendar', { params }),
};

export default eventsAPI;
