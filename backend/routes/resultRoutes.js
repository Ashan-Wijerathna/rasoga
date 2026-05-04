const express = require('express');
const r = express.Router();
const c = require('../controllers/resultController');
const { protect, checkPermission } = require('../middleware/auth');
const { uploadArtwork } = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');
const Result = require('../models/Result');
const Event = require('../models/Event');

r.get('/public', asyncHandler(async (req, res) => {
  const { eventId, schoolName, search } = req.query;

  const where = { isPublished: true };
  if (eventId) where.eventId = eventId;

  const results = await Result.findAll({
    where,
    include: [{ model: Event, as: 'event', attributes: ['id', 'title', 'type', 'eventDate', 'category'] }],
    order: [['createdAt', 'DESC']],
  });

  const filtered = results.map((result) => {
    let entries = result.entries || [];
    if (schoolName) {
      entries = entries.filter((e) =>
        e.schoolName && e.schoolName.toLowerCase().includes(schoolName.toLowerCase())
      );
    }
    if (search) {
      entries = entries.filter((e) =>
        e.studentName && e.studentName.toLowerCase().includes(search.toLowerCase())
      );
    }
    return { ...result.toJSON(), entries };
  }).filter((result) => {
    if (schoolName || search) return result.entries.length > 0;
    return true;
  });

  res.json({ success: true, results: filtered });
}));

r.get('/', protect, checkPermission('results', 'view'), c.getResults);
r.post('/', protect, checkPermission('results', 'create'), c.createResult);
r.get('/:eventId', protect, c.getResult);
r.put('/:id/publish', protect, checkPermission('results', 'edit'), c.publishResult);
r.delete('/:id', protect, checkPermission('results', 'delete'), c.deleteResult);
r.get('/:id/download/pdf', protect, c.downloadPDF);
r.get('/:id/download/excel', protect, c.downloadExcel);
r.put('/:id/artwork/:entryIndex', protect, checkPermission('results', 'edit'), uploadArtwork.single('artwork'), c.uploadArtwork);

module.exports = r;
