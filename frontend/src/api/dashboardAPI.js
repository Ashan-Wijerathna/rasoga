import axiosInstance from './axiosInstance';

const dashboardAPI = {
  getAdminStats: () =>
    axiosInstance.get('/api/dashboard/admin'),

  getAnnouncements: () =>
    axiosInstance.get('/api/dashboard/announcements'),

  createAnnouncement: (data) =>
    axiosInstance.post('/api/dashboard/announcements', data),

  getArtwork: () =>
    axiosInstance.get('/api/dashboard/artwork'),

  getSchoolDashboard: () =>
    axiosInstance.get('/api/dashboard/school'),

  getStudentDashboard: () =>
    axiosInstance.get('/api/dashboard/student'),
};

export default dashboardAPI;
