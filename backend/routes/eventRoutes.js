const express = require('express');
const r = express.Router();
const c = require('../controllers/eventController');
const { protect, checkPermission } = require('../middleware/auth');

r.get('/calendar', c.getCalendarEvents);
r.get('/', c.getEvents);
r.get('/:id', c.getEvent);
r.post('/', protect, checkPermission('events', 'create'), c.createEvent);
r.put('/:id', protect, checkPermission('events', 'edit'), c.updateEvent);
r.delete('/:id', protect, checkPermission('events', 'delete'), c.deleteEvent);

module.exports = r;
