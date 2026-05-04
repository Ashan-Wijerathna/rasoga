const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

const W = 595.28;
const H = 841.89;
const MARGIN = 40;
const CW = W - MARGIN * 2;

function drawHeader(doc, title, subtitle, date) {
  doc.rect(0, 0, W, 100).fill("#1a3a5c");
  doc.circle(MARGIN + 28, 50, 24).fill("#c8a951");
  doc
    .fontSize(16)
    .fillColor("#1a3a5c")
    .font("Helvetica-Bold")
    .text("ධ", MARGIN + 20, 40);
  doc
    .fontSize(16)
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .text(title, MARGIN + 65, 24);
  doc
    .fontSize(10)
    .fillColor("#c8a951")
    .font("Helvetica")
    .text(subtitle, MARGIN + 65, 46);
  doc
    .fontSize(8)
    .fillColor("rgba(255,255,255,0.6)")
    .font("Helvetica")
    .text("Generated: " + date, MARGIN + 65, 62);
  doc
    .fontSize(8)
    .fillColor("rgba(255,255,255,0.5)")
    .text(
      "Dhaham School Event Management System — Sri Lanka",
      W - MARGIN - 260,
      62,
    );
}

function drawFooter(doc, page, total, reportName) {
  doc.rect(0, H - 30, W, 30).fill("#1a3a5c");
  doc
    .fontSize(7)
    .fillColor("#c8a951")
    .font("Helvetica-Bold")
    .text("DHAHAM EMS", MARGIN, H - 20);
  doc
    .fontSize(7)
    .fillColor("rgba(255,255,255,0.6)")
    .font("Helvetica")
    .text(
      `${reportName}  |  Page ${page} of ${total}  |  Confidential`,
      MARGIN + 80,
      H - 20,
      { width: CW - 80, align: "right" },
    );
}

function sectionHeader(doc, text, y, color = "#1a3a5c") {
  doc.rect(MARGIN, y, CW, 20).fill(color);
  doc
    .fontSize(9)
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .text(text, MARGIN + 8, y + 6);
  return y + 20;
}

function statusBadge(doc, status, x, y) {
  const colors = {
    pending: { bg: "#fef3c7", text: "#92400e" },
    approved: { bg: "#d1fae5", text: "#065f46" },
    rejected: { bg: "#fee2e2", text: "#991b1b" },
  };
  const c = colors[status] || colors.pending;
  doc.roundedRect(x, y - 1, 52, 13, 3).fill(c.bg);
  doc
    .fontSize(7)
    .fillColor(c.text)
    .font("Helvetica-Bold")
    .text(status.toUpperCase(), x + 2, y + 1, { width: 48, align: "center" });
}

