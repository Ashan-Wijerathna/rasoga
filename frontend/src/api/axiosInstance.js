import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://www.rasogha.com';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dhaham_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/me')) {
      localStorage.removeItem('dhaham_token');
      localStorage.removeItem('dhaham_refreshToken');
      window.location.href = '/login';
    }

    if (status === 429) {
      console.warn('Rate limited');
    }

    return Promise.reject(error);
  }
);

export const getFileUrl = (filePath) => {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  const cleanPath = filePath.startsWith('/') ? filePath : '/' + filePath;
  return `${BASE_URL}${cleanPath}`;
};

export const API_BASE_URL = BASE_URL;

export default axiosInstance;
