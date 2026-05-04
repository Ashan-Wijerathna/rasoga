import axiosInstance from './axiosInstance';

const schoolsAPI = {
  getAll: (params = {}) =>
    axiosInstance.get('/api/schools', { params }),

  getOne: (id) =>
    axiosInstance.get(`/api/schools/${id}`),

  create: (data) =>
    axiosInstance.post('/api/schools', data),

  update: (id, data) =>
    axiosInstance.put(`/api/schools/${id}`, data),

  toggleStatus: (id) =>
    axiosInstance.put(`/api/schools/${id}/toggle`),

  delete: (id) =>
    axiosInstance.delete(`/api/schools/${id}`),

  verifyCode: (code) =>
    axiosInstance.get('/api/schools/verify-code', { params: { code } }),

  sendPhoneOTP: (phone) =>
    axiosInstance.post('/api/schools/send-otp', { phone, type: 'phone' }),

  verifyPhoneOTP: (phone, otp) =>
    axiosInstance.post('/api/schools/verify-otp', { phone, otp, type: 'phone' }),
};

export default schoolsAPI;
