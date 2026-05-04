const asyncHandler = require("express-async-handler");
const Result = require("../models/Result");
const Event = require("../models/Event");
const School = require("../models/School");
const { sendEmail } = require("../utils/emailService");
const {
  generateResultPDF,
  generateResultExcel,
} = require("../utils/reportsGenerator");

exports.createResult = asyncHandler(async (req, res) => {
  const { eventId, entries } = req.body;
  const event = await Event.findByPk(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  const [result, created] = await Result.findOrCreate({
    where: { eventId },
    defaults: { eventId, entries, createdBy: req.user.id },
  });
  if (!created) await result.update({ entries, updatedBy: req.user.id });
  res.status(created ? 201 : 200).json({ success: true, result });
});

exports.getResults = asyncHandler(async (req, res) => {
  const where = req.user?.role === "admin" ? {} : { isPublished: true };
  const results = await Result.findAll({
    where,
    include: [
      {
        model: Event,
        as: "event",
        attributes: ["id", "title", "type", "eventDate", "category"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  res.json({ success: true, results });
});

exports.getResult = asyncHandler(async (req, res) => {
  const result = await Result.findOne({
    where: { eventId: req.params.eventId },
    include: [{ model: Event, as: "event" }],
  });
  if (!result) {
    res.status(404);
    throw new Error("Result not found");
  }
  if (!result.isPublished && req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Results not yet published");
  }
  res.json({ success: true, result });
});

exports.publishResult = asyncHandler(async (req, res) => {
  const result = await Result.findByPk(req.params.id, {
    include: [{ model: Event, as: "event" }],
  });
  if (!result) {
    res.status(404);
    throw new Error("Result not found");
  }
  await result.update({ isPublished: true, publishedAt: new Date() });

  try {
    const schools = await School.findAll({ where: { isActive: true } });
    await Promise.all(
      schools.map((s) =>
        sendEmail({
          to: s.contactEmail,
          template: "resultSheet",
          data: { schoolName: s.name, eventTitle: result.event.title },
        }).catch(() => {}),
      ),
    );
  } catch (err) {
    console.error("Notification error:", err.message);
  }

  res.json({ success: true, message: "Result published", result });
});

exports.downloadPDF = asyncHandler(async (req, res) => {
  const result = await Result.findByPk(req.params.id, {
    include: [{ model: Event, as: "event" }],
  });
  if (!result) {
    res.status(404);
    throw new Error("Result not found");
  }
  const buf = await generateResultPDF(result, result.event);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="result-${result.event.title.replace(/\s+/g, "-")}.pdf"`,
  );
  res.send(buf);
});

exports.downloadExcel = asyncHandler(async (req, res) => {
  const result = await Result.findByPk(req.params.id, {
    include: [{ model: Event, as: "event" }],
  });
  if (!result) {
    res.status(404);
    throw new Error("Result not found");
  }
  const buf = await generateResultExcel(result, result.event);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="result-${result.event.title.replace(/\s+/g, "-")}.xlsx"`,
  );
  res.send(buf);
});

exports.deleteResult = asyncHandler(async (req, res) => {
  const result = await Result.findByPk(req.params.id);
  if (!result) {
    res.status(404);
    throw new Error("Result not found");
  }
  await result.destroy();
  res.json({ success: true, message: "Result deleted" });
});

exports.uploadArtwork = asyncHandler(async (req, res) => {
  const result = await Result.findByPk(req.params.id);
  if (!result) {
    res.status(404);
    throw new Error("Result not found");
  }
  const idx = Number(req.params.entryIndex);
  const entries = result.entries || [];
  if (!entries[idx]) {
    res.status(404);
    throw new Error("Entry not found");
  }
  if (req.file) {
    entries[idx].artworkImage = {
      url: "/uploads/artwork/" + req.file.filename,
    };
    await result.update({ entries });
  }
  res.json({ success: true, result });
});
