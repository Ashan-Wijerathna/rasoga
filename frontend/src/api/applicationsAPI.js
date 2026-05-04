import axiosInstance from './axiosInstance';

const applicationsAPI = {
  submitPublic: (formData) =>
    axiosInstance.post('/api/applications/public', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  track: (params) =>
    axiosInstance.get('/api/applications/track', { params }),

  getAll: (params = {}) =>
    axiosInstance.get('/api/applications', { params }),

  getOne: (id) =>
    axiosInstance.get(`/api/applications/${id}`),

  review: (id, data) =>
    axiosInstance.put(`/api/applications/${id}/review`, data),

  downloadPDF: (id, includeBirthCert = true) =>
    axiosInstance.get(`/api/applications/${id}/download-pdf`, {
      params: { includeBirthCert },
      responseType: 'blob',
    }),

  downloadBirthCert: (id) =>
    axiosInstance.get(`/api/applications/${id}/download-birth-cert`, {
      responseType: 'blob',
    }),

  updateEvaluation: (id, data) =>
    axiosInstance.put(`/api/applications/${id}/evaluation`, data),

  update: (id, data) =>
    axiosInstance.put(`/api/applications/${id}/update`, data),
};

export default applicationsAPI;