exports.generateAllApplicationsPDF = async (applications, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        layout: "landscape",
      });
      const LW = 841.89;
      const LH = 595.28;
      const LM = 30;
      const LCW = LW - LM * 2;
      const buffers = [];
      doc.on("data", (b) => buffers.push(b));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const date = new Date().toLocaleDateString("en-LK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      doc.rect(0, 0, LW, 80).fill("#1a3a5c");
      doc
        .fontSize(18)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text("APPLICATIONS REPORT", LM, 16, { width: LCW, align: "center" });
      doc
        .fontSize(9)
        .fillColor("#c8a951")
        .font("Helvetica")
        .text("Dhaham School Event Management System — Sri Lanka", LM, 40, {
          width: LCW,
          align: "center",
        });
      doc
        .fontSize(8)
        .fillColor("rgba(255,255,255,0.6)")
        .text(
          `Generated: ${date}  |  Total Applications: ${applications.length}`,
          LM,
          56,
          { width: LCW, align: "center" },
        );

      const total = applications.length;
      const pending = applications.filter((a) => a.status === "pending").length;
      const approved = applications.filter(
        (a) => a.status === "approved",
      ).length;
      const rejected = applications.filter(
        (a) => a.status === "rejected",
      ).length;

      const boxes = [
        { label: "Total", value: total, color: "#1a3a5c" },
        { label: "Pending", value: pending, color: "#d97706" },
        { label: "Approved", value: approved, color: "#16a34a" },
        { label: "Rejected", value: rejected, color: "#dc2626" },
      ];

      let bx = LM;
      boxes.forEach((b) => {
        doc.roundedRect(bx, 90, 140, 50, 6).fill(b.color);
        doc
          .fontSize(22)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text(String(b.value), bx + 10, 98);
        doc
          .fontSize(9)
          .fillColor("rgba(255,255,255,0.8)")
          .font("Helvetica")
          .text(b.label, bx + 10, 124);
        bx += 150;
      });

      let ty = 155;
      const cols = [
        { label: "Reg. No", w: 95 },
        { label: "Student Name", w: 130 },
        { label: "School", w: 130 },
        { label: "Event", w: 150 },
        { label: "Grade", w: 45 },
        { label: "Date Applied", w: 80 },
        { label: "Status", w: 65 },
        { label: "Phone", w: 80 },
      ];

      doc.rect(LM, ty, LCW, 20).fill("#334155");
      let cx = LM + 4;
      cols.forEach((col) => {
        doc
          .fontSize(8)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text(col.label, cx, ty + 6, { width: col.w - 4 });
        cx += col.w;
      });
      ty += 20;

      applications.forEach((app, i) => {
        if (ty > LH - 50) {
          doc.addPage({ size: "A4", layout: "landscape", margin: 0 });
          ty = 30;
          doc.rect(LM, ty, LCW, 20).fill("#334155");
          let cx2 = LM + 4;
          cols.forEach((col) => {
            doc
              .fontSize(8)
              .fillColor("#ffffff")
              .font("Helvetica-Bold")
              .text(col.label, cx2, ty + 6, { width: col.w - 4 });
            cx2 += col.w;
          });
          ty += 20;
        }

        const rowBg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
        doc.rect(LM, ty, LCW, 18).fill(rowBg);

        let rx = LM + 4;
        const rowData = [
          app.registrationNumber || "—",
          app.fullName || "—",
          app.schoolName || "—",
          app.event?.title || "—",
          `Grade ${app.grade}`,
          app.createdAt
            ? new Date(app.createdAt).toLocaleDateString("en-LK")
            : "—",
          "",
          app.phoneNumber || "—",
        ];

        rowData.forEach((val, vi) => {
          if (vi === 6) {
            statusBadge(doc, app.status || "pending", rx, ty + 3);
          } else {
            doc
              .fontSize(7.5)
              .fillColor("#1e293b")
              .font("Helvetica")
              .text(val, rx, ty + 5, { width: cols[vi].w - 4, ellipsis: true });
          }
          rx += cols[vi].w;
        });

        doc
          .moveTo(LM, ty + 18)
          .lineTo(LM + LCW, ty + 18)
          .stroke("#e2e8f0");
        ty += 18;
      });

      doc.rect(0, LH - 25, LW, 25).fill("#1a3a5c");
      doc
        .fontSize(7)
        .fillColor("#c8a951")
        .font("Helvetica-Bold")
        .text("DHAHAM EMS — APPLICATIONS REPORT", LM, LH - 16);
      doc
        .fontSize(7)
        .fillColor("rgba(255,255,255,0.6)")
        .font("Helvetica")
        .text("Confidential Document", LM, LH - 16, {
          width: LCW,
          align: "right",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

exports.generateEventReportPDF = async (event, applications) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const buffers = [];
      doc.on("data", (b) => buffers.push(b));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const date = new Date().toLocaleDateString("en-LK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      drawHeader(doc, "EVENT REPORT", event.title, date);

      let y = 115;

      y = sectionHeader(doc, "EVENT INFORMATION", y);
      y += 6;

      const eventInfo = [
        ["Event Title", event.title],
        ["Event Type", (event.type || "").toUpperCase()],
        ["Category", event.category || "—"],
        [
          "Event Date",
          event.eventDate
            ? new Date(event.eventDate).toLocaleDateString("en-LK", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—",
        ],
        [
          "Application Deadline",
          event.applicationDeadline
            ? new Date(event.applicationDeadline).toLocaleDateString("en-LK")
            : "—",
        ],
        ["Venue", event.venue || "—"],
        [
          "Eligible Grades",
          event.grades?.map((g) => "Grade " + g).join(", ") || "—",
        ],
        ["Status", event.isActive ? "Active" : "Inactive"],
      ];

      eventInfo.forEach(([label, val]) => {
        doc
          .fontSize(8)
          .fillColor("#64748b")
          .font("Helvetica")
          .text(label + ":", MARGIN + 4, y);
        doc
          .fontSize(8)
          .fillColor("#1e293b")
          .font("Helvetica-Bold")
          .text(val, MARGIN + 150, y, { width: CW - 154 });
        y += 15;
      });

      y += 10;

      y = sectionHeader(doc, "APPLICATION STATISTICS", y, "#475569");
      y += 8;

      const total = applications.length;
      const pending = applications.filter((a) => a.status === "pending").length;
      const approved = applications.filter(
        (a) => a.status === "approved",
      ).length;
      const rejected = applications.filter(
        (a) => a.status === "rejected",
      ).length;

      const statBoxes = [
        { label: "Total", val: total, color: "#1a3a5c" },
        { label: "Pending", val: pending, color: "#d97706" },
        { label: "Approved", val: approved, color: "#16a34a" },
        { label: "Rejected", val: rejected, color: "#dc2626" },
      ];

      statBoxes.forEach((s, i) => {
        const bx = MARGIN + i * (CW / 4 + 2);
        doc.roundedRect(bx, y, CW / 4 - 4, 48, 6).fill(s.color);
        doc
          .fontSize(20)
          .fillColor("#fff")
          .font("Helvetica-Bold")
          .text(String(s.val), bx + 8, y + 6);
        doc
          .fontSize(8)
          .fillColor("rgba(255,255,255,0.8)")
          .font("Helvetica")
          .text(s.label, bx + 8, y + 32);
      });

      y += 62;

      y = sectionHeader(doc, "APPLICANTS LIST", y);
      y += 2;

      const cols = [
        "Reg. No",
        "Student Name",
        "School",
        "Grade",
        "Date Applied",
        "Status",
      ];
      const cw = [90, 140, 140, 55, 80, 60];

      doc.rect(MARGIN, y, CW, 18).fill("#334155");
      let cx = MARGIN + 3;
      cols.forEach((col, i) => {
        doc
          .fontSize(7.5)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text(col, cx, y + 5, { width: cw[i] - 3 });
        cx += cw[i];
      });
      y += 18;

      applications.forEach((app, idx) => {
        if (y > H - 50) {
          drawFooter(doc, 1, 1, "Event Report");
          doc.addPage({ size: "A4", margin: 0 });
          y = 30;
        }

        const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
        doc.rect(MARGIN, y, CW, 16).fill(bg);

        const rowData = [
          app.registrationNumber || "—",
          app.fullName || "—",
          app.schoolName || "—",
          `Grade ${app.grade}`,
          app.createdAt
            ? new Date(app.createdAt).toLocaleDateString("en-LK")
            : "—",
        ];

        let rx = MARGIN + 3;
        rowData.forEach((val, vi) => {
          doc
            .fontSize(7.5)
            .fillColor("#1e293b")
            .font("Helvetica")
            .text(val, rx, y + 4, { width: cw[vi] - 3, ellipsis: true });
          rx += cw[vi];
        });
        statusBadge(doc, app.status || "pending", rx, y + 2);

        y += 16;
      });

      drawFooter(doc, 1, 1, `Event Report — ${event.title}`);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

exports.generateSchoolReportPDF = async (school, applications, events) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const buffers = [];
      doc.on("data", (b) => buffers.push(b));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const date = new Date().toLocaleDateString("en-LK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      drawHeader(doc, "SCHOOL REPORT", school.name, date);

      let y = 115;

      y = sectionHeader(doc, "SCHOOL INFORMATION", y);
      y += 6;

      [
        ["School Name", school.name],
        ["School Code", school.code],
        ["District", school.district],
        ["Province", school.province],
        ["Zone", school.zone],
        ["Contact Email", school.contactEmail],
        ["Contact Phone", school.contactPhone],
        ["Status", school.isActive ? "Active" : "Inactive"],
      ].forEach(([label, val]) => {
        doc
          .fontSize(8)
          .fillColor("#64748b")
          .font("Helvetica")
          .text(label + ":", MARGIN + 4, y);
        doc
          .fontSize(8)
          .fillColor("#1e293b")
          .font("Helvetica-Bold")
          .text(val || "—", MARGIN + 130, y, { width: CW - 134 });
        y += 14;
      });

      y += 10;

      y = sectionHeader(doc, "APPLICATION STATISTICS", y, "#475569");
      y += 8;

      const statBoxes = [
        {
          label: "Total Applications",
          val: applications.length,
          color: "#1a3a5c",
        },
        {
          label: "Approved",
          val: applications.filter((a) => a.status === "approved").length,
          color: "#16a34a",
        },
        {
          label: "Pending",
          val: applications.filter((a) => a.status === "pending").length,
          color: "#d97706",
        },
        {
          label: "Rejected",
          val: applications.filter((a) => a.status === "rejected").length,
          color: "#dc2626",
        },
      ];

      statBoxes.forEach((s, i) => {
        const bx = MARGIN + i * (CW / 4 + 2);
        doc.roundedRect(bx, y, CW / 4 - 4, 44, 6).fill(s.color);
        doc
          .fontSize(18)
          .fillColor("#fff")
          .font("Helvetica-Bold")
          .text(String(s.val), bx + 8, y + 5);
        doc
          .fontSize(7.5)
          .fillColor("rgba(255,255,255,0.8)")
          .font("Helvetica")
          .text(s.label, bx + 8, y + 30);
      });

      y += 58;

      y = sectionHeader(doc, "STUDENT APPLICATIONS", y);
      y += 2;

      const cols = [
        "Reg. No",
        "Student Name",
        "Event",
        "Grade",
        "Date",
        "Status",
      ];
      const cw = [90, 120, 160, 50, 75, 60];

      doc.rect(MARGIN, y, CW, 18).fill("#334155");
      let cx = MARGIN + 3;
      cols.forEach((col, i) => {
        doc
          .fontSize(7.5)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text(col, cx, y + 5, { width: cw[i] - 3 });
        cx += cw[i];
      });
      y += 18;

      applications.forEach((app, idx) => {
        if (y > H - 50) {
          doc.addPage({ size: "A4", margin: 0 });
          y = 30;
        }
        const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
        doc.rect(MARGIN, y, CW, 16).fill(bg);

        const rowData = [
          app.registrationNumber || "—",
          app.fullName || "—",
          app.event?.title || "—",
          `Grade ${app.grade}`,
          app.createdAt
            ? new Date(app.createdAt).toLocaleDateString("en-LK")
            : "—",
        ];
        let rx = MARGIN + 3;
        rowData.forEach((val, vi) => {
          doc
            .fontSize(7.5)
            .fillColor("#1e293b")
            .font("Helvetica")
            .text(val, rx, y + 4, { width: cw[vi] - 3, ellipsis: true });
          rx += cw[vi];
        });
        statusBadge(doc, app.status || "pending", rx, y + 2);
        y += 16;
      });

      drawFooter(doc, 1, 1, `School Report — ${school.name}`);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

exports.generateAllApplicationsExcel = async (applications) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Dhaham EMS";
  wb.created = new Date();

  const ws = wb.addWorksheet("All Applications", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  ws.mergeCells("A1:J1");
  ws.getCell("A1").value = "DHAHAM SCHOOL EVENT MANAGEMENT SYSTEM";
  ws.getCell("A1").font = { bold: true, size: 16, color: { argb: "FF1A3A5C" } };
  ws.getCell("A1").alignment = { horizontal: "center" };

  ws.mergeCells("A2:J2");
  ws.getCell("A2").value =
    "Applications Report — Generated: " +
    new Date().toLocaleDateString("en-LK");
  ws.getCell("A2").font = { size: 11, color: { argb: "FF64748B" } };
  ws.getCell("A2").alignment = { horizontal: "center" };

  ws.addRow([]);

  ws.mergeCells("A4:B4");
  ws.getCell("A4").value = "Total: " + applications.length;
  ws.getCell("A4").font = { bold: true, size: 11 };

  ws.mergeCells("C4:D4");
  ws.getCell("C4").value =
    "Pending: " + applications.filter((a) => a.status === "pending").length;
  ws.getCell("C4").font = { bold: true, color: { argb: "FF92400E" } };

  ws.mergeCells("E4:F4");
  ws.getCell("E4").value =
    "Approved: " + applications.filter((a) => a.status === "approved").length;
  ws.getCell("E4").font = { bold: true, color: { argb: "FF065F46" } };

  ws.mergeCells("G4:H4");
  ws.getCell("G4").value =
    "Rejected: " + applications.filter((a) => a.status === "rejected").length;
  ws.getCell("G4").font = { bold: true, color: { argb: "FF991B1B" } };

  ws.addRow([]);

  const headers = [
    "Registration No",
    "Full Name",
    "School",
    "District",
    "Event",
    "Grade",
    "Date of Birth",
    "Email",
    "Phone",
    "Date Applied",
    "Status",
    "Admin Note",
  ];
  const headerRow = ws.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A3A5C" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = { bottom: { style: "thin", color: { argb: "FFADD8E6" } } };
  });
  headerRow.height = 22;

  ws.columns = [
    { key: "regNo", width: 18 },
    { key: "name", width: 24 },
    { key: "school", width: 28 },
    { key: "district", width: 16 },
    { key: "event", width: 30 },
    { key: "grade", width: 10 },
    { key: "dob", width: 14 },
    { key: "email", width: 28 },
    { key: "phone", width: 14 },
    { key: "dateApplied", width: 14 },
    { key: "status", width: 12 },
    { key: "note", width: 30 },
  ];

  const statusFills = {
    pending: { fgColor: { argb: "FFFEF3C7" } },
    approved: { fgColor: { argb: "FFD1FAE5" } },
    rejected: { fgColor: { argb: "FFFEE2E2" } },
  };
  const statusFonts = {
    pending: { color: { argb: "FF92400E" }, bold: true },
    approved: { color: { argb: "FF065F46" }, bold: true },
    rejected: { color: { argb: "FF991B1B" }, bold: true },
  };

  applications.forEach((app, i) => {
    const row = ws.addRow([
      app.registrationNumber || "",
      app.fullName || "",
      app.schoolName || "",
      app.school?.district || "",
      app.event?.title || "",
      `Grade ${app.grade}`,
      app.dateOfBirth
        ? new Date(app.dateOfBirth).toLocaleDateString("en-LK")
        : "",
      app.email || "",
      app.phoneNumber || "",
      app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-LK") : "",
      (app.status || "pending").toUpperCase(),
      app.adminNote || "",
    ]);

    const fillColor = i % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor },
      };
      cell.alignment = { vertical: "middle" };
      cell.font = { size: 9 };
    });

    const statusCell = row.getCell(11);
    const s = app.status || "pending";
    statusCell.fill = {
      type: "pattern",
      pattern: "solid",
      ...(statusFills[s] || statusFills.pending),
    };
    statusCell.font = { ...(statusFonts[s] || statusFonts.pending), size: 9 };
    statusCell.alignment = { horizontal: "center", vertical: "middle" };

    row.height = 18;
  });

  ws.views = [{ state: "frozen", ySplit: 6 }];

  return await wb.xlsx.writeBuffer();
};

