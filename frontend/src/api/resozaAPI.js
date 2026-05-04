import axiosInstance from './axiosInstance';

const resozaAPI = {
  register: (data) =>
    axiosInstance.post('/api/resoza/register', data),

  checkStatus: (params) =>
    axiosInstance.get('/api/resoza/check-status', { params }),

  sendPhoneOTP: (phone) =>
    axiosInstance.post('/api/resoza/send-phone-otp', { phone }),

  verifyPhoneOTP: (phone, otp) =>
    axiosInstance.post('/api/resoza/verify-phone-otp', { phone, otp }),

  sendEmailOTP: (email) =>
    axiosInstance.post('/api/resoza/send-email-otp', { email }),

  verifyEmailOTP: (email, otp) =>
    axiosInstance.post('/api/resoza/verify-email-otp', { email, otp }),

  getRegistrations: (params = {}) =>
    axiosInstance.get('/api/resoza/registrations', { params }),

  approve: (id, data) =>
    axiosInstance.put(`/api/resoza/registrations/${id}/approve`, data),

  reject: (id, data) =>
    axiosInstance.put(`/api/resoza/registrations/${id}/reject`, data),
};

export default resozaAPI;
