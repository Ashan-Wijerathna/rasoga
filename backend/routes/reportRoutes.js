const express = require("express");
const r = express.Router();
const asyncHandler = require("express-async-handler");
const { protect, checkPermission } = require("../middleware/auth");
const Application = require("../models/Application");
const Event = require("../models/Event");
const School = require("../models/School");
const {
  generateAllApplicationsPDF,
  generateAllApplicationsExcel,
  generateEventReportPDF,
  generateEventReportExcel,
  generateSchoolReportPDF,
  generateSchoolReportExcel,
} = require("../utils/reportsGenerator");

const getAllApps = async (where = {}) => {
  return Application.findAll({
    where,
    include: [
      {
        model: Event,
        as: "event",
        attributes: ["title", "type", "eventDate", "venue"],
      },
      {
        model: School,
        as: "school",
        attributes: ["name", "code", "district", "province"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

r.get(
  "/summary",
  protect,
  checkPermission("reports", "view"),
  asyncHandler(async (req, res) => {
    const [
      totalApplications,
      totalSchools,
      totalEvents,
      pending,
      approved,
      rejected,
    ] = await Promise.all([
      Application.count(),
      School.count({ where: { isActive: true } }),
      Event.count({ where: { isActive: true } }),
      Application.count({ where: { status: "pending" } }),
      Application.count({ where: { status: "approved" } }),
      Application.count({ where: { status: "rejected" } }),
    ]);

    const events = await Event.findAll({
      attributes: ["id", "title", "type", "eventDate"],
    });
    const schools = await School.findAll({
      where: { isActive: true },
      attributes: ["id", "name", "code", "district"],
    });

    res.json({
      success: true,
      summary: {
        totalApplications,
        totalSchools,
        totalEvents,
        pending,
        approved,
        rejected,
      },
      events,
      schools,
    });
  }),
);

r.get(
  "/applications/pdf",
  protect,
  checkPermission("reports", "view"),
  asyncHandler(async (req, res) => {
    const { status, eventId, schoolId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (eventId) where.eventId = eventId;
    if (schoolId) where.schoolId = schoolId;

    const applications = await getAllApps(where);
    const buffer = await generateAllApplicationsPDF(applications, {
      status,
      eventId,
      schoolId,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="applications-report-${Date.now()}.pdf"`,
    );
    res.send(buffer);
  }),
);

r.get(
  "/applications/excel",
  protect,
  checkPermission("reports", "view"),
  asyncHandler(async (req, res) => {
    const { status, eventId, schoolId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (eventId) where.eventId = eventId;
    if (schoolId) where.schoolId = schoolId;

    const applications = await getAllApps(where);
    const buffer = await generateAllApplicationsExcel(applications);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="applications-report-${Date.now()}.xlsx"`,
    );
    res.send(buffer);
  }),
);

r.get(
  "/events/:id/pdf",
  protect,
  checkPermission("reports", "view"),
  asyncHandler(async (req, res) => {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }

    const applications = await getAllApps({ eventId: event.id });
    const buffer = await generateEventReportPDF(event, applications);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="event-${event.id}-report.pdf"`,
    );
    res.send(buffer);
  }),
);

r.get(
  "/events/excel",
  protect,
  checkPermission("reports", "view"),
  asyncHandler(async (req, res) => {
    const events = await Event.findAll({ order: [["eventDate", "DESC"]] });
    const applications = await getAllApps();
    const buffer = await generateEventReportExcel(events, applications);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="events-report-${Date.now()}.xlsx"`,
    );
    res.send(buffer);
  }),
);

r.get(
  "/schools/:id/pdf",
  protect,
  checkPermission("reports", "view"),
  asyncHandler(async (req, res) => {
    const school = await School.findByPk(req.params.id);
    if (!school) {
      res.status(404);
      throw new Error("School not found");
    }

    const applications = await getAllApps({ schoolId: school.id });
    const buffer = await generateSchoolReportPDF(school, applications);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="school-${school.code}-report.pdf"`,
    );
    res.send(buffer);
  }),
);

r.get(
  "/schools/excel",
  protect,
  checkPermission("reports", "view"),
  asyncHandler(async (req, res) => {
    const schools = await School.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    });
    const applications = await getAllApps();
    const buffer = await generateSchoolReportExcel(schools, applications);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="schools-report-${Date.now()}.xlsx"`,
    );
    res.send(buffer);
  }),
);

r.get(
  "/results/pdf",
  protect,
  checkPermission("reports", "view"),
  asyncHandler(async (req, res) => {
    const Result = require("../models/Result");
    const results = await Result.findAll({
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["title", "type", "eventDate"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    const { generateResultsPDF } = require("../utils/reportsGenerator");
    const buffer = await generateResultsPDF(results);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="results-report.pdf"',
    );
    res.send(buffer);
  }),
);

r.get(
  "/results/excel",
  protect,
  checkPermission("reports", "view"),
  asyncHandler(async (req, res) => {
    const Result = require("../models/Result");
    const results = await Result.findAll({
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["title", "type", "eventDate"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    const { generateResultsExcel } = require("../utils/reportsGenerator");
    const buffer = await generateResultsExcel(results);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="results-report.xlsx"',
    );
    res.send(buffer);
  }),
);

module.exports = r;
