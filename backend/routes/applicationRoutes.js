const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const Application = require("../models/Application");
const Event = require("../models/Event");
const School = require("../models/School");
const { protect, checkPermission } = require("../middleware/auth");
const { applicationUpload, applicationFields } = require("../config/cloudinary");
const { sendSMS } = require("../utils/smsService");
const { Op } = require("sequelize");
const { generateApplicationPDF, generateResozaPDF } = require("../utils/applicationPDF");

router.post(
  "/public",
  applicationUpload.fields(applicationFields),
  asyncHandler(async (req, res) => {
    const {
      eventId,
      fullName,
      address,
      dateOfBirth,
      email,
      phoneNumber,
      grade,
      schoolName,
      schoolCode,
      applicationType,
      groupName,
      groupMembers,
      studentNameSinhala,
      studentNameEnglish,
      regionalEducationZone,
      diocese,
      competencyAssessment,
      competencyDescription,
      classTeacherName,
    } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event || !event.isActive) {
      res.status(404);
      throw new Error("Event not found");
    }
    if (new Date() > new Date(event.applicationDeadline)) {
      res.status(400);
      throw new Error("Application deadline has passed");
    }

    let school;
    if (schoolCode && schoolCode.trim()) {
      school = await School.findOne({ where: { code: schoolCode.trim().toUpperCase() } });
      if (!school) {
        res.status(400);
        throw new Error("Invalid school code. Please verify your school code and try again.");
      }
    } else {
      school = await School.findOne({ where: { name: schoolName } });
      if (!school) {
        res.status(404);
        throw new Error("School not found. Please contact admin.");
      }
    }
    if (!school.isActive) {
      res.status(403);
      throw new Error("This school is currently inactive. Please contact admin.");
    }

    const isGroup = applicationType === "group" || event.eventMode === "group";

    if (isGroup) {
      let members;
      try {
        members = typeof groupMembers === "string" ? JSON.parse(groupMembers) : groupMembers;
      } catch {
        res.status(400);
        throw new Error("Invalid group members data");
      }

      const minSize = event.groupMinSize || 2;
      const maxSize = event.groupMaxSize || 5;

      if (!Array.isArray(members) || members.length < minSize) {
        res.status(400);
        throw new Error(`Group must have at least ${minSize} members`);
      }
      if (members.length > maxSize) {
        res.status(400);
        throw new Error(`Group cannot have more than ${maxSize} members`);
      }

      for (const member of members) {
        if (!event.grades.includes(member.grade)) {
          res.status(400);
          throw new Error(`Grade ${member.grade} is not eligible for this event`);
        }
      }

      const enrichedMembers = members.map((member, i) => {
        const photoFile = req.files?.[`passportPhoto_${i}`]?.[0];
        const certFile = req.files?.[`birthCertificate_${i}`]?.[0];
        if (!photoFile) {
          res.status(400);
          throw new Error(`Passport photo is required for member ${i + 1}`);
        }
        if (!certFile) {
          res.status(400);
          throw new Error(`Birth certificate is required for member ${i + 1}`);
        }
        return {
          ...member,
          passportPhotoUrl: "/uploads/photos/" + photoFile.filename,
          birthCertificateUrl: "/uploads/documents/" + certFile.filename,
        };
      });

      const existing = await Application.findOne({ where: { email, eventId } });
      if (existing) {
        res.status(400);
        throw new Error("An application with this email already exists for this event");
      }

      const appData = {
        eventId,
        schoolId: school.id,
        fullName: groupName || fullName,
        address,
        dateOfBirth: enrichedMembers[0].dateOfBirth,
        email,
        phoneNumber,
        grade: enrichedMembers[0].grade,
        schoolName: school.name,
        status: "pending",
        applicationType: "group",
        groupName,
        groupSize: enrichedMembers.length,
        groupMembers: enrichedMembers,
      };

      const application = await Application.create(appData);

      await sendSMS(
        phoneNumber,
        `Dear ${groupName}, your group application for "${event.title}" submitted. Reg No: ${application.registrationNumber}. Wait for admin approval. - Dhaham EMS`,
      );

      return res.status(201).json({ success: true, message: "Group application submitted", application });
    }

    if (!competencyAssessment && grade && !event.grades.includes(grade)) {
      res.status(400);
      throw new Error("This event is not open for Grade " + grade);
    }

    const existing = await Application.findOne({ where: { email, eventId } });
    if (existing) {
      res.status(400);
      throw new Error("An application with this email already exists for this event");
    }

    const appData = {
      eventId,
      schoolId: school.id,
      fullName: fullName || studentNameEnglish || studentNameSinhala,
      address,
      dateOfBirth,
      email,
      phoneNumber,
      grade: grade || "N/A",
      schoolName: school.name,
      status: "pending",
      applicationType: "individual",
      ...(studentNameSinhala && { studentNameSinhala }),
      ...(studentNameEnglish && { studentNameEnglish }),
      ...(regionalEducationZone && { regionalEducationZone }),
      ...(diocese && { diocese }),
      ...(competencyAssessment && { competencyAssessment }),
      ...(competencyDescription && { competencyDescription }),
      ...(classTeacherName && { classTeacherName }),
      formType: competencyAssessment ? "resoza2026" : "standard",
    };

    if (req.files?.passportPhoto?.[0]) {
      appData.passportPhotoUrl = "/uploads/photos/" + req.files.passportPhoto[0].filename;
    }
    if (req.files?.birthCertificate?.[0]) {
      appData.birthCertificateUrl = "/uploads/documents/" + req.files.birthCertificate[0].filename;
    }
    if (req.files?.classTeacherSignature?.[0]) {
      appData.classTeacherSignatureUrl = "/uploads/signatures/" + req.files.classTeacherSignature[0].filename;
    }
    if (req.files?.principalSignature?.[0]) {
      appData.principalSignatureUrl = "/uploads/signatures/" + req.files.principalSignature[0].filename;
    }
    if (req.files?.officialSeal?.[0]) {
      appData.officialSealUrl = "/uploads/signatures/" + req.files.officialSeal[0].filename;
    }

    const application = await Application.create(appData);

    await sendSMS(
      phoneNumber,
      `Dear ${fullName}, your application for "${event.title}" submitted. Reg No: ${application.registrationNumber}. Wait for admin approval. - Dhaham EMS`,
    );

    res.status(201).json({ success: true, message: "Application submitted", application });
  }),
);

