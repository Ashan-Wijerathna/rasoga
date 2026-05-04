const express = require('express');
const r = express.Router();
const c = require('../controllers/schoolController');
const { protect, checkPermission } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const School = require('../models/School');

r.get('/verify-code', asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code || !code.trim()) {
    res.status(400);
    throw new Error('School code is required');
  }
  const school = await School.findOne({
    where: { code: code.trim().toUpperCase() },
    attributes: ['id', 'name', 'code', 'district', 'zone', 'isActive'],
  });
  if (!school) {
    res.status(404);
    throw new Error('Invalid school code. Please check and try again.');
  }
  if (!school.isActive) {
    res.status(403);
    throw new Error('This school is currently inactive. Please contact admin.');
  }
  res.json({ success: true, school });
}));

r.get('/', c.getSchools);
r.post('/', protect, checkPermission('schools', 'create'), c.createSchool);
r.get('/:id', c.getSchool);
r.put('/:id', protect, checkPermission('schools', 'edit'), c.updateSchool);
r.delete('/:id', protect, checkPermission('schools', 'delete'), c.deleteSchool);
r.put('/:id/toggle', protect, checkPermission('schools', 'edit'), c.toggleSchool);

module.exports = r;
