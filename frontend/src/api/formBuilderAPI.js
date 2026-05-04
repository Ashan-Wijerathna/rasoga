import axiosInstance from './axiosInstance';

const formBuilderAPI = {
  getFields: (formType, eventId = null) =>
    axiosInstance.get(`/api/form-fields/${formType}`, {
      params: eventId ? { eventId } : {},
    }),

  getAdminFields: (formType, eventId = null) =>
    axiosInstance.get(`/api/form-fields/admin/${formType}`, {
      params: eventId ? { eventId } : {},
    }),

  createField: (data) =>
    axiosInstance.post('/api/form-fields', data),

  updateField: (id, data) =>
    axiosInstance.put(`/api/form-fields/${id}`, data),

  deleteField: (id) =>
    axiosInstance.delete(`/api/form-fields/${id}`),

  toggleField: (id) =>
    axiosInstance.post(`/api/form-fields/${id}/toggle`),

  reorderFields: (fields) =>
    axiosInstance.put('/api/form-fields/reorder/bulk', { fields }),

  saveSubmission: (data) =>
    axiosInstance.post('/api/form-fields/submissions/save', data),

  getSubmission: (type, submissionId) =>
    axiosInstance.get(`/api/form-fields/submissions/${type}/${submissionId}`),
};

export default formBuilderAPI;
