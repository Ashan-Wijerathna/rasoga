import axiosInstance from './axiosInstance';

const slidesAPI = {
  getPublic: () =>
    axiosInstance.get('/api/slides'),

  getAll: () =>
    axiosInstance.get('/api/slides/all'),

  upload: (formData) =>
    axiosInstance.post('/api/slides', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, data) =>
    axiosInstance.put(`/api/slides/${id}`, data),

  toggle: (id) =>
    axiosInstance.put(`/api/slides/${id}/toggle`),

  delete: (id) =>
    axiosInstance.delete(`/api/slides/${id}`),
};

export default slidesAPI;
