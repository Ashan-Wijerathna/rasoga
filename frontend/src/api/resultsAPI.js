import axiosInstance from './axiosInstance';

const resultsAPI = {
  getPublic: (params = {}) =>
    axiosInstance.get('/api/results/public', { params }),

  getAll: (params = {}) =>
    axiosInstance.get('/api/results', { params }),

  getOne: (id) =>
    axiosInstance.get(`/api/results/${id}`),

  create: (data) =>
    axiosInstance.post('/api/results', data),

  publish: (id) =>
    axiosInstance.put(`/api/results/${id}/publish`),

  delete: (id) =>
    axiosInstance.delete(`/api/results/${id}`),

  downloadPDF: (id) =>
    axiosInstance.get(`/api/results/${id}/download/pdf`, {
      responseType: 'blob',
    }),

  downloadExcel: (id) =>
    axiosInstance.get(`/api/results/${id}/download/excel`, {
      responseType: 'blob',
    }),
};

export default resultsAPI;
