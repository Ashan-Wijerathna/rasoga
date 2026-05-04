const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

exports.generateResozaPDF = async (application, event) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        info: { Title: "Resogha 2026 - Application Form", Author: "Dhaham EMS" },
      });
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const W = 595.28;
      const H = 841.89;
      const M = 36;
      const CW = W - M * 2;

      doc.rect(0, 0, W, 110).fill("#1a3a5c");
      doc.rect(0, 0, W, 4).fill("#c8a951");

      doc.fontSize(14).fillColor("#ffffff").font("Helvetica-Bold");
      doc
        .fontSize(9)
        .fillColor("#c8a951")
        .font("Helvetica")
        .text("Literary Grand Festival RASOGHA 2026", M + 64, 36, {
          width: CW - 170,
        });
      doc
        .fontSize(8)
        .fillColor("rgba(255,255,255,0.7)")
        .font("Helvetica")
        .text("Ayudumpathhraya / Application Form", M + 64, 50, {
          width: CW - 170,
        });
      doc
        .fontSize(8)
        .fillColor("rgba(255,255,255,0.55)")
        .font("Helvetica")
        .text("Dhaham EMS — Official Document", M + 64, 64, {
          width: CW - 170,
        });

      doc.roundedRect(W - M - 150, 18, 150, 48, 5).fill("#c8a951");
      doc
        .fontSize(7)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text("REGISTRATION NUMBER", W - M - 145, 26, {
          width: 100,
          align: "center",
        });
      doc
        .fontSize(11)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text(application.registrationNumber || "—", W - M - 145, 40, {
          width: 140,
          align: "center",
        });

      let y = 120;

      const statusColors = {
        pending: { bg: "#fef3c7", text: "#92400e", label: "PENDING REVIEW" },
        approved: { bg: "#d1fae5", text: "#065f46", label: "APPROVED" },
        rejected: { bg: "#fee2e2", text: "#991b1b", label: "REJECTED" },
      };
      const sc = statusColors[application.status] || statusColors.pending;
      doc.rect(M, y, CW, 22).fill(sc.bg);
      doc
        .fontSize(9)
        .fillColor(sc.text)
        .font("Helvetica-Bold")
        .text(`Status: ${sc.label}`, M + 8, y + 7);
      y += 30;

      doc.rect(M, y, CW, 18).fill("#1a3a5c");
      doc
        .fontSize(9)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text("A — STUDENT DETAILS / SISHU WISTHARA", M + 8, y + 5);
      y += 18;

      const PHOTO_W = 90;
      const PHOTO_H = 115;
      const PHOTO_X = W - M - PHOTO_W;
      const sectionAStartY = y;

      const rows = [
        [
          "Full Name (Sinhala) / Nama (Sinhala)",
          application.studentNameSinhala || "—",
        ],
        [
          "Full Name (English) / Nama (English)",
          application.studentNameEnglish || application.fullName || "—",
        ],
        ["Address / Lipinaya", application.address || "—"],
        ["Regional Zone / Kalapaya", application.regionalEducationZone || "—"],
        ["Dhamma School / Dharma Pasala", application.schoolName || "—"],
        ["Competency / Dakshatha", application.competencyAssessment || "—"],
        ["Email", application.email || "—"],
        ["Phone", application.phoneNumber || "—"],
      ];

      const colW = CW - PHOTO_W - 16;
      rows.forEach(([label, value], i) => {
        const bg = i % 2 === 0 ? "#f8fafc" : "#ffffff";
        doc.rect(M, y, colW, 16).fill(bg);
        doc
          .fontSize(8)
          .fillColor("#64748b")
          .font("Helvetica")
          .text(label + ":", M + 4, y + 4);
        doc
          .fontSize(8)
          .fillColor("#1e293b")
          .font("Helvetica-Bold")
          .text(value, M + 170, y + 4, { width: colW - 174, ellipsis: true });
        y += 16;
      });

      const photoBoxY = sectionAStartY;
      doc
        .rect(PHOTO_X - 4, photoBoxY - 2, PHOTO_W + 8, PHOTO_H + 20)
        .fill("#f8fafc")
        .stroke("#1a3a5c");
      let photoEmbedded = false;
      if (application.passportPhotoUrl) {
        try {
          const photoPath = path.join(
            __dirname,
            "../",
            application.passportPhotoUrl.replace("/uploads/", "uploads/"),
          );
          if (fs.existsSync(photoPath)) {
            doc.image(photoPath, PHOTO_X, photoBoxY, {
              width: PHOTO_W,
              height: PHOTO_H,
              cover: [PHOTO_W, PHOTO_H],
            });
            photoEmbedded = true;
          }
        } catch (e) {

        }
      }
      if (!photoEmbedded) {
        doc.rect(PHOTO_X, photoBoxY, PHOTO_W, PHOTO_H).fill("#e2e8f0");
        doc
          .fontSize(7)
          .fillColor("#94a3b8")
          .font("Helvetica")
          .text("Passport Photo", PHOTO_X, photoBoxY + PHOTO_H / 2 - 6, {
            width: PHOTO_W,
            align: "center",
          });
      }
      doc
        .fontSize(6)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text("PASSPORT PHOTO", PHOTO_X, photoBoxY + PHOTO_H + 6, {
          width: PHOTO_W,
          align: "center",
        });

      y = Math.max(y, sectionAStartY + PHOTO_H + 26) + 10;

      doc.rect(M, y, CW, 18).fill("#1a3a5c");
      doc
        .fontSize(9)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text(
          "B — CLASS TEACHER CERTIFICATION / GURU SAHATHTHIKAYA",
          M + 8,
          y + 5,
        );
      y += 18;

      doc.rect(M, y, CW, 44).fill("#fffbeb").stroke("#c8a951");
      doc
        .fontSize(8)
        .fillColor("#92400e")
        .font("Helvetica")
        .text(
          "I hereby certify that the above information is correct and the student is duly registered at this Dhamma School.",
          M + 8,
          y + 6,
          { width: CW - 16 },
        );
      doc
        .fontSize(7)
        .fillColor("#92400e")
        .font("Helvetica")
        .text(
          "(Mema sishuwa/sisihuwa mema dharma pasalaye liyapadincuwa athi bawa sahatheeka karami.)",
          M + 8,
          y + 22,
          { width: CW - 16 },
        );
      y += 44;

      const certCols = CW / 3;
      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Teacher Name:", M + 4, y + 4);
      doc
        .fontSize(8)
        .fillColor("#1e293b")
        .font("Helvetica-Bold")
        .text(application.classTeacherName || "—", M + 80, y + 4, {
          width: certCols - 84,
        });

      const sigBoxY = y + 2;
      if (application.classTeacherSignatureUrl) {
        try {
          const sigPath = path.join(
            __dirname,
            "../",
            application.classTeacherSignatureUrl.replace(
              "/uploads/",
              "uploads/",
            ),
          );
          if (fs.existsSync(sigPath)) {
            doc.image(sigPath, M + certCols + 4, sigBoxY, {
              width: certCols - 8,
              height: 36,
              fit: [certCols - 8, 36],
            });
          }
        } catch (e) {

        }
      }
      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Teacher Signature", M + certCols + 4, sigBoxY + 28);

      if (application.principalSignatureUrl) {
        try {
          const prinPath = path.join(
            __dirname,
            "../",
            application.principalSignatureUrl.replace("/uploads/", "uploads/"),
          );
          if (fs.existsSync(prinPath)) {
            doc.image(prinPath, M + certCols * 2 + 4, sigBoxY, {
              width: certCols - 8,
              height: 36,
              fit: [certCols - 8, 36],
            });
          }
        } catch (e) {

        }
      }
      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Principal Signature & Seal", M + certCols * 2 + 4, sigBoxY + 28);

      y += 50;

      const EVAL_H = 160;
      if (y + EVAL_H > H - 50) {
        doc.addPage({ size: "A4", margin: 0 });
        y = 30;
      }

      doc.rect(M, y, CW, 18).fill("#c8a951");
      doc
        .fontSize(9)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text(
          "D — FOR OFFICIAL USE ONLY / RASMI PRAYOJANAYA PARAMA",
          M + 8,
          y + 5,
        );
      y += 18;

      const evColW = CW / 3;
      doc
        .rect(M, y, CW, EVAL_H - 18)
        .fill("#fffdf0")
        .stroke("#c8a951");

      const r1x = M + 4;
      doc
        .fontSize(8)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text("ROUND 1 EVALUATION", r1x, y + 4, { width: evColW - 8 });
      [
        [
          "Date",
          application.round1Date
            ? new Date(application.round1Date).toLocaleDateString("en-LK")
            : "",
        ],
        ["Student No.", application.round1StudentNumber || ""],
        ["Competency", application.round1CompetencyAssessment || ""],
        ["Evaluator Sig", ""],
      ].forEach(([label, val], i) => {
        const ry = y + 18 + i * 26;
        doc
          .fontSize(7)
          .fillColor("#64748b")
          .font("Helvetica")
          .text(label + ":", r1x, ry);
        doc
          .fontSize(8)
          .fillColor("#1e293b")
          .font("Helvetica-Bold")
          .text(val || ".....................", r1x, ry + 9, {
            width: evColW - 8,
          });
      });

      const r2x = M + evColW + 4;
      doc
        .fontSize(8)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text("FINAL RESULTS", r2x, y + 4, { width: evColW - 8 });
      [
        ["Student No.", application.finalStudentNumber || ""],
        ["Competency", application.finalCompetencyAssessment || ""],
        ["Rank/Placement", application.finalRankObtained || ""],
        ["Evaluator Sig", ""],
      ].forEach(([label, val], i) => {
        const ry = y + 18 + i * 26;
        doc
          .fontSize(7)
          .fillColor("#64748b")
          .font("Helvetica")
          .text(label + ":", r2x, ry);
        doc
          .fontSize(8)
          .fillColor("#1e293b")
          .font("Helvetica-Bold")
          .text(val || ".....................", r2x, ry + 9, {
            width: evColW - 8,
          });
      });

      const r3x = M + evColW * 2 + 4;
      doc
        .rect(r3x, y + 4, evColW - 8, EVAL_H - 30)
        .fill("#fff")
        .stroke("#c8a951");
      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Official Stamp / Rasmi Mudhrawa", r3x + 4, y + EVAL_H - 38, {
          width: evColW - 16,
          align: "center",
        });

      y += EVAL_H;

      doc.rect(0, H - 30, W, 30).fill("#1a3a5c");
      doc
        .fontSize(7)
        .fillColor("#c8a951")
        .font("Helvetica-Bold")
        .text("DHAHAM EMS — RESOZA 2026", M, H - 20);
      doc
        .fontSize(7)
        .fillColor("rgba(255,255,255,0.7)")
        .font("Helvetica")
        .text(
          `Reg: ${application.registrationNumber}  |  Generated: ${new Date().toLocaleDateString("en-LK")}  |  Page 1`,
          M + CW / 2,
          H - 20,
          { width: CW / 2, align: "right" },
        );

      doc.addPage({ size: "A4", margin: 0 });
      doc.rect(0, 0, W, 70).fill("#1a3a5c");
      doc.rect(0, 0, W, 4).fill("#c8a951");
      doc
        .fontSize(14)
        .fillColor("#fff")
        .font("Helvetica-Bold")
        .text("APPLICATION SUMMARY", M, 22, { width: CW, align: "center" });
      doc
        .fontSize(9)
        .fillColor("#c8a951")
        .font("Helvetica")
        .text(
          "Resoza 2026 — " + (application.registrationNumber || ""),
          M,
          44,
          { width: CW, align: "center" },
        );

      let p2y = 85;
      doc.rect(M, p2y, CW, 18).fill("#475569");
      doc
        .fontSize(9)
        .fillColor("#fff")
        .font("Helvetica-Bold")
        .text("COMPLETE APPLICATION DATA", M + 8, p2y + 5);
      p2y += 18;

      const summaryRows = [
        ["Registration No", application.registrationNumber],
        ["Full Name (Sinhala)", application.studentNameSinhala || "—"],
        [
          "Full Name (English)",
          application.studentNameEnglish || application.fullName || "—",
        ],
        ["Regional Zone", application.regionalEducationZone || "—"],
        ["Dhamma School", application.schoolName || "—"],
        ["Competency Assessment", application.competencyAssessment || "—"],
        ["Class Teacher", application.classTeacherName || "—"],
        ["Email", application.email || "—"],
        ["Phone", application.phoneNumber || "—"],
        [
          "Date of Birth",
          application.dateOfBirth
            ? new Date(application.dateOfBirth).toLocaleDateString("en-LK")
            : "—",
        ],
        ["Event", event?.title || "—"],
        ["Application Status", (application.status || "pending").toUpperCase()],
        [
          "Submitted On",
          new Date(application.createdAt).toLocaleDateString("en-LK"),
        ],
      ];

      const half = Math.ceil(summaryRows.length / 2);
      summaryRows.forEach(([label, value], i) => {
        const col = i < half ? 0 : 1;
        const row = i < half ? i : i - half;
        const sx = M + col * (CW / 2 + 4);
        const sy = p2y + row * 18;
        doc
          .rect(sx, sy, CW / 2 - 4, 18)
          .fill(row % 2 === 0 ? "#f8fafc" : "#fff");
        doc
          .fontSize(7)
          .fillColor("#64748b")
          .font("Helvetica")
          .text(label + ":", sx + 4, sy + 5);
        doc
          .fontSize(8)
          .fillColor("#1e293b")
          .font("Helvetica-Bold")
          .text(value || "—", sx + 120, sy + 5, {
            width: CW / 2 - 124,
            ellipsis: true,
          });
      });

      doc.rect(0, H - 30, W, 30).fill("#1a3a5c");
      doc
        .fontSize(7)
        .fillColor("#c8a951")
        .font("Helvetica-Bold")
        .text("DHAHAM EMS — RESOZA 2026", M, H - 20);
      doc
        .fontSize(7)
        .fillColor("rgba(255,255,255,0.7)")
        .font("Helvetica")
        .text(
          `Reg: ${application.registrationNumber}  |  Page 2 of 2`,
          M + CW / 2,
          H - 20,
          { width: CW / 2, align: "right" },
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

exports.generateApplicationPDF = async (application, event, options = {}) => {
  const { includeBirthCert = true } = options;
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        info: {
          Title: "Dhaham School Event Application",
          Author: "Dhaham EMS",
        },
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const W = 595.28;
      const H = 841.89;
      const MARGIN = 40;
      const CONTENT_W = W - MARGIN * 2;

      const resolveUploadPath = (url) => {
        if (!url) return null;
        const cleanUrl = url.replace(/^\//, '');
        const tries = [
          path.join(__dirname, "..", cleanUrl),
          path.join(process.cwd(), cleanUrl),
          path.join(__dirname, "..", "uploads", "photos", path.basename(url)),
          path.join(
            __dirname,
            "..",
            "uploads",
            "documents",
            path.basename(url),
          ),
        ];
        for (const p of tries) {
          if (fs.existsSync(p)) return p;
        }
        return null;
      };

      doc.rect(0, 0, W, 100).fill("#1a3a5c");
      doc.rect(0, 0, W, 4).fill("#c8a951");

      doc.circle(64, 52, 20).fill("#c8a951");
      doc
        .fontSize(16)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text("D", 57, 43);

      const evTitleShort = (event?.title || application.eventTitle || "").slice(
        0,
        60,
      );
      doc
        .fontSize(13)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text("DHAHAM SCHOOL EVENT MANAGEMENT SYSTEM", 94, 14, {
          width: CONTENT_W - 175,
        });
      doc
        .fontSize(9)
        .fillColor("#c8a951")
        .font("Helvetica")
        .text("Official Event Application Form", 94, 32, {
          width: CONTENT_W - 175,
        });
      doc
        .fontSize(8)
        .fillColor("rgba(255,255,255,0.7)")
        .font("Helvetica")
        .text(evTitleShort || "Ministry of Education — Sri Lanka", 94, 44, {
          width: CONTENT_W - 175,
        });
      doc
        .fontSize(7)
        .fillColor("rgba(255,255,255,0.5)")
        .font("Helvetica")
        .text("Ministry of Education — Sri Lanka", 94, 56, {
          width: CONTENT_W - 175,
        });

      const REG_X = W - 195;
      doc.roundedRect(REG_X, 8, 155, 68, 6).fill("#c8a951");
      doc
        .fontSize(7)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text("REGISTRATION NUMBER", REG_X + 5, 16, {
          width: 145,
          align: "center",
        });
      doc
        .fontSize(14)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text(application.registrationNumber || "—", REG_X + 5, 32, {
          width: 145,
          align: "center",
        });

      const statusBadge = {
        pending: { bg: "#d97706", label: "PENDING REVIEW" },
        approved: { bg: "#16a34a", label: "APPROVED" },
        rejected: { bg: "#dc2626", label: "REJECTED" },
      };
      const sb = statusBadge[application.status] || statusBadge.pending;
      doc.roundedRect(REG_X, 80, 155, 18, 4).fill(sb.bg);
      doc
        .fontSize(9)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text(sb.label, REG_X + 5, 85, { width: 145, align: "center" });

      doc.rect(0, 100, W, 2).fill("#c8a951");

      doc.rect(MARGIN, 115, CONTENT_W, 70).fill("#f0f4f8");
      doc.rect(MARGIN, 115, 4, 70).fill("#c8a951");

      const evX1 = MARGIN + 12;
      const evX2 = MARGIN + CONTENT_W / 2 + 8;
      const evColW = CONTENT_W / 2 - 20;

      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("EVENT:", evX1, 122);
      doc
        .fontSize(10)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text((event?.title || "—").slice(0, 35), evX1 + 42, 121, {
          width: evColW,
        });

      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("DATE:", evX1, 139);
      doc
        .fontSize(9)
        .fillColor("#1e293b")
        .font("Helvetica")
        .text(
          event?.eventDate
            ? new Date(event.eventDate).toLocaleDateString("en-LK", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—",
          evX1 + 42,
          138,
          { width: evColW },
        );

      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("VENUE:", evX1, 155);
      doc
        .fontSize(9)
        .fillColor("#1e293b")
        .font("Helvetica")
        .text((event?.venue || "—").slice(0, 38), evX1 + 42, 154, {
          width: evColW,
        });

      const typeLabel = (event?.type || "school").toUpperCase();
      const typeColors = {
        SCHOOL: "#1a3a5c",
        ZONAL: "#7c3aed",
        PROVINCIAL: "#be123c",
      };
      const typeColor = typeColors[typeLabel] || "#475569";

      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("TYPE:", evX2, 122);
      doc
        .roundedRect(evX2 + 36, 118, typeLabel.length * 6 + 10, 14, 3)
        .fill(typeColor);
      doc
        .fontSize(7)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text(typeLabel, evX2 + 41, 122, { width: typeLabel.length * 6 + 5 });

      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("GRADE:", evX2, 139);
      doc
        .fontSize(9)
        .fillColor("#1e293b")
        .font("Helvetica")
        .text(`Grade ${application.grade || "—"}`, evX2 + 42, 138);

      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("DEADLINE:", evX2, 155);
      doc
        .fontSize(9)
        .fillColor("#1e293b")
        .font("Helvetica")
        .text(
          event?.applicationDeadline
            ? new Date(event.applicationDeadline).toLocaleDateString("en-LK")
            : "—",
          evX2 + 52,
          154,
        );

      let y = 195;
      const LEFT_W = CONTENT_W - 125;
      const PHOTO_W = 105;
      const PHOTO_H = 130;
      const PHOTO_X = W - MARGIN - PHOTO_W;
      const PHOTO_Y = 200;

      doc.rect(MARGIN, y, LEFT_W, 20).fill("#1a3a5c");
      doc.rect(MARGIN, y, 4, 20).fill("#c8a951");
      doc
        .fontSize(9)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text("PERSONAL DETAILS / Student Information", MARGIN + 10, y + 6, {
          width: LEFT_W - 14,
        });
      y += 20;

      const personalFields = [
        ["Full Name", application.fullName || "—"],
        [
          "Date of Birth",
          application.dateOfBirth
            ? new Date(application.dateOfBirth).toLocaleDateString("en-LK")
            : "—",
        ],
        ["Grade", `Grade ${application.grade || "—"}`],
        ["Dhaham School", application.schoolName || "—"],
        ["Gender", application.gender || "—"],
      ];

      personalFields.forEach(([label, value], i) => {
        doc
          .rect(MARGIN, y, LEFT_W, 18)
          .fill(i % 2 === 0 ? "#f8fafc" : "#ffffff");
        doc.rect(MARGIN, y + 17, LEFT_W, 1).fill("#f1f5f9");
        doc
          .fontSize(8)
          .fillColor("#64748b")
          .font("Helvetica")
          .text(label + ":", MARGIN + 6, y + 5, { width: 104 });
        doc
          .fontSize(9)
          .fillColor("#1e293b")
          .font("Helvetica-Bold")
          .text(value, MARGIN + 115, y + 5, {
            width: LEFT_W - 119,
            ellipsis: true,
          });
        y += 18;
      });

      doc
        .rect(PHOTO_X - 2, PHOTO_Y - 2, PHOTO_W + 4, PHOTO_H + 4)
        .stroke("#1a3a5c");

      let photoEmbedded = false;
      if (application.passportPhotoUrl) {
        const photoPath = resolveUploadPath(application.passportPhotoUrl);
        if (photoPath) {
          try {
            doc.image(photoPath, PHOTO_X, PHOTO_Y, {
              width: PHOTO_W,
              height: PHOTO_H,
              cover: [PHOTO_W, PHOTO_H],
            });
            photoEmbedded = true;
          } catch (e) {
            console.error("Photo embed failed:", e.message);
          }
        }
      }

      if (!photoEmbedded) {
        doc.rect(PHOTO_X, PHOTO_Y, PHOTO_W, PHOTO_H).fill("#f1f5f9");
        doc
          .moveTo(PHOTO_X + 15, PHOTO_Y + PHOTO_H / 2 - 1)
          .lineTo(PHOTO_X + PHOTO_W - 15, PHOTO_Y + PHOTO_H / 2 - 1)
          .stroke("#cbd5e1");
        doc
          .fontSize(8)
          .fillColor("#1a3a5c")
          .font("Helvetica")
          .text("PHOTO", PHOTO_X, PHOTO_Y + PHOTO_H / 2 - 12, {
            width: PHOTO_W,
            align: "center",
          });
        doc
          .fontSize(7)
          .fillColor("#94a3b8")
          .font("Helvetica")
          .text("Not Available", PHOTO_X, PHOTO_Y + PHOTO_H / 2 + 6, {
            width: PHOTO_W,
            align: "center",
          });
      }

      doc
        .fontSize(6)
        .fillColor("#1a3a5c")
        .font("Helvetica-Bold")
        .text("PASSPORT PHOTO", PHOTO_X - 2, PHOTO_Y + PHOTO_H + 6, {
          width: PHOTO_W + 4,
          align: "center",
        });
      doc
        .rect(PHOTO_X - 2, PHOTO_Y + PHOTO_H + 16, PHOTO_W + 4, 1)
        .fill("#c8a951");

      y = Math.max(y, PHOTO_Y + PHOTO_H + 24) + 12;

      doc.rect(MARGIN, y, CONTENT_W, 20).fill("#334155");
      doc.rect(MARGIN, y, 4, 20).fill("#c8a951");
      doc
        .fontSize(9)
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .text("CONTACT DETAILS / Contact Information", MARGIN + 10, y + 6);
      y += 20;

      const halfCW = CONTENT_W / 2;
      const rc = MARGIN + halfCW + 4;

      doc.rect(MARGIN, y, halfCW - 4, 22).fill("#f8fafc");
      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Email Address:", MARGIN + 6, y + 4);
      doc
        .fontSize(9)
        .fillColor("#1e293b")
        .font("Helvetica-Bold")
        .text(application.email || "—", MARGIN + 6, y + 13, {
          width: halfCW - 14,
          ellipsis: true,
        });

      doc.rect(rc, y, halfCW - 4, 22).fill("#ffffff");
      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Phone Number:", rc + 6, y + 4);
      doc
        .fontSize(9)
        .fillColor("#1e293b")
        .font("Helvetica-Bold")
        .text(application.phoneNumber || "—", rc + 6, y + 13, {
          width: halfCW - 14,
          ellipsis: true,
        });
      y += 22;

      doc.rect(MARGIN, y, halfCW - 4, 32).fill("#f8fafc");
      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Residential Address:", MARGIN + 6, y + 4);
      doc
        .fontSize(8)
        .fillColor("#1e293b")
        .font("Helvetica-Bold")
        .text(application.address || "—", MARGIN + 6, y + 14, {
          width: halfCW - 14,
          height: 16,
          ellipsis: true,
        });

      doc.rect(rc, y, halfCW - 4, 32).fill("#ffffff");
      doc
        .fontSize(7)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Applied On:", rc + 6, y + 4);
      doc
        .fontSize(9)
        .fillColor("#1e293b")
        .font("Helvetica-Bold")
        .text(
          new Date(application.createdAt).toLocaleDateString("en-LK", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          rc + 6,
          y + 14,
          { width: halfCW - 14 },
        );
      y += 36;

      if (application.adminNote) {
        y += 8;
        doc.rect(MARGIN, y, CONTENT_W, 20).fill("#7c3aed");
        doc.rect(MARGIN, y, 4, 20).fill("#4c1d95");
        doc
          .fontSize(9)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text("ADMIN NOTE / Administrator Note", MARGIN + 10, y + 6);
        y += 20;
        const noteLines = Math.ceil(application.adminNote.length / 90) + 1;
        const noteH = Math.max(32, noteLines * 14 + 16);
        doc.rect(MARGIN, y, CONTENT_W, noteH).fill("#faf5ff");
        doc.rect(MARGIN, y, 3, noteH).fill("#7c3aed");
        doc
          .fontSize(9)
          .fillColor("#1e293b")
          .font("Helvetica")
          .text(application.adminNote, MARGIN + 10, y + 8, {
            width: CONTENT_W - 20,
          });
        y += noteH;
      }

      y += 12;

      doc.rect(MARGIN, y, CONTENT_W, 48).fill("#eff6ff");
      doc.rect(MARGIN, y, CONTENT_W, 48).stroke("#bfdbfe");
      doc.rect(MARGIN, y, 3, 48).fill("#3b82f6");
      doc
        .fontSize(8)
        .fillColor("#1e40af")
        .font("Helvetica")
        .text(
          "I hereby declare that the information provided in this application is true and correct to the best of my knowledge. I understand that any false information may result in disqualification from the event.",
          MARGIN + 10,
          y + 8,
          { width: CONTENT_W - 20 },
        );
      y += 56;

      const sigLineY = y + 28;
      doc
        .moveTo(MARGIN, sigLineY)
        .lineTo(MARGIN + 160, sigLineY)
        .stroke("#1a3a5c");
      doc
        .fontSize(8)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Student / Parent Signature", MARGIN, sigLineY + 4);

      doc
        .moveTo(W - MARGIN - 120, sigLineY)
        .lineTo(W - MARGIN, sigLineY)
        .stroke("#1a3a5c");
      doc
        .fontSize(8)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Date", W - MARGIN - 120, sigLineY + 4);
      y += 48;

      y += 10;
      doc.rect(MARGIN, y, halfCW - 5, 52).fill("#f8fafc");
      doc.rect(MARGIN, y, halfCW - 5, 52).stroke("#e2e8f0");
      doc
        .fontSize(8)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Date Submitted", MARGIN + 8, y + 8);
      doc
        .fontSize(10)
        .fillColor("#1e293b")
        .font("Helvetica-Bold")
        .text(
          new Date(application.createdAt).toLocaleDateString("en-LK", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          MARGIN + 8,
          y + 22,
          { width: halfCW - 20 },
        );

      doc.rect(MARGIN + halfCW + 5, y, halfCW - 5, 52).fill("#f8fafc");
      doc.rect(MARGIN + halfCW + 5, y, halfCW - 5, 52).stroke("#e2e8f0");
      doc
        .fontSize(8)
        .fillColor("#64748b")
        .font("Helvetica")
        .text("Applied For", MARGIN + halfCW + 13, y + 8);
      doc
        .fontSize(10)
        .fillColor("#1e293b")
        .font("Helvetica-Bold")
        .text(
          (event?.title || "—").slice(0, 35),
          MARGIN + halfCW + 13,
          y + 22,
          { width: halfCW - 20 },
        );
      y += 60;

      if (!includeBirthCert && y + 90 < H - 50) {
        y += 12;
        doc.rect(MARGIN, y, CONTENT_W, 20).fill("#c8a951");
        doc
          .fontSize(9)
          .fillColor("#1a3a5c")
          .font("Helvetica-Bold")
          .text("FOR OFFICIAL USE ONLY / Official Use", MARGIN + 8, y + 6);
        y += 20;
        doc.rect(MARGIN, y, CONTENT_W, 72).fill("#fef9c3");
        doc.rect(MARGIN, y, CONTENT_W, 72).stroke("#fde047");
        const thirdW = CONTENT_W / 3;
        doc
          .fontSize(7)
          .fillColor("#854d0e")
          .font("Helvetica")
          .text("Authorized Signature:", MARGIN + 6, y + 8);
        doc
          .moveTo(MARGIN + 6, y + 50)
          .lineTo(MARGIN + thirdW - 6, y + 50)
          .stroke("#854d0e");
        doc
          .fontSize(7)
          .fillColor("#854d0e")
          .font("Helvetica")
          .text("Date:", MARGIN + thirdW + 6, y + 8);
        doc
          .moveTo(MARGIN + thirdW + 6, y + 50)
          .lineTo(MARGIN + thirdW * 2 - 6, y + 50)
          .stroke("#854d0e");
        doc
          .fontSize(7)
          .fillColor("#854d0e")
          .font("Helvetica")
          .text("Official Stamp:", MARGIN + thirdW * 2 + 6, y + 8);
        doc.rect(MARGIN + thirdW * 2 + 6, y + 18, 50, 44).fill("#fff");
        doc.rect(MARGIN + thirdW * 2 + 6, y + 18, 50, 44).stroke("#c8a951");
        y += 72;
      }

      doc.rect(0, H - 32, W, 2).fill("#c8a951");
      doc.rect(0, H - 30, W, 30).fill("#1a3a5c");
      doc
        .fontSize(7)
        .fillColor("#c8a951")
        .font("Helvetica-Bold")
        .text("DHAHAM SCHOOL EVENT MANAGEMENT SYSTEM", MARGIN, H - 19, {
          width: CONTENT_W * 0.55,
        });
      doc
        .fontSize(7)
        .fillColor("rgba(255,255,255,0.6)")
        .font("Helvetica")
        .text(
          `Page 1 ${includeBirthCert ? "of 3" : "of 1"}  |  ${application.registrationNumber || ""}  |  Generated: ${new Date().toLocaleDateString("en-LK")}`,
          MARGIN + CONTENT_W * 0.55,
          H - 19,
          { width: CONTENT_W * 0.45, align: "right" },
        );

      if (includeBirthCert) {
        doc.addPage({ size: "A4", margin: 0 });

        doc.rect(0, 0, W, 75).fill("#1a3a5c");
        doc.rect(0, 0, W, 4).fill("#c8a951");
        doc
          .fontSize(15)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text("BIRTH CERTIFICATE", MARGIN, 16, {
            width: CONTENT_W,
            align: "center",
          });
        doc
          .fontSize(9)
          .fillColor("#c8a951")
          .font("Helvetica")
          .text("Front Page", MARGIN, 38, {
            width: CONTENT_W,
            align: "center",
          });
        doc
          .fontSize(7)
          .fillColor("rgba(255,255,255,0.6)")
          .font("Helvetica")
          .text(
            `Applicant: ${application.fullName || "—"}  |  Reg: ${application.registrationNumber || "—"}`,
            MARGIN,
            54,
            { width: CONTENT_W, align: "center" },
          );

        const CERT_Y = 85;
        const CERT_H = H - CERT_Y - 45;
        let certEmbedded = false;

        if (application.birthCertificateUrl) {
          const ext = path
            .extname(application.birthCertificateUrl)
            .toLowerCase();
          const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
          const isPDF = ext === ".pdf";

          if (isImage) {
            const certPath = resolveUploadPath(application.birthCertificateUrl);
            if (certPath) {
              try {
                doc.image(certPath, MARGIN, CERT_Y, {
                  width: CONTENT_W,
                  height: CERT_H,
                  fit: [CONTENT_W, CERT_H],
                  align: "center",
                  valign: "center",
                });
                certEmbedded = true;
              } catch (e) {
                console.error("Cert embed failed:", e.message);
              }
            }
          }

          if (!certEmbedded) {
            doc.rect(MARGIN, CERT_Y, CONTENT_W, CERT_H).fill("#f8fafc");
            doc.rect(MARGIN, CERT_Y, CONTENT_W, CERT_H).stroke("#e2e8f0");
            const midY = CERT_Y + CERT_H / 2;
            if (isPDF) {
              doc
                .fontSize(14)
                .fillColor("#1a3a5c")
                .font("Helvetica-Bold")
                .text("Birth Certificate", MARGIN, midY - 42, {
                  width: CONTENT_W,
                  align: "center",
                });
              doc
                .fontSize(10)
                .fillColor("#64748b")
                .font("Helvetica")
                .text("(Uploaded as PDF document)", MARGIN, midY - 17, {
                  width: CONTENT_W,
                  align: "center",
                });
              doc
                .fontSize(9)
                .fillColor("#94a3b8")
                .font("Helvetica")
                .text(
                  "Please view the original PDF file for the birth certificate.",
                  MARGIN,
                  midY + 8,
                  { width: CONTENT_W, align: "center" },
                );
              const btnX = MARGIN + CONTENT_W / 2 - 130;
              doc.roundedRect(btnX, midY + 36, 260, 28, 6).fill("#1a3a5c");
              doc
                .fontSize(8)
                .fillColor("#ffffff")
                .font("Helvetica-Bold")
                .text(
                  'Use "Download Birth Certificate" button in admin panel',
                  btnX + 5,
                  midY + 47,
                  { width: 250, align: "center" },
                );
            } else {
              doc
                .fontSize(12)
                .fillColor("#94a3b8")
                .font("Helvetica")
                .text("Birth Certificate not available", MARGIN, midY - 10, {
                  width: CONTENT_W,
                  align: "center",
                });
            }
          }
        } else {
          doc.rect(MARGIN, CERT_Y, CONTENT_W, CERT_H).fill("#f8fafc");
          doc.rect(MARGIN, CERT_Y, CONTENT_W, CERT_H).stroke("#e2e8f0");
          doc
            .fontSize(12)
            .fillColor("#94a3b8")
            .font("Helvetica")
            .text(
              "No birth certificate uploaded",
              MARGIN,
              CERT_Y + CERT_H / 2 - 10,
              { width: CONTENT_W, align: "center" },
            );
        }

        doc.rect(0, H - 32, W, 2).fill("#c8a951");
        doc.rect(0, H - 30, W, 30).fill("#1a3a5c");
        doc
          .fontSize(7)
          .fillColor("#c8a951")
          .font("Helvetica-Bold")
          .text("DHAHAM SCHOOL EVENT MANAGEMENT SYSTEM", MARGIN, H - 19, {
            width: CONTENT_W * 0.55,
          });
        doc
          .fontSize(7)
          .fillColor("rgba(255,255,255,0.6)")
          .font("Helvetica")
          .text(
            `Page 2 of 3  |  ${application.registrationNumber || ""}  |  Birth Certificate Front`,
            MARGIN + CONTENT_W * 0.55,
            H - 19,
            { width: CONTENT_W * 0.45, align: "right" },
          );

        doc.addPage({ size: "A4", margin: 0 });

        doc.rect(0, 0, W, 75).fill("#1a3a5c");
        doc.rect(0, 0, W, 4).fill("#c8a951");
        doc
          .fontSize(15)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text("BIRTH CERTIFICATE", MARGIN, 16, {
            width: CONTENT_W,
            align: "center",
          });
        doc
          .fontSize(9)
          .fillColor("#c8a951")
          .font("Helvetica")
          .text("Back Page / Summary", MARGIN, 38, {
            width: CONTENT_W,
            align: "center",
          });
        doc
          .fontSize(7)
          .fillColor("rgba(255,255,255,0.6)")
          .font("Helvetica")
          .text(
            `Applicant: ${application.fullName || "—"}  |  Reg: ${application.registrationNumber || "—"}`,
            MARGIN,
            54,
            { width: CONTENT_W, align: "center" },
          );

        let p3y = 88;

        const BACK_H = 220;
        if (certEmbedded) {
          doc.rect(MARGIN, p3y, CONTENT_W, BACK_H).fill("#f0fdf4");
          doc.rect(MARGIN, p3y, CONTENT_W, BACK_H).stroke("#86efac");
          doc
            .fontSize(12)
            .fillColor("#166534")
            .font("Helvetica-Bold")
            .text(
              "Birth Certificate — Back Side",
              MARGIN,
              p3y + BACK_H / 2 - 20,
              { width: CONTENT_W, align: "center" },
            );
          doc
            .fontSize(9)
            .fillColor("#166534")
            .font("Helvetica")
            .text(
              "Please attach the back side of the original birth certificate",
              MARGIN,
              p3y + BACK_H / 2 + 6,
              { width: CONTENT_W, align: "center" },
            );
        } else {
          doc.rect(MARGIN, p3y, CONTENT_W, BACK_H).fill("#eff6ff");
          doc.rect(MARGIN, p3y, CONTENT_W, BACK_H).stroke("#bfdbfe");
          doc
            .fontSize(12)
            .fillColor("#1e40af")
            .font("Helvetica-Bold")
            .text(
              "Birth Certificate — Second Page",
              MARGIN,
              p3y + BACK_H / 2 - 20,
              { width: CONTENT_W, align: "center" },
            );
          doc
            .fontSize(9)
            .fillColor("#3b82f6")
            .font("Helvetica")
            .text(
              "Please attach page 2 of the original birth certificate if applicable",
              MARGIN,
              p3y + BACK_H / 2 + 6,
              { width: CONTENT_W, align: "center" },
            );
        }
        p3y += BACK_H + 12;

        doc.rect(MARGIN, p3y, CONTENT_W, 20).fill("#475569");
        doc.rect(MARGIN, p3y, 4, 20).fill("#c8a951");
        doc
          .fontSize(9)
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .text("APPLICATION SUMMARY", MARGIN + 10, p3y + 6);
        p3y += 20;

        const summaryData = [
          ["Registration No", application.registrationNumber || "—"],
          ["Full Name", application.fullName || "—"],
          [
            "Date of Birth",
            application.dateOfBirth
              ? new Date(application.dateOfBirth).toLocaleDateString("en-LK")
              : "—",
          ],
          ["Grade", `Grade ${application.grade || "—"}`],
          ["School", application.schoolName || "—"],
          ["Email", application.email || "—"],
          ["Phone", application.phoneNumber || "—"],
          ["Event", event?.title || "—"],
          [
            "Event Date",
            event?.eventDate
              ? new Date(event.eventDate).toLocaleDateString("en-LK")
              : "—",
          ],
          ["Status", (application.status || "pending").toUpperCase()],
          [
            "Applied Date",
            new Date(application.createdAt).toLocaleDateString("en-LK"),
          ],
          [
            "Reviewed Date",
            application.reviewedAt
              ? new Date(application.reviewedAt).toLocaleDateString("en-LK")
              : "—",
          ],
        ];

        const half = Math.ceil(summaryData.length / 2);
        summaryData.forEach(([label, value], i) => {
          const col = i < half ? 0 : 1;
          const row = i < half ? i : i - half;
          const sx = MARGIN + col * (CONTENT_W / 2 + 4);
          const sy = p3y + row * 18;
          doc
            .rect(sx, sy, CONTENT_W / 2 - 4, 18)
            .fill(row % 2 === 0 ? "#f8fafc" : "#ffffff");
          doc
            .fontSize(7)
            .fillColor("#64748b")
            .font("Helvetica")
            .text(label + ":", sx + 4, sy + 5);
          doc
            .fontSize(8)
            .fillColor("#1e293b")
            .font("Helvetica-Bold")
            .text(value || "—", sx + 110, sy + 5, {
              width: CONTENT_W / 2 - 114,
              ellipsis: true,
            });
        });
        p3y += half * 18 + 12;

        if (p3y + 92 < H - 45) {
          doc.rect(MARGIN, p3y, CONTENT_W, 20).fill("#c8a951");
          doc
            .fontSize(9)
            .fillColor("#1a3a5c")
            .font("Helvetica-Bold")
            .text("FOR OFFICIAL USE ONLY / Official Use", MARGIN + 8, p3y + 6);
          p3y += 20;
          doc.rect(MARGIN, p3y, CONTENT_W, 72).fill("#fef9c3");
          doc.rect(MARGIN, p3y, CONTENT_W, 72).stroke("#fde047");
          const thW = CONTENT_W / 3;
          doc
            .fontSize(7)
            .fillColor("#854d0e")
            .font("Helvetica")
            .text("Authorized Signature:", MARGIN + 6, p3y + 8);
          doc
            .moveTo(MARGIN + 6, p3y + 50)
            .lineTo(MARGIN + thW - 6, p3y + 50)
            .stroke("#854d0e");
          doc
            .fontSize(7)
            .fillColor("#854d0e")
            .font("Helvetica")
            .text("Date:", MARGIN + thW + 6, p3y + 8);
          doc
            .moveTo(MARGIN + thW + 6, p3y + 50)
            .lineTo(MARGIN + thW * 2 - 6, p3y + 50)
            .stroke("#854d0e");
          doc
            .fontSize(7)
            .fillColor("#854d0e")
            .font("Helvetica")
            .text("Official Stamp:", MARGIN + thW * 2 + 6, p3y + 8);
          doc.rect(MARGIN + thW * 2 + 6, p3y + 18, 50, 44).fill("#fff");
          doc.rect(MARGIN + thW * 2 + 6, p3y + 18, 50, 44).stroke("#c8a951");
          p3y += 72;
        }

        doc.rect(0, H - 32, W, 2).fill("#c8a951");
        doc.rect(0, H - 30, W, 30).fill("#1a3a5c");
        doc
          .fontSize(7)
          .fillColor("#c8a951")
          .font("Helvetica-Bold")
          .text("DHAHAM SCHOOL EVENT MANAGEMENT SYSTEM", MARGIN, H - 19, {
            width: CONTENT_W * 0.55,
          });
        doc
          .fontSize(7)
          .fillColor("rgba(255,255,255,0.6)")
          .font("Helvetica")
          .text(
            `Page 3 of 3  |  ${application.registrationNumber || ""}  |  Generated: ${new Date().toLocaleDateString("en-LK")}`,
            MARGIN + CONTENT_W * 0.55,
            H - 19,
            { width: CONTENT_W * 0.45, align: "right" },
          );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