exports.generateSchoolReportExcel = async (schools, allApplications) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Dhaham EMS";

  const summary = wb.addWorksheet("Summary");
  summary.mergeCells("A1:F1");
  summary.getCell("A1").value = "SCHOOL-WISE APPLICATIONS REPORT";
  summary.getCell("A1").font = {
    bold: true,
    size: 15,
    color: { argb: "FF1A3A5C" },
  };
  summary.getCell("A1").alignment = { horizontal: "center" };

  summary.mergeCells("A2:F2");
  summary.getCell("A2").value =
    "Generated: " + new Date().toLocaleDateString("en-LK");
  summary.getCell("A2").alignment = { horizontal: "center" };
  summary.getCell("A2").font = { color: { argb: "FF64748B" } };

  summary.addRow([]);

  const summaryHeaders = [
    "School Name",
    "District",
    "Province",
    "Total",
    "Approved",
    "Pending",
    "Rejected",
  ];
  const sh = summary.addRow(summaryHeaders);
  sh.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A3A5C" },
    };
    cell.alignment = { horizontal: "center" };
  });

  summary.columns = [
    { width: 32 },
    { width: 16 },
    { width: 16 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
  ];

  schools.forEach((school, i) => {
    const apps = allApplications.filter(
      (a) => a.schoolId === school.id || a.schoolName === school.name,
    );
    const bg = i % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
    const row = summary.addRow([
      school.name,
      school.district,
      school.province,
      apps.length,
      apps.filter((a) => a.status === "approved").length,
      apps.filter((a) => a.status === "pending").length,
      apps.filter((a) => a.status === "rejected").length,
    ]);
    row.eachCell((cell, i2) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
      if (i2 >= 4) cell.alignment = { horizontal: "center" };
    });

    if (apps.length > 0) {
      const ws = wb.addWorksheet(school.code || school.name.substring(0, 20));
      ws.mergeCells("A1:H1");
      ws.getCell("A1").value = school.name + " — Applications";
      ws.getCell("A1").font = {
        bold: true,
        size: 13,
        color: { argb: "FF1A3A5C" },
      };
      ws.addRow([]);

      const headers = [
        "Reg. No",
        "Full Name",
        "Event",
        "Grade",
        "Email",
        "Phone",
        "Date Applied",
        "Status",
      ];
      const hr = ws.addRow(headers);
      hr.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1A3A5C" },
        };
        cell.alignment = { horizontal: "center" };
      });

      ws.columns = [
        { width: 18 },
        { width: 26 },
        { width: 30 },
        { width: 10 },
        { width: 28 },
        { width: 14 },
        { width: 14 },
        { width: 12 },
      ];

      apps.forEach((app, ai) => {
        const bg2 = ai % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
        const r = ws.addRow([
          app.registrationNumber || "",
          app.fullName || "",
          app.event?.title || "",
          `Grade ${app.grade}`,
          app.email || "",
          app.phoneNumber || "",
          app.createdAt
            ? new Date(app.createdAt).toLocaleDateString("en-LK")
            : "",
          (app.status || "pending").toUpperCase(),
        ]);
        r.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bg2 },
          };
          cell.font = { size: 9 };
        });
      });
    }
  });

  return await wb.xlsx.writeBuffer();
};

