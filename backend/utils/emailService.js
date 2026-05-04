const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const emailTemplates = {
  submitted: (data) => ({
    subject: `Application Received — ${data.eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#1a5276;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Dhaham School Event Management</h1>
        </div>
        <div style="padding:32px">
          <div style="background:#e8f4fd;border-left:4px solid #2196f3;padding:16px;border-radius:4px;margin-bottom:24px">
            <h2 style="color:#1a5276;margin:0">📋 Application Received</h2>
          </div>
          <p>Dear <strong>${data.studentName}</strong>,</p>
          <p>Your application for <strong>${data.eventTitle}</strong> has been received and is now pending admin review.</p>
          <div style="background:#f8f9fa;padding:16px;border-radius:6px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>Registration No:</strong> ${data.registrationNumber}</p>
            <p style="margin:0 0 8px"><strong>Event:</strong> ${data.eventTitle}</p>
            <p style="margin:0"><strong>Event Date:</strong> ${data.eventDate}</p>
          </div>
          <p>You will receive another email and SMS once the admin approves or rejects your application.</p>
          <p>Best regards,<br><strong>Dhaham EMS Team</strong></p>
        </div>
      </div>
    `,
  }),

  approved: (data) => ({
    subject: `✅ Application Approved — ${data.eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#1a5276;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Dhaham School Event Management</h1>
        </div>
        <div style="padding:32px">
          <div style="background:#d5f5e3;border-left:4px solid #27ae60;padding:16px;border-radius:4px;margin-bottom:24px">
            <h2 style="color:#1e8449;margin:0">🎉 You are eligible for the event!</h2>
          </div>
          <p>Dear <strong>${data.studentName}</strong>,</p>
          <p>Your application for <strong>${data.eventTitle}</strong> has been <strong style="color:#27ae60">APPROVED</strong>.</p>
          <div style="background:#f8f9fa;padding:16px;border-radius:6px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>Registration No:</strong> ${data.registrationNumber}</p>
            <p style="margin:0 0 8px"><strong>Event:</strong> ${data.eventTitle}</p>
            <p style="margin:0 0 8px"><strong>Event Date:</strong> ${data.eventDate}</p>
            ${data.venue ? `<p style="margin:0"><strong>Venue:</strong> ${data.venue}</p>` : ""}
          </div>
          ${data.adminNote ? `<p><em>Note: ${data.adminNote}</em></p>` : ""}
          <p>Please bring your Registration Number on event day.</p>
          <p>Best regards,<br><strong>Dhaham EMS Team</strong></p>
        </div>
      </div>
    `,
  }),

  rejected: (data) => ({
    subject: `Application Status Update — ${data.eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#1a5276;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Dhaham School Event Management</h1>
        </div>
        <div style="padding:32px">
          <div style="background:#fde8e8;border-left:4px solid #e74c3c;padding:16px;border-radius:4px;margin-bottom:24px">
            <h2 style="color:#c0392b;margin:0">Application Not Approved</h2>
          </div>
          <p>Dear <strong>${data.studentName}</strong>,</p>
          <p>We regret to inform you that your application for <strong>${data.eventTitle}</strong> has not been approved. You are not eligible for this event.</p>
          ${data.adminNote ? `<div style="background:#f8f9fa;padding:16px;border-radius:6px;margin:20px 0"><p style="margin:0"><strong>Reason:</strong> ${data.adminNote}</p></div>` : ""}
          <p>Please contact your Dhaham School administrator for more information.</p>
          <p>Best regards,<br><strong>Dhaham EMS Team</strong></p>
        </div>
      </div>
    `,
  }),

  resultSheet: (data) => ({
    subject: `📊 Results Published — ${data.eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden">
        <div style="background:#1a5276;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">Dhaham School Event Management</h1>
        </div>
        <div style="padding:32px">
          <p>Dear <strong>${data.schoolName}</strong>,</p>
          <p>Results for <strong>${data.eventTitle}</strong> are now available. Please log in to download the result sheet.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${process.env.FRONTEND_URL}/results" style="background:#1a5276;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold">View Results</a>
          </div>
          <p>Best regards,<br><strong>Dhaham EMS Team</strong></p>
        </div>
      </div>
    `,
  }),
};

exports.sendEmail = async ({ to, template, data, subject: rawSubject, html: rawHtml }) => {
  let subject, html;

  if (rawSubject && rawHtml) {
    subject = rawSubject;
    html = rawHtml;
  } else {
    if (!emailTemplates[template]) {
      console.error("Unknown email template:", template);
      return;
    }
    ({ subject, html } = emailTemplates[template](data));
  }

  if (!process.env.EMAIL_USER) {
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Dhaham EMS <noreply@rasogha.com>",
    to,
    subject,
    html,
  });
};
