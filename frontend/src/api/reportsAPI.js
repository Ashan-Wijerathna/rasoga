import axiosInstance from './axiosInstance';

const reportsAPI = {
  getSummary: () =>
    axiosInstance.get('/api/reports/summary'),

  downloadApplicationsPDF: (params = {}) =>
    axiosInstance.get('/api/reports/applications/pdf', {
      params,
      responseType: 'arraybuffer',
    }),

  downloadApplicationsExcel: (params = {}) =>
    axiosInstance.get('/api/reports/applications/excel', {
      params,
      responseType: 'arraybuffer',
    }),

  downloadEventPDF: (id) =>
    axiosInstance.get(`/api/reports/events/${id}/pdf`, {
      responseType: 'arraybuffer',
    }),

  downloadEventsExcel: () =>
    axiosInstance.get('/api/reports/events/excel', {
      responseType: 'arraybuffer',
    }),

  downloadSchoolPDF: (id) =>
    axiosInstance.get(`/api/reports/schools/${id}/pdf`, {
      responseType: 'arraybuffer',
    }),

  downloadSchoolsExcel: () =>
    axiosInstance.get('/api/reports/schools/excel', {
      responseType: 'arraybuffer',
    }),

  downloadResultsPDF: () =>
    axiosInstance.get('/api/reports/results/pdf', {
      responseType: 'arraybuffer',
    }),

  downloadResultsExcel: () =>
    axiosInstance.get('/api/reports/results/excel', {
      responseType: 'arraybuffer',
    }),
};

export default reportsAPI;
