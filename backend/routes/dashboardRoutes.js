const express = require('express');
const r = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminStats, getSchoolDashboard, getStudentDashboard, createAnnouncement, getAnnouncements, getArtworkSlider } = require('../controllers/dashboardController');

r.get('/admin', protect, authorize('admin'), getAdminStats);
r.get('/school', protect, authorize('school'), getSchoolDashboard);
r.get('/student', protect, authorize('student', 'school'), getStudentDashboard);
r.post('/announcements', protect, authorize('admin'), createAnnouncement);
r.get('/announcements', getAnnouncements);
r.get('/artwork', getArtworkSlider);

module.exports = r;
