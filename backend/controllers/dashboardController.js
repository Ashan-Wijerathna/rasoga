const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const Application = require('../models/Application');
const Event = require('../models/Event');
const School = require('../models/School');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Result = require('../models/Result');

exports.getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalSchools, totalEvents, totalStudents,
    pendingApplications, approvedApplications, rejectedApplications,
    upcomingEvents, recentApplications, announcements,
  ] = await Promise.all([
    School.count({ where: { isActive: true } }),
    Event.count({ where: { isActive: true } }),
    Application.count(),
    Application.count({ where: { status: 'pending' } }),
    Application.count({ where: { status: 'approved' } }),
    Application.count({ where: { status: 'rejected' } }),
    Event.findAll({ where: { eventDate: { [Op.gte]: new Date() }, isActive: true }, order: [['eventDate', 'ASC']], limit: 5, attributes: ['id', 'title', 'type', 'eventDate', 'venue'] }),
    Application.findAll({
      where: { status: 'pending' },
      include: [
        { model: Event, as: 'event', attributes: ['title'] },
        { model: School, as: 'school', attributes: ['name'] },
      ],
      order: [['createdAt', 'DESC']], limit: 10,
    }),
    Announcement.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']], limit: 5 }),
  ]);

  res.json({
    success: true,
    stats: { totalSchools, totalEvents, totalStudents, pendingApplications, approvedApplications, rejectedApplications },
    upcomingEvents, recentApplications, announcements,
  });
});

exports.getSchoolDashboard = asyncHandler(async (req, res) => {
  const schoolId = req.user.school?.id || req.user.schoolId;
  const [applications, upcomingEvents, announcements] = await Promise.all([
    Application.findAll({
      where: { schoolId },
      include: [{ model: Event, as: 'event', attributes: ['title', 'type', 'eventDate'] }],
      order: [['createdAt', 'DESC']], limit: 10,
    }),
    Event.findAll({ where: { eventDate: { [Op.gte]: new Date() }, isActive: true }, order: [['eventDate', 'ASC']], limit: 8 }),
    Announcement.findAll({ where: { isActive: true }, order: [['createdAt', 'DESC']], limit: 5 }),
  ]);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };
  res.json({ success: true, stats, applications, upcomingEvents, announcements });
});

exports.getStudentDashboard = exports.getSchoolDashboard;

exports.createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, announcement });
});

exports.getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.findAll({
    where: { isActive: true },
    order: [['createdAt', 'DESC']],
    limit: 20,
  });
  res.json({ success: true, announcements });
});

exports.getArtworkSlider = asyncHandler(async (req, res) => {
  const results = await Result.findAll({
    where: { isPublished: true },
    include: [{ model: Event, as: 'event', attributes: ['title', 'type'] }],
  });

  const artworks = [];
  results.forEach((r) => {
    (r.entries || []).forEach((e) => {
      if (e.artworkImage?.url) {
        artworks.push({
          imageUrl: e.artworkImage.url,
          studentName: e.studentName,
          schoolName: e.schoolName,
          position: e.position,
          eventTitle: r.event?.title,
        });
      }
    });
  });

  res.json({ success: true, artworks });
});
