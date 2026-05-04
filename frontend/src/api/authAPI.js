import axiosInstance from './axiosInstance';

const authAPI = {
  login: (email, password) =>
    axiosInstance.post('/api/auth/login', { email, password }),

  getMe: () =>
    axiosInstance.get('/api/auth/me'),

  logout: () =>
    axiosInstance.post('/api/auth/logout'),

  register: (data) =>
    axiosInstance.post('/api/auth/register', data),

  refreshToken: (refreshToken) =>
    axiosInstance.post('/api/auth/refresh', { refreshToken }),
};

export default authAPI;
