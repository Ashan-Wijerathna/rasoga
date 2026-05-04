import axios from 'axios';
import { API_BASE_URL } from '../api/axiosInstance';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dhaham_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('dhaham_refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
          localStorage.setItem('dhaham_token', data.token);
          original.headers.Authorization = `Bearer ${data.token}`;
          return api(original);
        } catch {
          localStorage.removeItem('dhaham_token');
          localStorage.removeItem('dhaham_refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export { default as authAPI } from '../api/authAPI';
export { default as eventsAPI } from '../api/eventsAPI';
export { default as applicationsAPI } from '../api/applicationsAPI';
export { default as schoolsAPI } from '../api/schoolsAPI';
export { default as resultsAPI } from '../api/resultsAPI';
export { default as dashboardAPI } from '../api/dashboardAPI';
export { default as reportsAPI } from '../api/reportsAPI';
export { default as adminAPI } from '../api/adminAPI';
export { default as resozaAPI } from '../api/resozaAPI';
export { default as slidesAPI } from '../api/slidesAPI';
export { default as permissionAPI } from '../api/permissionAPI';
export { default as formBuilderAPI } from '../api/formBuilderAPI';
export { getFileUrl, API_BASE_URL } from '../api/axiosInstance';

export const trackAPI = {
  track: (params) => api.get('/applications/track', { params }),
};

export default api;
