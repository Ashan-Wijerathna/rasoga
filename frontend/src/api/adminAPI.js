import axiosInstance from './axiosInstance';

const adminAPI = {
  getUsers: (params = {}) =>
    axiosInstance.get('/api/admin/users', { params }),

  toggleUser: (id) =>
    axiosInstance.put(`/api/admin/users/${id}/toggle`),

  changeRole: (id, role) =>
    axiosInstance.put(`/api/admin/users/${id}/role`, { role }),

  updateUser: (id, data) =>
    axiosInstance.put(`/api/admin/users/${id}`, data),

  deleteUser: (id) =>
    axiosInstance.delete(`/api/admin/users/${id}`),

  resetPassword: (id, data) =>
    axiosInstance.put(`/api/admin/users/${id}/reset-password`, data),

  getUser: (id) =>
    axiosInstance.get(`/api/admin/users/${id}`),
};

export default adminAPI;