exports.generateEventReportExcel = async (events, allApplications) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Dhaham EMS";

  const summary = wb.addWorksheet("Summary");
  summary.mergeCells("A1:G1");
  summary.getCell("A1").value = "EVENT-WISE APPLICATIONS REPORT";
  summary.getCell("A1").font = {
    bold: true,
    size: 15,
    color: { argb: "FF1A3A5C" },
  };
  summary.getCell("A1").alignment = { horizontal: "center" };
  summary.addRow([]);

  const sh = summary.addRow([
    "Event Title",
    "Type",
    "Event Date",
    "Venue",
    "Total",
    "Approved",
    "Pending",
  ]);
  sh.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1A3A5C" },
    };
    cell.alignment = { horizontal: "center" };
  });
  summary.columns = [
    { width: 36 },
    { width: 12 },
    { width: 14 },
    { width: 28 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
  ];

  events.forEach((event, i) => {
    const apps = allApplications.filter((a) => a.eventId === event.id);
    const bg = i % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
    const r = summary.addRow([
      event.title,
      (event.type || "").toUpperCase(),
      event.eventDate
        ? new Date(event.eventDate).toLocaleDateString("en-LK")
        : "",
      event.venue || "",
      apps.length,
      apps.filter((a) => a.status === "approved").length,
      apps.filter((a) => a.status === "pending").length,
    ]);
    r.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
    });

    if (apps.length > 0) {
      const ws = wb.addWorksheet(event.title.substring(0, 25));
      ws.mergeCells("A1:G1");
      ws.getCell("A1").value = event.title;
      ws.getCell("A1").font = {
        bold: true,
        size: 12,
        color: { argb: "FF1A3A5C" },
      };
      ws.addRow([]);

      const headers = [
        "Reg. No",
        "Student Name",
        "School",
        "Grade",
        "Email",
        "Phone",
        "Status",
      ];
      const hr = ws.addRow(headers);
      hr.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1A3A5C" },
        };
      });
      ws.columns = [
        { width: 18 },
        { width: 26 },
        { width: 28 },
        { width: 10 },
        { width: 28 },
        { width: 14 },
        { width: 12 },
      ];

      apps.forEach((app, ai) => {
        const bg2 = ai % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF";
        const r2 = ws.addRow([
          app.registrationNumber || "",
          app.fullName || "",
          app.schoolName || "",
          `Grade ${app.grade}`,
          app.email || "",
          app.phoneNumber || "",
          (app.status || "").toUpperCase(),
        ]);
        r2.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: bg2 },
          };
          cell.font = { size: 9 };
        });
      });
    }
  });

  return await wb.xlsx.writeBuffer();
};

