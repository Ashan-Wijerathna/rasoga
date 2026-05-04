const express = require('express');
const r = express.Router();
const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { protect, authorize } = require('../middleware/auth');
const { sendSMS } = require('../utils/smsService');
const { sendEmail } = require('../utils/emailService');
const ResozaSchoolRegistration = require('../models/ResozaSchoolRegistration');

function formatPhone(raw) {
  let p = raw.toString().replace(/\s/g, '').replace(/[^0-9]/g, '');
  if (p.startsWith('0')) p = '94' + p.slice(1);
  return p;
}

r.post('/register', asyncHandler(async (req, res) => {
  const {
    schoolName, schoolAddress, educationZone,
    principalName, contactPersonName,
    schoolEmail, whatsappNumber,
    numberOfStudents, competencyLevels, additionalNotes,
  } = req.body;

  const missing = [];
  if (!schoolName)        missing.push('schoolName');
  if (!schoolAddress)     missing.push('schoolAddress');
  if (!educationZone)     missing.push('educationZone');
  if (!principalName)     missing.push('principalName');
  if (!contactPersonName) missing.push('contactPersonName');
  if (!schoolEmail)       missing.push('schoolEmail');
  if (!whatsappNumber)    missing.push('whatsappNumber');
  if (missing.length > 0) {
    return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
  }

  const emailLower = schoolEmail.toLowerCase().trim();
  const phoneKey   = formatPhone(whatsappNumber);

  const registration = await ResozaSchoolRegistration.create({
    schoolName,
    schoolAddress,
    educationZone,
    principalName,
    contactPersonName,
    schoolEmail: emailLower,
    whatsappNumber: phoneKey,
    numberOfStudents: Number(numberOfStudents) || 0,
    competencyLevels: competencyLevels || [],
    additionalNotes: additionalNotes || '',
  });

  await sendSMS(
    phoneKey,
    `Resoza 2026: ඔබේ ලියාපදිංචිය සාර්ථකව ලැබුණි. ලියාපදිංචි අංකය: ${registration.registrationNumber}. / Registration received. Reg No: ${registration.registrationNumber}`,
  );

  try {
    await sendEmail({
      to: emailLower,
      subject: `Resoza 2026 — Registration Confirmed / ලියාපදිංචිය තහවුරු විය`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #1a3a5c; padding: 20px; text-align: center;">
            <h2 style="color: #c8a951; margin: 0;">සාහිත්‍ය මහා මංගලාව රෙසෝඨා 2026</h2>
          </div>
          <div style="padding: 32px; border: 1px solid #e2e8f0;">
            <p>Dear <strong>${contactPersonName}</strong>,</p>
            <p>Your school registration for Resoza 2026 has been received.</p>
            <p>ඔබේ පාසල් ලියාපදිංචිය Resoza 2026 සඳහා ලැබී ඇත.</p>
            <div style="background: #1a3a5c; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
              <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0 0 4px;">Registration Number / ලියාපදිංචි අංකය</p>
              <p style="color: #c8a951; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 4px; font-family: monospace;">
                ${registration.registrationNumber}
              </p>
            </div>
            <p style="color: #64748b; font-size: 13px;">Keep this number safe. You will be notified about the next steps.</p>
          </div>
          <div style="background: #f8fafc; padding: 12px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Dhaham EMS — Resoza 2026 | Sri Lanka</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Resoza] Confirmation email failed:', err.message);
  }

  res.status(201).json({
    success: true,
    message: 'Registration submitted successfully',
    registration: {
      id: registration.id,
      registrationNumber: registration.registrationNumber,
      schoolName: registration.schoolName,
      schoolEmail: registration.schoolEmail,
      status: registration.status,
    },
  });
}));

r.get('/check-status', asyncHandler(async (req, res) => {
  const { registrationNumber, email } = req.query;
  if (!registrationNumber && !email) {
    return res.status(400).json({ success: false, message: 'registrationNumber or email required' });
  }

  const where = {};
  if (registrationNumber) where.registrationNumber = registrationNumber;
  if (email) where.schoolEmail = email.toLowerCase().trim();

  const reg = await ResozaSchoolRegistration.findOne({ where });
  if (!reg) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  res.json({
    success: true,
    registration: {
      registrationNumber: reg.registrationNumber,
      schoolName: reg.schoolName,
      status: reg.status,
      createdAt: reg.createdAt,
    },
  });
}));

// Admin routes
r.get('/registrations', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const where = {};
  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { schoolName: { [Op.like]: `%${search}%` } },
      { registrationNumber: { [Op.like]: `%${search}%` } },
      { schoolEmail: { [Op.like]: `%${search}%` } },
    ];
  }
  const registrations = await ResozaSchoolRegistration.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, registrations });
}));

r.put('/registrations/:id/approve', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const reg = await ResozaSchoolRegistration.findByPk(req.params.id);
  if (!reg) { res.status(404); throw new Error('Registration not found'); }
  const { adminNote } = req.body;
  await reg.update({ status: 'approved', adminNote: adminNote || null });
  try {
    await sendEmail({
      to: reg.schoolEmail,
      subject: 'Resoza 2026 — Registration Approved',
      html: `<p>Dear ${reg.contactPersonName}, your registration (${reg.registrationNumber}) for Resoza 2026 has been <strong>approved</strong>.${adminNote ? ' Note: ' + adminNote : ''}</p>`,
    });
  } catch {}
  res.json({ success: true, message: 'Registration approved', registration: reg });
}));

r.put('/registrations/:id/reject', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const reg = await ResozaSchoolRegistration.findByPk(req.params.id);
  if (!reg) { res.status(404); throw new Error('Registration not found'); }
  const { adminNote } = req.body;
  await reg.update({ status: 'rejected', adminNote: adminNote || null });
  try {
    await sendEmail({
      to: reg.schoolEmail,
      subject: 'Resoza 2026 — Registration Update',
      html: `<p>Dear ${reg.contactPersonName}, your registration (${reg.registrationNumber}) for Resoza 2026 was not approved.${adminNote ? ' Reason: ' + adminNote : ''}</p>`,
    });
  } catch {}
  res.json({ success: true, message: 'Registration rejected', registration: reg });
}));

module.exports = r;
