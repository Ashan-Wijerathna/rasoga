const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const Event = require("../models/Event");
const User = require("../models/User");

exports.createEvent = asyncHandler(async (req, res) => {
  const eventData = { ...req.body, createdBy: req.user.id };
  if (typeof eventData.grades === "string")
    eventData.grades = JSON.parse(eventData.grades);
  if (req.file) eventData.bannerImageUrl = req.file.path;
  const event = await Event.create(eventData);
  res.status(201).json({ success: true, event });
});

exports.getEvents = asyncHandler(async (req, res) => {
  const {
    type,
    grade,
    isActive,
    month,
    year,
    page = 1,
    limit = 20,
  } = req.query;
  const where = {};
  if (type) where.type = type;
  if (isActive !== undefined) where.isActive = isActive === "true";
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    where.eventDate = { [Op.between]: [start, end] };
  }

  const { count, rows: events } = await Event.findAndCountAll({
    where,
    order: [["eventDate", "ASC"]],
    offset: (page - 1) * limit,
    limit: Number(limit),
  });

  const filtered = grade
    ? events.filter((e) => Array.isArray(e.grades) && e.grades.includes(grade))
    : events;
  res.json({ success: true, total: count, events: filtered });
});

exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  res.json({ success: true, event });
});

exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  const {
    title,
    description,
    type,
    category,
    grades: rawGrades,
    eventDate,
    applicationDeadline,
    venue,
    maxParticipants,
    isActive,
    bannerImageUrl,
    eventMode,
    groupMinSize,
    groupMaxSize,
  } = req.body;
  const grades =
    rawGrades && typeof rawGrades === "string"
      ? JSON.parse(rawGrades)
      : rawGrades;
  await event.update({
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(type !== undefined && { type }),
    ...(category !== undefined && { category }),
    ...(grades !== undefined && { grades }),
    ...(eventDate !== undefined && { eventDate }),
    ...(applicationDeadline !== undefined && { applicationDeadline }),
    ...(venue !== undefined && { venue }),
    ...(maxParticipants !== undefined && { maxParticipants }),
    ...(isActive !== undefined && { isActive }),
    ...(bannerImageUrl !== undefined && { bannerImageUrl }),
    ...(eventMode !== undefined && { eventMode }),
    ...(groupMinSize !== undefined && { groupMinSize }),
    ...(groupMaxSize !== undefined && { groupMaxSize }),
  });
  res.json({ success: true, event });
});

exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByPk(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  await event.destroy();
  res.json({ success: true, message: "Event deleted" });
});

exports.getCalendarEvents = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(
    req.query.year || now.getFullYear(),
    (req.query.month || now.getMonth() + 1) - 1,
    1,
  );
  const end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
  const events = await Event.findAll({
    where: { eventDate: { [Op.between]: [start, end] }, isActive: true },
    attributes: [
      "id",
      "title",
      "type",
      "eventDate",
      "applicationDeadline",
      "grades",
      "category",
    ],
    order: [["eventDate", "ASC"]],
  });
  res.json({ success: true, events });
});