exports.generateResultsPDF = async (results) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buffers = [];
      doc.on('data', b => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const date = new Date().toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' });
      drawHeader(doc, 'RESULTS REPORT', 'Dhaham School Event Management System', date);

      let y = 115;
      const medals = { 1: '1st', 2: '2nd', 3: '3rd' };
      const medalColors = { 1: '#fef9c3', 2: '#f1f5f9', 3: '#fef3c7' };

      results.forEach((result, ri) => {
        if (y > H - 100) {
          doc.addPage({ size: 'A4', margin: 0 });
          y = 30;
        }

        y = sectionHeader(doc, 'EVENT: ' + (result.event?.title || 'Unknown'), y, ri % 2 === 0 ? '#1a3a5c' : '#7c3aed');
        y += 6;

        doc.fontSize(8).fillColor('#64748b').font('Helvetica')
          .text(
            'Date: ' + (result.event?.eventDate ? new Date(result.event.eventDate).toLocaleDateString('en-LK') : '-') +
            '   |   Published: ' + (result.publishedAt ? new Date(result.publishedAt).toLocaleDateString('en-LK') : 'Not published') +
            '   |   Total Entries: ' + (result.entries?.length || 0),
            MARGIN + 4, y
          );
        y += 16;

        if (!result.entries?.length) {
          doc.fontSize(8).fillColor('#94a3b8').font('Helvetica').text('No entries recorded.', MARGIN + 4, y);
          y += 20;
          return;
        }

        const cols = ['Position', 'Student Name', 'School', 'Grade', 'Score'];
        const cw = [55, 150, 150, 55, 55];

        doc.rect(MARGIN, y, CW, 16).fill('#334155');
        let cx = MARGIN + 3;
        cols.forEach((col, i) => {
          doc.fontSize(7.5).fillColor('#ffffff').font('Helvetica-Bold').text(col, cx, y + 4, { width: cw[i] - 3 });
          cx += cw[i];
        });
        y += 16;

        result.entries.sort((a, b) => a.position - b.position).forEach((entry, ei) => {
          if (y > H - 50) {
            doc.addPage({ size: 'A4', margin: 0 });
            y = 30;
          }
          const bg = medalColors[entry.position] || (ei % 2 === 0 ? '#f8fafc' : '#ffffff');
          doc.rect(MARGIN, y, CW, 16).fill(bg);
          let rx = MARGIN + 3;
          const rowData = [
            (medals[entry.position] || '') + ' #' + entry.position,
            entry.studentName || '-',
            entry.schoolName || '-',
            'Grade ' + (entry.grade || '-'),
            entry.score !== undefined ? String(entry.score) + ' pts' : '-',
          ];
          rowData.forEach((val, vi) => {
            doc.fontSize(7.5)
              .fillColor('#1e293b')
              .font(entry.position <= 3 ? 'Helvetica-Bold' : 'Helvetica')
              .text(val, rx, y + 4, { width: cw[vi] - 3, ellipsis: true });
            rx += cw[vi];
          });
          y += 16;
        });

        y += 12;
      });

      drawFooter(doc, 1, 1, 'Results Report');
      doc.end();
    } catch (err) { reject(err); }
  });
};