router.get(
  "/track",
  asyncHandler(async (req, res) => {
    const { registrationNumber, email } = req.query;
    const where = {};
    if (registrationNumber) where.registrationNumber = registrationNumber;
    else if (email) where.email = email.toLowerCase();
    else {
      res.status(400);
      throw new Error("Provide registration number or email");
    }

    const application = await Application.findOne({
      where,
      include: [
        { model: Event, as: "event", attributes: ["title", "type", "eventDate", "venue"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (!application) {
      res.status(404);
      throw new Error("No application found");
    }
    res.json({ success: true, application });
  }),
);

router.get(
  "/:id/download-pdf",
  protect,
  checkPermission("applications", "view"),
  asyncHandler(async (req, res) => {
    const { includeBirthCert } = req.query;
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Event, as: "event" },
        { model: School, as: "school" },
      ],
    });
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    const includeBC = includeBirthCert !== "false";

    const pdfBuffer = application.formType === "resoza2026"
      ? await generateResozaPDF(application, application.event)
      : await generateApplicationPDF(application, application.event, { includeBirthCert: includeBC });

    const filename = includeBC
      ? `application-${application.registrationNumber}-with-cert.pdf`
      : `application-${application.registrationNumber}-only.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  }),
);

router.get(
  "/:id/download-birth-cert",
  protect,
  checkPermission("applications", "view"),
  asyncHandler(async (req, res) => {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }
    if (!application.birthCertificateUrl) {
      res.status(404);
      throw new Error("No birth certificate uploaded for this application");
    }

    const path = require("path");
    const fs = require("fs");

    const filePath = path.join(
      __dirname,
      "../",
      application.birthCertificateUrl.replace("/uploads/", "uploads/"),
    );

    if (!fs.existsSync(filePath)) {
      res.status(404);
      throw new Error("Birth certificate file not found on server");
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };
    const mimeType = mimeTypes[ext] || "application/octet-stream";
    const filename = `birth-certificate-${application.registrationNumber}${ext}`;

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.sendFile(filePath);
  }),
);

router.get(
  "/",
  protect,
  checkPermission("applications", "view"),
  asyncHandler(async (req, res) => {
    const where = {};
    if (req.user.role === "school") {
      if (!req.user.schoolId) {
        return res.json({ success: true, total: 0, applications: [] });
      }
      where.schoolId = req.user.schoolId;
    }
    const { status, search, eventId } = req.query;
    if (status) where.status = status;
    if (eventId) where.eventId = eventId;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: "%" + search + "%" } },
        { registrationNumber: { [Op.like]: "%" + search + "%" } },
        { email: { [Op.like]: "%" + search + "%" } },
        { groupName: { [Op.like]: "%" + search + "%" } },
      ];
    }
    const applications = await Application.findAll({
      where,
      include: [
        { model: Event, as: "event", attributes: ["title", "type", "eventDate", "eventMode"] },
        { model: School, as: "school", attributes: ["name", "code"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, total: applications.length, applications });
  }),
);

router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Event, as: "event" },
        { model: School, as: "school" },
      ],
    });
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }
    if (req.user.role === "school" && application.schoolId !== req.user.schoolId) {
      res.status(403);
      throw new Error("Access denied — not your school's application");
    }
    res.json({ success: true, application });
  }),
);

router.put(
  "/:id/review",
  protect,
  checkPermission("applications", "edit"),
  asyncHandler(async (req, res) => {
    const { status, adminNote } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      res.status(400);
      throw new Error("Status must be approved or rejected");
    }

    const application = await Application.findByPk(req.params.id, {
      include: [
        { model: Event, as: "event", attributes: ["title", "eventDate", "venue"] },
      ],
    });
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    await application.update({
      status,
      adminNote,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    });

    try {
      const { sendEmail } = require("../utils/emailService");
      await sendEmail({
        to: application.email,
        template: status,
        data: {
          studentName: application.applicationType === "group" ? application.groupName : application.fullName,
          eventTitle: application.event.title,
          eventDate: new Date(application.event.eventDate).toLocaleDateString("en-LK"),
          registrationNumber: application.registrationNumber,
          adminNote: adminNote || "",
          venue: application.event.venue || "",
        },
      });
      await application.update({ emailSent: true });
    } catch (emailErr) {
      console.error("Email failed:", emailErr.message);
    }

    const displayName = application.applicationType === "group" ? application.groupName : application.fullName;
    const smsMsg =
      status === "approved"
        ? `Dear ${displayName}, your application for "${application.event.title}" is APPROVED! Reg: ${application.registrationNumber}. Venue: ${application.event.venue}. - Dhaham EMS`
        : `Dear ${displayName}, your application for "${application.event.title}" was not approved${adminNote ? ". Reason: " + adminNote : ""}. - Dhaham EMS`;
    await sendSMS(application.phoneNumber, smsMsg);

    res.json({ success: true, message: "Application " + status, application });
  }),
);

router.put(
  "/:id/evaluation",
  protect,
  checkPermission("applications", "edit"),
  asyncHandler(async (req, res) => {
    const {
      round1Date,
      round1StudentNumber,
      round1CompetencyAssessment,
      round1EvaluatorSignature,
      finalStudentNumber,
      finalCompetencyAssessment,
      finalRankObtained,
      finalEvaluatorSignature,
    } = req.body;

    const application = await Application.findByPk(req.params.id);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    await application.update({
      ...(round1Date !== undefined && { round1Date }),
      ...(round1StudentNumber !== undefined && { round1StudentNumber }),
      ...(round1CompetencyAssessment !== undefined && { round1CompetencyAssessment }),
      ...(round1EvaluatorSignature !== undefined && { round1EvaluatorSignature }),
      ...(finalStudentNumber !== undefined && { finalStudentNumber }),
      ...(finalCompetencyAssessment !== undefined && { finalCompetencyAssessment }),
      ...(finalRankObtained !== undefined && { finalRankObtained }),
      ...(finalEvaluatorSignature !== undefined && { finalEvaluatorSignature }),
    });

    res.json({ success: true, message: "Evaluation updated", application });
  }),
);

router.put(
  "/:id/update",
  protect,
  checkPermission("applications", "edit"),
  asyncHandler(async (req, res) => {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    const allowed = [
      "fullName", "email", "phoneNumber", "address", "grade", "adminNote",
      "groupName", "studentNameSinhala", "studentNameEnglish",
      "regionalEducationZone", "diocese", "competencyAssessment",
      "competencyDescription", "classTeacherName",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    await application.update(updates);

    const updated = await Application.findByPk(req.params.id, {
      include: [
        { model: Event, as: "event" },
        { model: School, as: "school" },
      ],
    });

    res.json({ success: true, message: "Application updated", application: updated });
  }),
);

router.put(
  "/:id/update-photo",
  protect,
  checkPermission("applications", "edit"),
  applicationUpload.fields([{ name: "passportPhoto", maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }
    if (!req.files?.passportPhoto?.[0]) {
      res.status(400);
      throw new Error("No photo uploaded");
    }

    const passportPhotoUrl = "/uploads/photos/" + req.files.passportPhoto[0].filename;
    await application.update({ passportPhotoUrl });

    res.json({ success: true, message: "Photo updated", passportPhotoUrl });
  }),
);

router.put(
  "/:id/update-certificate",
  protect,
  checkPermission("applications", "edit"),
  applicationUpload.fields([{ name: "birthCertificate", maxCount: 1 }]),
  asyncHandler(async (req, res) => {
    const application = await Application.findByPk(req.params.id);
    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }
    if (!req.files?.birthCertificate?.[0]) {
      res.status(400);
      throw new Error("No certificate uploaded");
    }

    const birthCertificateUrl = "/uploads/documents/" + req.files.birthCertificate[0].filename;
    await application.update({ birthCertificateUrl });

    res.json({ success: true, message: "Certificate updated", birthCertificateUrl });
  }),
);

module.exports = router;
