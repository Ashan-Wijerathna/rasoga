import axiosInstance from './axiosInstance';

const permissionAPI = {
  getUserPermissions: (userId) =>
    axiosInstance.get(`/api/permissions/user/${userId}`),

  saveUserPermissions: (userId, permissions) =>
    axiosInstance.post(`/api/permissions/user/${userId}`, { permissions }),
};

export default permissionAPI;
