const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const FormField = require("../models/FormField");
const FormSubmissionData = require("../models/FormSubmissionData");
const { protect, authorize } = require("../middleware/auth");
const { uploadCustomFields } = require("../config/cloudinary");

// Specific paths MUST come before /:formType to avoid route conflict
router.get(
  "/admin/:formType",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { formType } = req.params;
      const { eventId } = req.query;

      const where = { formType };
      if (eventId) {
        where[Op.or] = [{ eventId: null }, { eventId: parseInt(eventId) }];
      }

      const fields = await FormField.findAll({
        where,
        order: [
          ["displayOrder", "ASC"],
          ["createdAt", "ASC"],
        ],
      });

      res.json({ success: true, fields });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

router.get("/:formType", async (req, res) => {
  try {
    const { formType } = req.params;
    const { eventId } = req.query;

    const where = {
      formType,
      isActive: true,
      adminOnly: false,
    };

    if (eventId) {
      where[Op.or] = [{ eventId: null }, { eventId: parseInt(eventId) }];
    } else {
      where.eventId = null;
    }

    const fields = await FormField.findAll({
      where,
      order: [
        ["displayOrder", "ASC"],
        ["createdAt", "ASC"],
      ],
      attributes: [
        "id",
        "fieldName",
        "fieldLabel",
        "fieldLabelSinhala",
        "fieldType",
        "fieldOptions",
        "isRequired",
        "placeholder",
        "placeholderSinhala",
        "helpText",
        "helpTextSinhala",
        "validationRules",
        "displayOrder",
        "section",
        "sectionSinhala",
        "showOnStep",
      ],
    });

    const sections = [...new Set(fields.map((f) => f.section).filter(Boolean))];

    res.json({ success: true, fields, sections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const body = req.body;

    const existing = await FormField.findOne({
      where: {
        formType: body.formType,
        fieldName: body.fieldName,
        eventId: body.eventId || null,
      },
    });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Field name already exists for this form type",
        });
    }

    if (
      body.displayOrder === undefined ||
      body.displayOrder === null ||
      body.displayOrder === ""
    ) {
      const max = await FormField.max("displayOrder", {
        where: { formType: body.formType },
      });
      body.displayOrder = (max || 0) + 1;
    }

    body.createdBy = req.user.id;
    const field = await FormField.create(body);
    res.status(201).json({ success: true, field });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Specific paths MUST come before /:id to avoid route conflict
router.put("/reorder/bulk", protect, authorize("admin"), async (req, res) => {
  try {
    const { fields } = req.body;
    if (!Array.isArray(fields)) {
      return res
        .status(400)
        .json({ success: false, message: "fields must be an array" });
    }
    await Promise.all(
      fields.map(({ id, displayOrder }) =>
        FormField.update({ displayOrder }, { where: { id } }),
      ),
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const field = await FormField.findByPk(req.params.id);
    if (!field)
      return res
        .status(404)
        .json({ success: false, message: "Field not found" });

    const body = req.body;

    if (body.fieldName && body.fieldName !== field.fieldName) {
      const existing = await FormField.findOne({
        where: {
          formType: body.formType || field.formType,
          fieldName: body.fieldName,
          eventId: body.eventId !== undefined ? body.eventId : field.eventId,
          id: { [Op.ne]: field.id },
        },
      });
      if (existing) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Field name already exists for this form type",
          });
      }
    }

    await field.update(body);
    res.json({ success: true, field });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const field = await FormField.findByPk(req.params.id);
    if (!field)
      return res
        .status(404)
        .json({ success: false, message: "Field not found" });

    await field.update({ isActive: false });
    res.json({ success: true, message: "Field deactivated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/toggle", protect, authorize("admin"), async (req, res) => {
  try {
    const field = await FormField.findByPk(req.params.id);
    if (!field)
      return res
        .status(404)
        .json({ success: false, message: "Field not found" });

    await field.update({ isActive: !field.isActive });
    res.json({ success: true, field });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/submissions/save", async (req, res) => {
  try {
    const { submissionType, submissionId, fieldData } = req.body;

    if (!submissionType || !submissionId || !fieldData) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const fieldNames = Object.keys(fieldData);
    const fields = await FormField.findAll({
      where: { fieldName: fieldNames, formType: submissionType },
    });
    const fieldMap = {};
    fields.forEach((f) => {
      fieldMap[f.fieldName] = f;
    });

    const records = [];
    for (const [fieldName, value] of Object.entries(fieldData)) {
      if (value === null || value === undefined || value === "") continue;

      const fieldMeta = fieldMap[fieldName];
      const record = {
        submissionType,
        submissionId,
        fieldId: fieldMeta?.id || null,
        fieldName,
      };

      if (Array.isArray(value)) {
        record.fieldValueJson = value;
        record.fieldValue = value.join(", ");
      } else {
        record.fieldValue = String(value);
      }

      records.push(record);
    }

    if (records.length > 0) {
      await FormSubmissionData.bulkCreate(records);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/submissions/save-with-files", async (req, res) => {
  try {
    const fileFields = await FormField.findAll({
      where: {
        fieldType: ["file_image", "file_pdf", "file_any"],
        isActive: true,
      },
      attributes: ["fieldName"],
    });
    const fileFieldNames = fileFields.map((f) => f.fieldName);

    const upload = uploadCustomFields(fileFieldNames);

    upload(req, res, async (err) => {
      if (err)
        return res.status(400).json({ success: false, message: err.message });

      const { submissionType, submissionId, fieldData } = req.body;
      const parsedData = fieldData ? JSON.parse(fieldData) : {};

      const fieldNames = Object.keys({ ...parsedData, ...req.files });
      const fields = await FormField.findAll({
        where: { fieldName: fieldNames, formType: submissionType },
      });
      const fieldMap = {};
      fields.forEach((f) => {
        fieldMap[f.fieldName] = f;
      });

      const records = [];

      for (const [fieldName, value] of Object.entries(parsedData)) {
        if (value === null || value === undefined || value === "") continue;
        const fieldMeta = fieldMap[fieldName];
        const record = {
          submissionType,
          submissionId,
          fieldId: fieldMeta?.id || null,
          fieldName,
        };
        if (Array.isArray(value)) {
          record.fieldValueJson = value;
          record.fieldValue = value.join(", ");
        } else {
          record.fieldValue = String(value);
        }
        records.push(record);
      }

      if (req.files) {
        for (const [fieldName, files] of Object.entries(req.files)) {
          if (files && files[0]) {
            const fieldMeta = fieldMap[fieldName];
            records.push({
              submissionType,
              submissionId,
              fieldId: fieldMeta?.id || null,
              fieldName,
              fileUrl: "/uploads/custom-fields/" + files[0].filename,
            });
          }
        }
      }

      if (records.length > 0) {
        await FormSubmissionData.bulkCreate(records);
      }

      res.json({ success: true });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/submissions/:type/:submissionId", protect, async (req, res) => {
  try {
    const { type, submissionId } = req.params;

    const data = await FormSubmissionData.findAll({
      where: { submissionType: type, submissionId },
      include: [
        {
          model: FormField,
          as: "field",
          attributes: ["fieldLabel", "fieldLabelSinhala", "fieldType"],
          required: false,
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const result = data.map((d) => ({
      fieldName: d.fieldName,
      fieldLabel: d.field?.fieldLabel || d.fieldName,
      fieldLabelSinhala: d.field?.fieldLabelSinhala || null,
      fieldType: d.field?.fieldType || "text",
      fieldValue: d.fieldValueJson || d.fieldValue,
      fileUrl: d.fileUrl,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
