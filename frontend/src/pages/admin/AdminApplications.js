import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { applicationsAPI } from "../../services/api";
import axiosInstance, { getFileUrl } from "../../api/axiosInstance";
import { format } from "date-fns";
import { toast } from "react-toastify";

const isResoza = (app) => app.formType === "resoza2026";

function ViewApplicationModal({
  app: initialApp,
  onClose,
  onDownloadPDF,
  onDownloadWithOptions,
  onDownloadBirthCertOnly,
  downloading,
  isAdmin,
}) {
  const isGroup = initialApp.applicationType === "group";
  const [app] = useState(initialApp);
  const [customData, setCustomData] = useState([]);
  const [expandedDocMember, setExpandedDocMember] = useState(null);
  const [includeBirthCert, setIncludeBirthCert] = useState(true);

  const handlePreviewPDF = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/applications/${app.id}/download-pdf?includeBirthCert=true`,
        { responseType: "blob" },
      );
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch {
      toast.error("Could not open PDF preview");
    }
  };

  useEffect(() => {
    axiosInstance
      .get(`/api/form-fields/submissions/event_application/${app.id}`)
      .then((r) => setCustomData(r.data.data || []))
      .catch(() => {});
  }, [app.id]);

  const F = ({ label, value, fullWidth = false }) => (
    <div style={fullWidth ? { gridColumn: "1 / -1" } : {}}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, fontSize: 13 }}>{value || "—"}</div>
    </div>
  );

  const SectionHeader = ({ color = "var(--primary)", children }) => (
    <div
      style={{
        fontWeight: 700,
        fontSize: 11,
        color,
        textTransform: "uppercase",
        letterSpacing: 0.7,
        marginBottom: 12,
        paddingBottom: 6,
        borderBottom: "1px solid var(--border)",
      }}
    >
      {children}
    </div>
  );

  const photoSrc = app.passportPhotoUrl ? getFileUrl(app.passportPhotoUrl) : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 780,
          maxHeight: "94vh",
          overflowY: "auto",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="card-header"
          style={{
            background: "var(--primary)",
            borderRadius: "12px 12px 0 0",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <h2 style={{ fontSize: 17, color: "#fff", margin: 0 }}>
              Application Details
            </h2>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                marginTop: 3,
              }}
            >
              <code
                style={{
                  background: "rgba(255,255,255,0.15)",
                  padding: "2px 8px",
                  borderRadius: 4,
                  letterSpacing: 1,
                }}
              >
                {app.registrationNumber}
              </code>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#fff",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div className="card-body" style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <span
              className={`badge badge-${app.status}`}
              style={{ fontSize: 13, padding: "5px 14px" }}
            >
              {app.status}
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                padding: "5px 14px",
                borderRadius: 8,
                background: isGroup ? "#fef3c7" : "#f0f9ff",
                color: isGroup ? "#92400e" : "#1e40af",
              }}
            >
              {isGroup
                ? ` Group (${app.groupMembers?.length || 0} members)`
                : "Individual"}
            </span>
            {isResoza(app) && (
              <span
                className="resoza-badge"
                style={{ fontSize: 12, padding: "5px 14px" }}
              >
                Resogha 2026
              </span>
            )}
            {app.reviewedAt && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Reviewed: {format(new Date(app.reviewedAt), "dd MMM yyyy")}
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 14,
                }}
              >
                <SectionHeader>Applicant Information</SectionHeader>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {isGroup ? (
                    <F label="Group Name" value={app.groupName || app.fullName} />
                  ) : (
                    <F label="Full Name" value={app.fullName} />
                  )}
                  {isResoza(app) && (
                    <F label="Name (Sinhala)" value={app.studentNameSinhala} />
                  )}
                  {isResoza(app) && (
                    <F label="Name (English)" value={app.studentNameEnglish} />
                  )}
                  {!isGroup && !isResoza(app) && (
                    <F
                      label="Date of Birth"
                      value={
                        app.dateOfBirth
                          ? format(new Date(app.dateOfBirth), "dd MMM yyyy")
                          : null
                      }
                    />
                  )}
                  {!isGroup && (
                    <F label="Grade" value={app.grade ? `Grade ${app.grade}` : null} />
                  )}
                  <F label="Email" value={app.email} />
                  <F label="Phone" value={app.phoneNumber} />
                  <F label="School" value={app.school?.name || app.schoolName} />
                  <F label="Event" value={app.event?.title} />
                  {isResoza(app) && (
                    <F label="Education Zone" value={app.regionalEducationZone} />
                  )}
                  {isResoza(app) && <F label="Diocese" value={app.diocese} />}
                  {isResoza(app) && (
                    <F label="Competency Assessment" value={app.competencyAssessment} />
                  )}
                  {isResoza(app) && (
                    <F label="Class Teacher" value={app.classTeacherName} />
                  )}
                  <F
                    label="Applied On"
                    value={format(new Date(app.createdAt), "dd MMM yyyy, hh:mm a")}
                  />
                  <F label="Registration No." value={app.registrationNumber} />
                  <F label="Address" value={app.address} fullWidth />
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <SectionHeader color="#92400e">Admin Note</SectionHeader>
                <F label="Note to student" value={app.adminNote} fullWidth />
              </div>
            </div>

            <div style={{ width: 164, flexShrink: 0 }}>
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 8,
                    fontWeight: 700,
                  }}
                >
                  Passport Photo
                </div>
                <div style={{ display: "inline-block" }}>
                  {photoSrc ? (
                    <img
                      src={photoSrc}
                      alt="Passport"
                      style={{
                        width: 124,
                        height: 152,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "2px solid var(--border)",
                        display: "block",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 124,
                        height: 152,
                        borderRadius: 8,
                        border: "2px dashed var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f8fafc",
                      }}
                    >
                      <span style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
                        No photo
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 8,
                    fontWeight: 700,
                  }}
                >
                  Documents
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {app.passportPhotoUrl && (
                    <a
                      href={getFileUrl(app.passportPhotoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: 11, justifyContent: "center" }}
                    >
                       View Photo
                    </a>
                  )}
                  {app.birthCertificateUrl && (
                    <a
                      href={getFileUrl(app.birthCertificateUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: 11, justifyContent: "center" }}
                    >
                      View Certificate
                    </a>
                  )}
                  {isAdmin && (
                    <button
                      className="btn btn-sm"
                      style={{
                        background: "#dc2626",
                        color: "#fff",
                        fontSize: 11,
                        justifyContent: "center",
                      }}
                      onClick={() => onDownloadPDF(app)}
                      disabled={downloading === app.id}
                    >
                      {downloading === app.id ? "⏳ ..." : "📥 Download PDF"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isGroup && (app.passportPhotoUrl || app.birthCertificateUrl) && (
            <div
              style={{
                background: "var(--bg)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 14,
              }}
            >
              <SectionHeader color="#1e40af">
                Document Verification
              </SectionHeader>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: 8,
                    }}
                  >
                    Passport Photo
                  </div>
                  <div
                    style={{
                      border: "2px solid var(--border)",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#f0f4f8",
                      minHeight: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {photoSrc ? (
                      <img
                        src={photoSrc}
                        alt="Passport"
                        style={{
                          width: "100%",
                          maxHeight: 380,
                          objectFit: "contain",
                          display: "block",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span
                        style={{ color: "var(--text-muted)", fontSize: 13 }}
                      >
                        No photo uploaded
                      </span>
                    )}
                  </div>
                  {app.passportPhotoUrl && (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={getFileUrl(app.passportPhotoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: 11, width: "100%", justifyContent: "center" }}
                      >
                         Open Full Size
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: 8,
                    }}
                  >
                    Birth Certificate
                  </div>
                  <div
                    style={{
                      border: "2px solid var(--border)",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#f0f4f8",
                      minHeight: 200,
                    }}
                  >
                    {app.birthCertificateUrl ? (
                      /\.(jpg|jpeg|png|webp)$/i.test(app.birthCertificateUrl) ? (
                        <img
                          src={getFileUrl(app.birthCertificateUrl)}
                          alt="Birth Certificate"
                          style={{
                            width: "100%",
                            maxHeight: 380,
                            objectFit: "contain",
                            display: "block",
                          }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <iframe
                          src={getFileUrl(app.birthCertificateUrl)}
                          style={{
                            width: "100%",
                            height: 380,
                            border: "none",
                            display: "block",
                          }}
                          title="Birth Certificate Preview"
                        />
                      )
                    ) : (
                      <div
                        style={{
                          height: 200,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                          No certificate uploaded
                        </span>
                      </div>
                    )}
                  </div>
                  {app.birthCertificateUrl && (
                    <div style={{ marginTop: 8 }}>
                      <a
                        href={getFileUrl(app.birthCertificateUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: 11, width: "100%", justifyContent: "center" }}
                      >
                        Open Full Size
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isGroup && app.groupMembers?.length > 0 && (
            <div
              style={{
                background: "var(--bg)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 14,
              }}
            >
              <SectionHeader color="#7c3aed">
                Group Members ({app.groupMembers.length})
              </SectionHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {app.groupMembers.map((m, i) => (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        fontSize: 13,
                        padding: "10px 14px",
                        background: "#f5f3ff",
                        borderRadius:
                          expandedDocMember === i ? "8px 8px 0 0" : 8,
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setExpandedDocMember(expandedDocMember === i ? null : i)
                      }
                    >
                      <span
                        style={{
                          color: "#7c3aed",
                          fontWeight: 800,
                          minWidth: 24,
                          fontSize: 14,
                        }}
                      >
                        {i + 1}.
                      </span>
                      {m.passportPhotoUrl && (
                        <img
                          src={getFileUrl(m.passportPhotoUrl)}
                          alt={m.fullName}
                          style={{
                            width: 46,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 5,
                            border: "2px solid #ede9fe",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <span style={{ flex: 1, fontWeight: 700 }}>
                        {m.fullName}
                      </span>
                      <span
                        style={{ color: "var(--text-muted)", fontSize: 12 }}
                      >
                        Grade {m.grade}
                      </span>
                      {m.dateOfBirth && (
                        <span
                          style={{ color: "var(--text-muted)", fontSize: 12 }}
                        >
                          {m.dateOfBirth}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          color: "#7c3aed",
                          fontWeight: 700,
                          border: "1px solid #c4b5fd",
                          borderRadius: 4,
                          padding: "2px 8px",
                          flexShrink: 0,
                        }}
                      >
                        {expandedDocMember === i
                          ? "▲ Hide Docs"
                          : "📂 View Docs"}
                      </span>
                    </div>

                    {expandedDocMember === i && (
                      <div
                        style={{
                          background: "#ede9fe",
                          borderRadius: "0 0 8px 8px",
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 14,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#5b21b6",
                                marginBottom: 8,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Passport Photo
                            </div>
                            <div
                              style={{
                                border: "2px solid #c4b5fd",
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#fff",
                                minHeight: 160,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {m.passportPhotoUrl ? (
                                <img
                                  src={getFileUrl(m.passportPhotoUrl)}
                                  alt={m.fullName}
                                  style={{
                                    width: "100%",
                                    maxHeight: 300,
                                    objectFit: "contain",
                                    display: "block",
                                  }}
                                  onError={(e) => {
                                    e.target.parentNode.innerHTML =
                                      '<span style="color:#9ca3af;font-size:12px;padding:8px">Failed to load</span>';
                                  }}
                                />
                              ) : (
                                <span
                                  style={{ color: "#9ca3af", fontSize: 13 }}
                                >
                                  No photo
                                </span>
                              )}
                            </div>
                            {m.passportPhotoUrl && (
                              <a
                                href={getFileUrl(m.passportPhotoUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline"
                                style={{
                                  marginTop: 6,
                                  fontSize: 11,
                                  width: "100%",
                                  justifyContent: "center",
                                  borderColor: "#7c3aed",
                                  color: "#7c3aed",
                                }}
                              >
                                Open Full Size
                              </a>
                            )}
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#5b21b6",
                                marginBottom: 8,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Birth Certificate
                            </div>
                            <div
                              style={{
                                border: "2px solid #c4b5fd",
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#fff",
                                minHeight: 160,
                              }}
                            >
                              {m.birthCertificateUrl ? (
                                <iframe
                                  src={getFileUrl(m.birthCertificateUrl)}
                                  style={{
                                    width: "100%",
                                    height: 300,
                                    border: "none",
                                    display: "block",
                                  }}
                                  title={`Certificate - ${m.fullName}`}
                                />
                              ) : (
                                <div
                                  style={{
                                    height: 160,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <span
                                    style={{ color: "#9ca3af", fontSize: 13 }}
                                  >
                                    No certificate
                                  </span>
                                </div>
                              )}
                            </div>
                            {m.birthCertificateUrl && (
                              <a
                                href={getFileUrl(m.birthCertificateUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline"
                                style={{
                                  marginTop: 6,
                                  fontSize: 11,
                                  width: "100%",
                                  justifyContent: "center",
                                  borderColor: "#7c3aed",
                                  color: "#7c3aed",
                                }}
                              >
                                Open Full Size
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isResoza(app) &&
            (app.classTeacherSignatureUrl ||
              app.principalSignatureUrl ||
              app.officialSealUrl) && (
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 14,
                }}
              >
                <SectionHeader>Signatures & Seals</SectionHeader>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {app.classTeacherSignatureUrl && (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={getFileUrl(app.classTeacherSignatureUrl)}
                        alt="Teacher Sig"
                        style={{
                          width: 130,
                          height: 76,
                          objectFit: "contain",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          background: "#fff",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 5,
                        }}
                      >
                        Class Teacher
                      </div>
                    </div>
                  )}
                  {app.principalSignatureUrl && (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={getFileUrl(app.principalSignatureUrl)}
                        alt="Principal Sig"
                        style={{
                          width: 130,
                          height: 76,
                          objectFit: "contain",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          background: "#fff",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 5,
                        }}
                      >
                        Principal
                      </div>
                    </div>
                  )}
                  {app.officialSealUrl && (
                    <div style={{ textAlign: "center" }}>
                      <img
                        src={getFileUrl(app.officialSealUrl)}
                        alt="Official Seal"
                        style={{
                          width: 76,
                          height: 76,
                          objectFit: "contain",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          background: "#fff",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 5,
                        }}
                      >
                        Official Seal
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {isResoza(app) &&
            (app.round1StudentNumber || app.finalRankObtained) && (
              <div
                style={{
                  background: "var(--bg)",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 14,
                }}
              >
                <SectionHeader color="#b45309">
                  Evaluation Results
                </SectionHeader>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  {[
                    [
                      "Round 1 Date",
                      app.round1Date
                        ? format(new Date(app.round1Date), "dd MMM yyyy")
                        : null,
                    ],
                    ["Round 1 Student No.", app.round1StudentNumber],
                    ["Round 1 Competency", app.round1CompetencyAssessment],
                    ["Final Student No.", app.finalStudentNumber],
                    ["Final Competency", app.finalCompetencyAssessment],
                    ["Final Rank", app.finalRankObtained],
                  ].map(([label, value]) =>
                    value ? (
                      <div key={label}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            marginBottom: 2,
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>
                          {value}
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            )}

          {customData.length > 0 && (
            <div
              style={{
                background: "var(--bg)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 14,
              }}
            >
              <SectionHeader>Additional Information</SectionHeader>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {customData.map((item) => (
                  <div key={item.fieldName}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginBottom: 2,
                      }}
                    >
                      {item.fieldLabel}
                    </div>
                    {item.fileUrl ? (
                      <a
                        href={getFileUrl(item.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: 12 }}
                      >
                         View File
                      </a>
                    ) : (
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {Array.isArray(item.fieldValue)
                          ? item.fieldValue.join(", ")
                          : item.fieldValue || "—"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: 4,
            }}
          >
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        {isAdmin && <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "#f8fafc",
            borderTop: "2px solid #e2e8f0",
            padding: "12px 24px",
            zIndex: 5,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: 10,
            }}
          >
            Download Application
          </div>
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                cursor: app.birthCertificateUrl ? "pointer" : "default",
              }}
            >
              <input
                type="checkbox"
                checked={includeBirthCert}
                onChange={(e) => setIncludeBirthCert(e.target.checked)}
                disabled={!app.birthCertificateUrl}
                style={{ width: 15, height: 15 }}
              />
              <span
                style={{
                  color: app.birthCertificateUrl ? "#1e293b" : "#94a3b8",
                }}
              >
                Include Birth Certificate in PDF
                {!app.birthCertificateUrl && (
                  <span style={{ marginLeft: 6, fontSize: 11 }}>
                    (No birth certificate uploaded)
                  </span>
                )}
              </span>
            </label>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  onDownloadWithOptions(
                    app.id,
                    includeBirthCert && !!app.birthCertificateUrl,
                  )
                }
                disabled={
                  downloading === `${app.id}-pdf-with` ||
                  downloading === `${app.id}-pdf-without`
                }
              >
                {downloading === `${app.id}-pdf-with` ||
                downloading === `${app.id}-pdf-without`
                  ? "Downloading..."
                  : "Download Application PDF"}
              </button>

              {app.birthCertificateUrl && (
                <button
                  className="btn btn-sm"
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                  }}
                  onClick={() => onDownloadBirthCertOnly(app.id)}
                  disabled={downloading === `${app.id}-cert`}
                >
                  {downloading === `${app.id}-cert`
                    ? "Downloading..."
                    : "Download Birth Certificate Only"}
                </button>
              )}

              <button
                className="btn btn-outline btn-sm"
                onClick={handlePreviewPDF}
              >
                Preview PDF
              </button>
            </div>
          </div>
        </div>}
      </div>
    </div>
  );
}

export default function AdminApplications() {
  const { isAdmin, isMasterAdmin, can, user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);
  const [reviewing, setReviewing] = useState(null);
  const [reviewData, setReviewData] = useState({ status: "", adminNote: "" });
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [expandedMembers, setExpandedMembers] = useState(null);
  const [reviewTab, setReviewTab] = useState("details");
  const [evalData, setEvalData] = useState({});
  const [evalSaving, setEvalSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {
      status: filter || undefined,
      search: search || undefined,
      ...(isAdmin ? {} : { schoolId: user?.schoolId }),
    };
    applicationsAPI
      .getAll(params)
      .then((r) => setApplications(r.data.applications || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [filter, search, isAdmin, user?.schoolId]);

  useEffect(() => {
    load();
  }, [load]);

  const openReview = (app) => {
    setReviewing(app);
    setReviewData({
      status: app.status === "pending" ? "" : app.status,
      adminNote: app.adminNote || "",
    });
    setReviewTab("details");
    setEvalData({
      round1Date: app.round1Date ? app.round1Date.split("T")[0] : "",
      round1StudentNumber: app.round1StudentNumber || "",
      round1CompetencyAssessment: app.round1CompetencyAssessment || "",
      finalStudentNumber: app.finalStudentNumber || "",
      finalCompetencyAssessment: app.finalCompetencyAssessment || "",
      finalRankObtained: app.finalRankObtained || "",
    });
  };

  const saveEvaluation = async () => {
    setEvalSaving(true);
    try {
      await applicationsAPI.updateEvaluation(reviewing.id, evalData);
      toast.success("Evaluation saved");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save evaluation");
    } finally {
      setEvalSaving(false);
    }
  };

  const submitReview = async () => {
    if (!reviewData.status) return toast.error("Select a decision");
    setSubmitting(true);
    try {
      await applicationsAPI.review(reviewing.id, reviewData);
      toast.success(
        `Application ${reviewData.status} — Email and SMS sent to student`,
      );
      setReviewing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Review failed");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPDF = async (app) => {
    setDownloading(app.id);
    try {
      const response = await axiosInstance.get(`/api/applications/${app.id}/download-pdf`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `application-${app.registrationNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch {
      toast.error("PDF download failed");
    } finally {
      setDownloading(null);
    }
  };

  const downloadWithOptions = async (appId, withBirthCert) => {
    const key = `${appId}-pdf-${withBirthCert ? "with" : "without"}`;
    setDownloading(key);
    try {
      const response = await axiosInstance.get(`/api/applications/${appId}/download-pdf`, {
        responseType: "blob",
        params: { includeBirthCert: withBirthCert },
      });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      const app = applications.find((x) => x.id === appId) || viewing;
      a.download = `application-${app?.registrationNumber || appId}${withBirthCert ? "-with-cert" : ""}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch {
      toast.error("PDF download failed");
    } finally {
      setDownloading(null);
    }
  };

  const downloadBirthCertOnly = async (appId) => {
    setDownloading(`${appId}-cert`);
    try {
      const response = await axiosInstance.get(
        `/api/applications/${appId}/download-birth-cert`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      const app = applications.find((x) => x.id === appId) || viewing;
      a.download = `birth-certificate-${app?.registrationNumber || appId}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Birth certificate downloaded");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloading(null);
    }
  };

  const isGroup = (app) => app.applicationType === "group";

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 26, marginBottom: 6 }}>Applications</h1>
        <p
          style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 14 }}
        >
          Review, approve or reject student applications. Download PDF for each
          application.
        </p>

        <div className="card" style={{ marginBottom: 20 }}>
          <div
            className="card-body"
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Name, reg number or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  ["", "All"],
                  ["pending", "Pending"],
                  ["approved", "Approved"],
                  ["rejected", "Rejected"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilter(val)}
                    className="btn btn-sm"
                    style={{
                      background:
                        filter === val ? "var(--primary)" : "var(--bg-card)",
                      color: filter === val ? "#fff" : "var(--text)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Reg. No</th>
                    <th>Applicant</th>
                    <th>Type</th>
                    <th>Event</th>
                    <th>School</th>
                    <th>Grade</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign: "center",
                          color: "var(--text-muted)",
                          padding: 40,
                        }}
                      >
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <>
                        <tr key={app.id}>
                          <td>
                            <code
                              style={{
                                fontSize: 11,
                                background: "#f1f5f9",
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              {app.registrationNumber}
                            </code>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {isGroup(app)
                                ? app.groupName || app.fullName
                                : app.fullName}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                              }}
                            >
                              {app.email}
                            </div>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 3,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  background: isGroup(app)
                                    ? "#fef3c7"
                                    : "#f0f9ff",
                                  color: isGroup(app) ? "#92400e" : "#1e40af",
                                }}
                              >
                                {isGroup(app)
                                  ? `Group (${app.groupMembers?.length || 0})`
                                  : " Individual"}
                              </span>
                              {isResoza(app) && (
                                <span className="resoza-badge">
                                  Resogha 2026
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ fontSize: 13 }}>{app.event?.title}</td>
                          <td style={{ fontSize: 13 }}>
                            {app.school?.name || app.schoolName}
                          </td>
                          <td>{isGroup(app) ? "—" : `Grade ${app.grade}`}</td>
                          <td
                            style={{ fontSize: 12, color: "var(--text-muted)" }}
                          >
                            {format(new Date(app.createdAt), "dd MMM yy")}
                          </td>
                          <td>
                            <span className={`badge badge-${app.status}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: 4,
                                flexWrap: "nowrap",
                                alignItems: "center",
                              }}
                            >
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => setViewing(app)}
                                title="View full details"
                                style={{ padding: "3px 8px", fontSize: 11 }}
                              >
                                View
                              </button>
                              {isGroup(app) && app.groupMembers?.length > 0 && (
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    background: "#7c3aed",
                                    color: "#fff",
                                    fontSize: 11,
                                    padding: "3px 8px",
                                  }}
                                  onClick={() =>
                                    setExpandedMembers(
                                      expandedMembers === app.id
                                        ? null
                                        : app.id,
                                    )
                                  }
                                  title="View group members"
                                >
                                  {expandedMembers === app.id
                                    ? "▲"
                                    : "▼ Members"}
                                </button>
                              )}
                              {(isMasterAdmin || can('applications', 'view')) && (
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    background: "#dc2626",
                                    color: "#fff",
                                    fontSize: 11,
                                    padding: "3px 8px",
                                  }}
                                  onClick={() => downloadPDF(app)}
                                  disabled={downloading === app.id}
                                  title="Download Application PDF"
                                >
                                  {downloading === app.id ? "..." : "📄 PDF"}
                                </button>
                              )}
                              {(isMasterAdmin || can('applications', 'edit')) && (
                                app.status === "pending" ? (
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => openReview(app)}
                                    style={{ padding: "3px 8px", fontSize: 11 }}
                                  >
                                    Review
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => openReview(app)}
                                    style={{ padding: "3px 8px", fontSize: 11 }}
                                  >
                                    Change
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>

                        {isGroup(app) &&
                          expandedMembers === app.id &&
                          app.groupMembers?.length > 0 && (
                            <tr
                              key={`${app.id}-members`}
                              style={{ background: "#faf5ff" }}
                            >
                              <td colSpan={9} style={{ padding: "12px 20px" }}>
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#7c3aed",
                                    marginBottom: 10,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  👥 Group Members —{" "}
                                  {app.groupName || app.fullName}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 10,
                                  }}
                                >
                                  {app.groupMembers.map((member, idx) => (
                                    <div
                                      key={idx}
                                      style={{
                                        background: "#fff",
                                        border: "1px solid #ede9fe",
                                        borderRadius: 8,
                                        padding: "10px 14px",
                                        minWidth: 180,
                                        fontSize: 13,
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontWeight: 700,
                                          marginBottom: 4,
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "#7c3aed",
                                            marginRight: 6,
                                          }}
                                        >
                                          {idx + 1}.
                                        </span>
                                        {member.fullName}
                                      </div>
                                      <div
                                        style={{
                                          color: "var(--text-muted)",
                                          fontSize: 12,
                                        }}
                                      >
                                        Grade {member.grade}
                                      </div>
                                      {member.dateOfBirth && (
                                        <div
                                          style={{
                                            color: "var(--text-muted)",
                                            fontSize: 12,
                                          }}
                                        >
                                          DOB: {member.dateOfBirth}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                      </>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewing && (
          <ViewApplicationModal
            app={viewing}
            onClose={() => setViewing(null)}
            onDownloadPDF={downloadPDF}
            onDownloadWithOptions={downloadWithOptions}
            onDownloadBirthCertOnly={downloadBirthCertOnly}
            downloading={downloading}
            isAdmin={isAdmin}
          />
        )}

        {reviewing && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              className="card"
              style={{
                width: "100%",
                maxWidth: 580,
                maxHeight: "92vh",
                overflowY: "auto",
              }}
            >
              <div className="card-header">
                <h2 style={{ fontSize: 18 }}>Review Application</h2>
                <button
                  onClick={() => setReviewing(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 22,
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 8,
                      background: isGroup(reviewing) ? "#fef3c7" : "#f0f9ff",
                      color: isGroup(reviewing) ? "#92400e" : "#1e40af",
                    }}
                  >
                    {isGroup(reviewing)
                      ? `Group — ${reviewing.groupMembers?.length} Members`
                      : "Individual"}
                  </span>
                  {isResoza(reviewing) && (
                    <span
                      className="resoza-badge"
                      style={{ fontSize: 12, padding: "4px 12px" }}
                    >
                      Rasogha 2026
                    </span>
                  )}
                </div>

                {isResoza(reviewing) && (
                  <div
                    style={{
                      display: "flex",
                      gap: 0,
                      marginBottom: 16,
                      borderBottom: "2px solid var(--border)",
                    }}
                  >
                    {["details", "evaluation"].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setReviewTab(tab)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "8px 18px",
                          fontSize: 13,
                          fontWeight: 600,
                          color:
                            reviewTab === tab
                              ? "var(--primary)"
                              : "var(--text-muted)",
                          borderBottom:
                            reviewTab === tab
                              ? "2px solid var(--primary)"
                              : "2px solid transparent",
                          marginBottom: -2,
                        }}
                      >
                        {tab === "details"
                          ? "Application Details"
                          : "Evaluation"}
                      </button>
                    ))}
                  </div>
                )}

                {(!isResoza(reviewing) || reviewTab === "details") && (
                  <>
                    <div
                      style={{
                        background: "var(--bg)",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          fontSize: 13,
                          marginBottom: 12,
                        }}
                      >
                        {[
                          ["Registration", reviewing.registrationNumber],
                          [
                            isGroup(reviewing) ? "Group Name" : "Student",
                            isGroup(reviewing)
                              ? reviewing.groupName
                              : reviewing.fullName,
                          ],
                          ...(isResoza(reviewing)
                            ? [
                                [
                                  "Name (Sinhala)",
                                  reviewing.studentNameSinhala,
                                ],
                                [
                                  "Name (English)",
                                  reviewing.studentNameEnglish,
                                ],
                                ["Zone", reviewing.regionalEducationZone],
                                ["Competency", reviewing.competencyAssessment],
                                ["Class Teacher", reviewing.classTeacherName],
                              ]
                            : []),
                          ["Event", reviewing.event?.title],
                          ["School", reviewing.schoolName],
                          ...(!isGroup(reviewing) && !isResoza(reviewing)
                            ? [["Grade", `Grade ${reviewing.grade}`]]
                            : []),
                          ["Phone", reviewing.phoneNumber],
                          ["Email", reviewing.email],
                          [
                            "Applied",
                            format(
                              new Date(reviewing.createdAt),
                              "dd MMM yyyy",
                            ),
                          ],
                        ].map(([label, val]) => (
                          <div key={label}>
                            <span
                              style={{
                                color: "var(--text-muted)",
                                fontSize: 11,
                              }}
                            >
                              {label}
                            </span>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                              {val || "—"}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <span
                          style={{ color: "var(--text-muted)", fontSize: 11 }}
                        >
                          Address
                        </span>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {reviewing.address}
                        </div>
                      </div>

                      {isGroup(reviewing) &&
                        reviewing.groupMembers?.length > 0 && (
                          <div
                            style={{
                              borderTop: "1px solid var(--border)",
                              paddingTop: 12,
                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#7c3aed",
                                marginBottom: 8,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Group Members
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                              }}
                            >
                              {reviewing.groupMembers.map((member, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    gap: 16,
                                    fontSize: 13,
                                    padding: "6px 10px",
                                    background: "#f5f3ff",
                                    borderRadius: 6,
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#7c3aed",
                                      fontWeight: 700,
                                      minWidth: 20,
                                    }}
                                  >
                                    {idx + 1}.
                                  </span>
                                  <span style={{ flex: 1, fontWeight: 600 }}>
                                    {member.fullName}
                                  </span>
                                  <span style={{ color: "var(--text-muted)" }}>
                                    Grade {member.grade}
                                  </span>
                                  <span style={{ color: "var(--text-muted)" }}>
                                    {member.dateOfBirth}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {isResoza(reviewing) && (
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            flexWrap: "wrap",
                            marginBottom: 10,
                          }}
                        >
                          {reviewing.classTeacherSignatureUrl && (
                            <div style={{ textAlign: "center" }}>
                              <img
                                src={getFileUrl(reviewing.classTeacherSignatureUrl)}
                                alt="Teacher Sig"
                                style={{
                                  width: 80,
                                  height: 50,
                                  objectFit: "contain",
                                  border: "1px solid var(--border)",
                                  borderRadius: 4,
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--text-muted)",
                                  marginTop: 2,
                                }}
                              >
                                Teacher Sig
                              </div>
                            </div>
                          )}
                          {reviewing.principalSignatureUrl && (
                            <div style={{ textAlign: "center" }}>
                              <img
                                src={getFileUrl(reviewing.principalSignatureUrl)}
                                alt="Principal Sig"
                                style={{
                                  width: 80,
                                  height: 50,
                                  objectFit: "contain",
                                  border: "1px solid var(--border)",
                                  borderRadius: 4,
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--text-muted)",
                                  marginTop: 2,
                                }}
                              >
                                Principal Sig
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        {reviewing.passportPhotoUrl && (
                          <a
                            href={getFileUrl(reviewing.passportPhotoUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline"
                          >
                            View Photo
                          </a>
                        )}
                        {reviewing.birthCertificateUrl && (
                          <a
                            href={getFileUrl(reviewing.birthCertificateUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline"
                          >
                            View Certificate
                          </a>
                        )}
                        <button
                          className="btn btn-sm"
                          style={{ background: "#dc2626", color: "#fff" }}
                          onClick={() => downloadPDF(reviewing)}
                          disabled={downloading === reviewing.id}
                        >
                          {downloading === reviewing.id
                            ? "Downloading..."
                            : "Download PDF"}
                        </button>
                      </div>
                    </div>

                    {reviewing.passportPhotoUrl && (
                      <div style={{ textAlign: "center", marginBottom: 16 }}>
                        <img
                          src={getFileUrl(reviewing.passportPhotoUrl)}
                          alt="Passport"
                          style={{
                            width: 100,
                            height: 120,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "2px solid var(--border)",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">
                        Decision <span style={{ color: "red" }}>*</span>
                      </label>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() =>
                            setReviewData((p) => ({ ...p, status: "approved" }))
                          }
                          className="btn"
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            background:
                              reviewData.status === "approved"
                                ? "var(--success)"
                                : "var(--bg-card)",
                            color:
                              reviewData.status === "approved"
                                ? "#fff"
                                : "var(--text)",
                            border: "2px solid var(--success)",
                          }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() =>
                            setReviewData((p) => ({ ...p, status: "rejected" }))
                          }
                          className="btn"
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            background:
                              reviewData.status === "rejected"
                                ? "var(--danger)"
                                : "var(--bg-card)",
                            color:
                              reviewData.status === "rejected"
                                ? "#fff"
                                : "var(--text)",
                            border: "2px solid var(--danger)",
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Note to Student (optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={reviewData.adminNote}
                        onChange={(e) =>
                          setReviewData((p) => ({
                            ...p,
                            adminNote: e.target.value,
                          }))
                        }
                        placeholder="Reason or message for the student..."
                      />
                    </div>

                    <div className="alert alert-info" style={{ fontSize: 13 }}>
                      Email + SMS will be automatically sent to{" "}
                      <strong>{reviewing.email}</strong> and{" "}
                      <strong>{reviewing.phoneNumber}</strong>.
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => setReviewing(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, justifyContent: "center" }}
                        onClick={submitReview}
                        disabled={submitting || !reviewData.status}
                      >
                        {submitting ? "Submitting..." : "Confirm Decision"}
                      </button>
                    </div>
                  </>
                )}

                {isResoza(reviewing) && reviewTab === "evaluation" && (
                  <div>
                    <div
                      style={{
                        background: "var(--bg)",
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 16,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--primary)",
                          marginBottom: 14,
                        }}
                      >
                        Round 1 Evaluation / 1 වන වටය ඇගැයීම
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                          marginBottom: 16,
                        }}
                      >
                        <div className="form-group">
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Round 1 Date
                          </label>
                          <input
                            type="date"
                            className="form-control"
                            value={evalData.round1Date || ""}
                            onChange={(e) =>
                              setEvalData((p) => ({
                                ...p,
                                round1Date: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Round 1 Student Number
                          </label>
                          <input
                            className="form-control"
                            placeholder="e.g. R1-001"
                            value={evalData.round1StudentNumber || ""}
                            onChange={(e) =>
                              setEvalData((p) => ({
                                ...p,
                                round1StudentNumber: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div
                          className="form-group"
                          style={{ gridColumn: "1 / -1" }}
                        >
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Round 1 Competency Assessment
                          </label>
                          <input
                            className="form-control"
                            placeholder="Assessment result..."
                            value={evalData.round1CompetencyAssessment || ""}
                            onChange={(e) =>
                              setEvalData((p) => ({
                                ...p,
                                round1CompetencyAssessment: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--primary)",
                          marginBottom: 14,
                          borderTop: "1px solid var(--border)",
                          paddingTop: 14,
                        }}
                      >
                        Final Results / අවසාන ප්‍රතිඵල
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 12,
                        }}
                      >
                        <div className="form-group">
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Final Student Number
                          </label>
                          <input
                            className="form-control"
                            placeholder="e.g. F-001"
                            value={evalData.finalStudentNumber || ""}
                            onChange={(e) =>
                              setEvalData((p) => ({
                                ...p,
                                finalStudentNumber: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Final Competency Assessment
                          </label>
                          <input
                            className="form-control"
                            placeholder="Final result..."
                            value={evalData.finalCompetencyAssessment || ""}
                            onChange={(e) =>
                              setEvalData((p) => ({
                                ...p,
                                finalCompetencyAssessment: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div
                          className="form-group"
                          style={{ gridColumn: "1 / -1" }}
                        >
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Final Rank / Placement
                          </label>
                          <input
                            className="form-control"
                            placeholder="e.g. 1st Place, Merit..."
                            value={evalData.finalRankObtained || ""}
                            onChange={(e) =>
                              setEvalData((p) => ({
                                ...p,
                                finalRankObtained: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => setReviewing(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, justifyContent: "center" }}
                        onClick={saveEvaluation}
                        disabled={evalSaving}
                      >
                        {evalSaving ? "Saving..." : "Save Evaluation"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