exports.generateResultsExcel = async (results) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Dhaham EMS';

  const summary = wb.addWorksheet('Summary');
  summary.mergeCells('A1:F1');
  summary.getCell('A1').value = 'EVENT RESULTS REPORT — DHAHAM EMS';
  summary.getCell('A1').font = { bold: true, size: 15, color: { argb: 'FF1A3A5C' } };
  summary.getCell('A1').alignment = { horizontal: 'center' };

  summary.mergeCells('A2:F2');
  summary.getCell('A2').value = 'Generated: ' + new Date().toLocaleDateString('en-LK');
  summary.getCell('A2').alignment = { horizontal: 'center' };
  summary.addRow([]);

  const sh = summary.addRow(['Event', 'Type', 'Event Date', 'Total Entries', 'Published', 'Published Date']);
  sh.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5C' } };
    cell.alignment = { horizontal: 'center' };
  });
  summary.columns = [{ width: 36 }, { width: 14 }, { width: 16 }, { width: 14 }, { width: 12 }, { width: 16 }];

  results.forEach((result, i) => {
    const bg = i % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF';
    const r = summary.addRow([
      result.event?.title || '-',
      (result.event?.type || '').toUpperCase(),
      result.event?.eventDate ? new Date(result.event.eventDate).toLocaleDateString('en-LK') : '-',
      result.entries?.length || 0,
      result.isPublished ? 'YES' : 'NO',
      result.publishedAt ? new Date(result.publishedAt).toLocaleDateString('en-LK') : '-',
    ]);
    r.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    });

    if (result.entries?.length) {
      const ws = wb.addWorksheet((result.event?.title || 'Event').substring(0, 25));
      ws.mergeCells('A1:F1');
      ws.getCell('A1').value = result.event?.title || 'Results';
      ws.getCell('A1').font = { bold: true, size: 13, color: { argb: 'FF1A3A5C' } };
      ws.addRow([]);

      const headers = ['Position', 'Student Name', 'School', 'Grade', 'Score', 'Medal'];
      const hr = ws.addRow(headers);
      hr.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5C' } };
        cell.alignment = { horizontal: 'center' };
      });
      ws.columns = [{ width: 12 }, { width: 26 }, { width: 28 }, { width: 10 }, { width: 12 }, { width: 10 }];

      const medalFills = {
        1: { fgColor: { argb: 'FFFEF9C3' } },
        2: { fgColor: { argb: 'FFF1F5F9' } },
        3: { fgColor: { argb: 'FFFEF3C7' } },
      };

      result.entries.sort((a, b) => a.position - b.position).forEach((entry) => {
        const r2 = ws.addRow([
          entry.position,
          entry.studentName || '',
          entry.schoolName || '',
          'Grade ' + (entry.grade || ''),
          entry.score !== undefined ? entry.score : '',
          entry.position === 1 ? 'GOLD' : entry.position === 2 ? 'SILVER' : entry.position === 3 ? 'BRONZE' : '',
        ]);
        const fillColor = medalFills[entry.position] || { fgColor: { argb: 'FFFFFFFF' } };
        r2.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', ...fillColor };
          if (entry.position <= 3) cell.font = { bold: true };
        });
      });
    }
  });

  return await wb.xlsx.writeBuffer();
};
