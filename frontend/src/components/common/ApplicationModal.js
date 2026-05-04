import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import { schoolsAPI, applicationsAPI } from "../../services/api";
import DynamicFormSection from "./DynamicFormSection";
import { format } from "date-fns";

const GRADES = ["6", "7", "8", "9", "10", "11"];

const emptyMember = () => ({ fullName: "", grade: "", dateOfBirth: "" });
const emptyMemberFile = () => ({
  photo: null,
  photoPreview: null,
  cert: null,
  certName: "",
});

export default function ApplicationModal({ event, onClose, onSuccess }) {
  const isGroup = event.eventMode === "group";
  const minMembers = event.groupMinSize || 2;
  const maxMembers = event.groupMaxSize || 5;

  const [loading, setLoading] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [customFieldErrors, setCustomFieldErrors] = useState({});

  const handleCustomFieldChange = (fieldName, value) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldName]: value }));
    setCustomFieldErrors((prev) => ({ ...prev, [fieldName]: null }));
  };

  const [schoolCodeInput, setSchoolCodeInput] = useState("");
  const [verifiedSchool, setVerifiedSchool] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("idle");
  const [verifyError, setVerifyError] = useState("");
  const verifyTimeoutRef = useRef(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [certName, setCertName] = useState("");

  const [groupMembers, setGroupMembers] = useState(
    Array.from({ length: minMembers }, emptyMember),
  );
  const [memberFiles, setMemberFiles] = useState(
    Array.from({ length: minMembers }, emptyMemberFile),
  );
  const [memberErrors, setMemberErrors] = useState([]);

  const photoInputRef = useRef();
  const certInputRef = useRef();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const verifySchoolCode = async (code) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setVerifiedSchool(null);
      setVerifyStatus("idle");
      setVerifyError("");
      return;
    }
    setVerifyStatus("verifying");
    setVerifyError("");
    setVerifiedSchool(null);
    try {
      const res = await schoolsAPI.verifyCode(trimmed);
      setVerifiedSchool(res.data.school);
      setVerifyStatus("verified");
    } catch (err) {
      setVerifiedSchool(null);
      setVerifyStatus("error");
      setVerifyError(err.response?.data?.message || "Invalid school code");
    }
  };

  const handleSchoolCodeChange = (e) => {
    const val = e.target.value;
    setSchoolCodeInput(val);
    setVerifiedSchool(null);
    setVerifyStatus("idle");
    setVerifyError("");
    clearTimeout(verifyTimeoutRef.current);
    verifyTimeoutRef.current = setTimeout(() => verifySchoolCode(val), 600);
  };

  const handleVerifyClick = () => {
    clearTimeout(verifyTimeoutRef.current);
    verifySchoolCode(schoolCodeInput);
  };

  const updateMember = (idx, field, value) => {
    setGroupMembers((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    );
  };

  const updateMemberFile = (idx, field, value) => {
    setMemberFiles((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f)),
    );
  };

  const addMember = () => {
    if (groupMembers.length < maxMembers) {
      setGroupMembers((prev) => [...prev, emptyMember()]);
      setMemberFiles((prev) => [...prev, emptyMemberFile()]);
    }
  };

  const removeMember = (idx) => {
    if (groupMembers.length > minMembers) {
      setGroupMembers((prev) => prev.filter((_, i) => i !== idx));
      setMemberFiles((prev) => prev.filter((_, i) => i !== idx));
      setMemberErrors((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const validateGroupMembers = () => {
    const errs = groupMembers.map((m, i) => ({
      fullName: !m.fullName.trim() ? "Name required" : "",
      grade: !m.grade ? "Grade required" : "",
      dateOfBirth: !m.dateOfBirth ? "DOB required" : "",
      photo: !memberFiles[i]?.photo ? "Photo required" : "",
      cert: !memberFiles[i]?.cert ? "Certificate required" : "",
    }));
    setMemberErrors(errs);
    return errs.every(
      (e) => !e.fullName && !e.grade && !e.dateOfBirth && !e.photo && !e.cert,
    );
  };

  const onSubmit = async (data) => {
    if (isGroup && !validateGroupMembers()) {
      toast.error("Please complete all member details.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("eventId", event.id || event._id);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phoneNumber);
      if (!verifiedSchool) {
        toast.error("Please verify your school code before submitting.");
        setLoading(false);
        return;
      }
      formData.append("schoolCode", verifiedSchool.code);
      formData.append("schoolName", verifiedSchool.name);
      formData.append("address", data.address);

      if (isGroup) {
        formData.append("applicationType", "group");
        formData.append("groupName", data.groupName);
        formData.append("fullName", data.groupName);
        formData.append("grade", groupMembers[0].grade);
        formData.append("dateOfBirth", groupMembers[0].dateOfBirth);

        formData.append(
          "groupMembers",
          JSON.stringify(
            groupMembers.map((m) => ({
              fullName: m.fullName,
              grade: m.grade,
              dateOfBirth: m.dateOfBirth,
            })),
          ),
        );

        memberFiles.forEach((mf, i) => {
          if (mf.photo) formData.append(`passportPhoto_${i}`, mf.photo);
          if (mf.cert) formData.append(`birthCertificate_${i}`, mf.cert);
        });
      } else {
        formData.append("applicationType", "individual");
        formData.append("fullName", data.fullName);
        formData.append("grade", data.grade);
        formData.append("dateOfBirth", data.dateOfBirth);
        if (data.passportPhoto?.[0])
          formData.append("passportPhoto", data.passportPhoto[0]);
        if (data.birthCertificate?.[0])
          formData.append("birthCertificate", data.birthCertificate[0]);
      }

      const res = await applicationsAPI.submitPublic(formData);

      if (
        Object.keys(customFieldValues).length > 0 &&
        res.data.application?.id
      ) {
        const customEntries = Object.entries(customFieldValues);
        const hasFiles = customEntries.some(([, v]) => v instanceof File);

        if (hasFiles) {
          const fd = new FormData();
          fd.append("submissionType", "event_application");
          fd.append("submissionId", res.data.application.id);
          const textData = {};
          customEntries.forEach(([key, val]) => {
            if (val instanceof File) fd.append(key, val);
            else textData[key] = val;
          });
          fd.append("fieldData", JSON.stringify(textData));
          await axiosInstance.post(
            "/api/form-fields/submissions/save-with-files",
            fd,
          );
        } else {
          await axiosInstance.post("/api/form-fields/submissions/save", {
            submissionType: "event_application",
            submissionId: res.data.application.id,
            fieldData: customFieldValues,
          });
        }
      }

      toast.success("Application submitted successfully!");
      onSuccess(res.data.application);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Submission failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const sectionHeader = (title) => (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--primary)",
        textTransform: "uppercase",
        letterSpacing: 1,
        paddingBottom: 8,
        borderBottom: "2px solid var(--primary)",
        marginBottom: 16,
        marginTop: 4,
      }}
    >
      {title}
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15, 35, 56, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: isGroup ? 760 : 640,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            background: "var(--primary)",
            padding: "20px 24px",
            borderRadius: "20px 20px 0 0",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.55)",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  marginBottom: 4,
                }}
              >
                Applying for
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                  {event.title}
                </div>
                {isGroup && (
                  <span
                    style={{
                      background: "#c8a951",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "2px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    GROUP
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <span>
                  📅 {format(new Date(event.eventDate), "dd MMM yyyy")}
                </span>
                <span>📍 {event.venue}</span>
                <span>🎓 Grades: {event.grades?.join(", ")}</span>
                {isGroup && (
                  <span>
                    👥 {minMembers}–{maxMembers} members
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                color: "#fff",
                width: 32,
                height: 32,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <div
            style={{
              background: "#d1fae5",
              border: "1px solid #6ee7b7",
              borderRadius: 8,
              padding: "9px 14px",
              marginBottom: 20,
              fontSize: 12,
              color: "#065f46",
            }}
          >
            ✅ No account needed — any Dhaham School student can apply directly!
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {sectionHeader(isGroup ? "Group Information" : "Personal Details")}

            {isGroup ? (
              <div style={{ display: "grid", gap: 14, marginBottom: 24 }}>
                <div className="form-group">
                  <label className="form-label">
                    Group Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    {...register("groupName", {
                      required: "Group name is required",
                    })}
                    className={`form-control ${errors.groupName ? "error" : ""}`}
                    placeholder="e.g. Colombo Dhaham Art Team"
                  />
                  {errors.groupName && (
                    <p className="form-error">{errors.groupName.message}</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Contact Address <span style={{ color: "red" }}>*</span>
                  </label>
                  <textarea
                    {...register("address", {
                      required: "Address is required",
                    })}
                    className={`form-control ${errors.address ? "error" : ""}`}
                    rows={3}
                    placeholder="Contact person's address"
                    style={{ resize: "none" }}
                  />
                  {errors.address && (
                    <p className="form-error">{errors.address.message}</p>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginBottom: 24,
                }}
              >
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">
                    Full Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    {...register("fullName", {
                      required: "Full name is required",
                    })}
                    className={`form-control ${errors.fullName ? "error" : ""}`}
                    placeholder="As written on birth certificate"
                  />
                  {errors.fullName && (
                    <p className="form-error">{errors.fullName.message}</p>
                  )}
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">
                    Residential Address <span style={{ color: "red" }}>*</span>
                  </label>
                  <textarea
                    {...register("address", {
                      required: "Address is required",
                    })}
                    className={`form-control ${errors.address ? "error" : ""}`}
                    rows={3}
                    placeholder="House No, Street, City, District"
                    style={{ resize: "none" }}
                  />
                  {errors.address && (
                    <p className="form-error">{errors.address.message}</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Date of Birth <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    {...register("dateOfBirth", {
                      required: "Date of birth required",
                    })}
                    type="date"
                    className={`form-control ${errors.dateOfBirth ? "error" : ""}`}
                  />
                  {errors.dateOfBirth && (
                    <p className="form-error">{errors.dateOfBirth.message}</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Current Grade <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    {...register("grade", { required: "Please select grade" })}
                    className={`form-control ${errors.grade ? "error" : ""}`}
                  >
                    <option value="">— Select Grade —</option>
                    {GRADES.filter((g) => event.grades?.includes(g)).map(
                      (g) => (
                        <option key={g} value={g}>
                          Grade {g}
                        </option>
                      ),
                    )}
                  </select>
                  {errors.grade && (
                    <p className="form-error">{errors.grade.message}</p>
                  )}
                </div>
              </div>
            )}

            {isGroup && (
              <>
                {sectionHeader("Group Members")}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {groupMembers.length} / {maxMembers} members &nbsp;|&nbsp;
                    Min: {minMembers}
                  </div>
                  {groupMembers.length < maxMembers && (
                    <button
                      type="button"
                      onClick={addMember}
                      className="btn btn-outline btn-sm"
                    >
                      + Add Member
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  {groupMembers.map((member, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--primary)",
                            fontSize: 14,
                          }}
                        >
                          Member {idx + 1}
                        </span>
                        {groupMembers.length > minMembers && (
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--danger)",
                              cursor: "pointer",
                              fontSize: 18,
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 100px 140px",
                          gap: 10,
                          marginBottom: 14,
                        }}
                      >
                        <div>
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Full Name *
                          </label>
                          <input
                            className={`form-control ${memberErrors[idx]?.fullName ? "error" : ""}`}
                            value={member.fullName}
                            onChange={(e) =>
                              updateMember(idx, "fullName", e.target.value)
                            }
                            placeholder="As on birth certificate"
                          />
                          {memberErrors[idx]?.fullName && (
                            <p className="form-error">
                              {memberErrors[idx].fullName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Grade *
                          </label>
                          <select
                            className={`form-control ${memberErrors[idx]?.grade ? "error" : ""}`}
                            value={member.grade}
                            onChange={(e) =>
                              updateMember(idx, "grade", e.target.value)
                            }
                          >
                            <option value="">—</option>
                            {GRADES.filter((g) =>
                              event.grades?.includes(g),
                            ).map((g) => (
                              <option key={g} value={g}>
                                Grade {g}
                              </option>
                            ))}
                          </select>
                          {memberErrors[idx]?.grade && (
                            <p className="form-error">
                              {memberErrors[idx].grade}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            className={`form-control ${memberErrors[idx]?.dateOfBirth ? "error" : ""}`}
                            value={member.dateOfBirth}
                            onChange={(e) =>
                              updateMember(idx, "dateOfBirth", e.target.value)
                            }
                          />
                          {memberErrors[idx]?.dateOfBirth && (
                            <p className="form-error">
                              {memberErrors[idx].dateOfBirth}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 10,
                        }}
                      >
                        <div>
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Passport Photo *
                          </label>
                          <label
                            htmlFor={`photo_${idx}`}
                            style={{ cursor: "pointer", display: "block" }}
                          >
                            <div
                              style={{
                                border: `2px dashed ${memberErrors[idx]?.photo ? "var(--danger)" : "var(--border)"}`,
                                borderRadius: 8,
                                padding: 12,
                                textAlign: "center",
                                background: memberFiles[idx]?.photoPreview
                                  ? "#f0f9ff"
                                  : "#fff",
                              }}
                            >
                              {memberFiles[idx]?.photoPreview ? (
                                <>
                                  <img
                                    src={memberFiles[idx].photoPreview}
                                    alt="Preview"
                                    style={{
                                      width: 52,
                                      height: 64,
                                      objectFit: "cover",
                                      borderRadius: 4,
                                      border: "1px solid var(--border)",
                                      marginBottom: 4,
                                    }}
                                  />
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "var(--success)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ✓ Uploaded
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    Click to change
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div
                                    style={{ fontSize: 22, marginBottom: 4 }}
                                  >
                                    📷
                                  </div>
                                  <div
                                    style={{ fontSize: 11, fontWeight: 600 }}
                                  >
                                    Upload Photo
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    JPG/PNG
                                  </div>
                                </>
                              )}
                            </div>
                          </label>
                          <input
                            id={`photo_${idx}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const f = e.target.files[0];
                              if (f) {
                                updateMemberFile(idx, "photo", f);
                                updateMemberFile(
                                  idx,
                                  "photoPreview",
                                  URL.createObjectURL(f),
                                );
                              }
                            }}
                          />
                          {memberErrors[idx]?.photo && (
                            <p className="form-error">
                              {memberErrors[idx].photo}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Birth Certificate PDF *
                          </label>
                          <label
                            htmlFor={`cert_${idx}`}
                            style={{ cursor: "pointer", display: "block" }}
                          >
                            <div
                              style={{
                                border: `2px dashed ${memberErrors[idx]?.cert ? "var(--danger)" : "var(--border)"}`,
                                borderRadius: 8,
                                padding: 12,
                                textAlign: "center",
                                background: memberFiles[idx]?.certName
                                  ? "#f0fdf4"
                                  : "#fff",
                              }}
                            >
                              {memberFiles[idx]?.certName ? (
                                <>
                                  <div
                                    style={{ fontSize: 22, marginBottom: 4 }}
                                  >
                                    📄
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 11,
                                      color: "var(--success)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    ✓ Uploaded
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "var(--text-muted)",
                                      wordBreak: "break-all",
                                    }}
                                  >
                                    {memberFiles[idx].certName.substring(0, 18)}
                                    {memberFiles[idx].certName.length > 18
                                      ? "..."
                                      : ""}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div
                                    style={{ fontSize: 22, marginBottom: 4 }}
                                  >
                                    📑
                                  </div>
                                  <div
                                    style={{ fontSize: 11, fontWeight: 600 }}
                                  >
                                    Upload PDF
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 10,
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    PDF only
                                  </div>
                                </>
                              )}
                            </div>
                          </label>
                          <input
                            id={`cert_${idx}`}
                            type="file"
                            accept="application/pdf"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const f = e.target.files[0];
                              if (f) {
                                updateMemberFile(idx, "cert", f);
                                updateMemberFile(idx, "certName", f.name);
                              }
                            }}
                          />
                          {memberErrors[idx]?.cert && (
                            <p className="form-error">
                              {memberErrors[idx].cert}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {sectionHeader("Contact Details")}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                marginBottom: 24,
              }}
            >
              <div className="form-group">
                <label className="form-label">
                  Email Address <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  {...register("email", {
                    required: "Email required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Invalid email",
                    },
                  })}
                  type="email"
                  className={`form-control ${errors.email ? "error" : ""}`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 3,
                  }}
                >
                  Approval email sent here
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Phone Number <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  {...register("phoneNumber", {
                    required: "Phone required",
                    pattern: {
                      value: /^[0-9]{9,10}$/,
                      message: "Enter valid SL number",
                    },
                  })}
                  type="tel"
                  className={`form-control ${errors.phoneNumber ? "error" : ""}`}
                  placeholder="07XXXXXXXX"
                />
                {errors.phoneNumber && (
                  <p className="form-error">{errors.phoneNumber.message}</p>
                )}
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 3,
                  }}
                >
                  SMS confirmation sent here
                </p>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">
                  School Code <span style={{ color: "red" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={schoolCodeInput}
                    onChange={handleSchoolCodeChange}
                    className="form-control"
                    placeholder="e.g. DHS-CMB-001"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderColor:
                        verifyStatus === "verified"
                          ? "var(--success)"
                          : verifyStatus === "error"
                            ? "var(--danger)"
                            : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyClick}
                    disabled={
                      !schoolCodeInput.trim() || verifyStatus === "verifying"
                    }
                    style={{
                      whiteSpace: "nowrap",
                      padding: "0 20px",
                      borderRadius: "var(--radius)",
                      border: "1.5px solid var(--primary)",
                      background:
                        verifyStatus === "verified"
                          ? "var(--success)"
                          : "var(--primary)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      opacity: !schoolCodeInput.trim() ? 0.5 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {verifyStatus === "verifying"
                      ? "Checking…"
                      : verifyStatus === "verified"
                        ? "✓ Verified"
                        : "Verify"}
                  </button>
                </div>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 5,
                  }}
                >
                  Enter the school code given to you by your school principal
                </p>
                {verifyStatus === "verified" && verifiedSchool && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "10px 14px",
                      background: "#d1fae5",
                      border: "1px solid #6ee7b7",
                      borderRadius: "var(--radius)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: "#065f46",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>✅</span>
                    <div>
                      <strong>{verifiedSchool.name}</strong>
                      <span
                        style={{
                          color: "#047857",
                          marginLeft: 10,
                          fontSize: 12,
                        }}
                      >
                        {verifiedSchool.district} · {verifiedSchool.zone}
                      </span>
                    </div>
                  </div>
                )}
                {verifyStatus === "error" && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "10px 14px",
                      background: "#fee2e2",
                      border: "1px solid #fca5a5",
                      borderRadius: "var(--radius)",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      fontSize: 13,
                      color: "#991b1b",
                    }}
                  >
                    <span>❌</span>
                    <span>{verifyError}</span>
                  </div>
                )}
              </div>
            </div>

            {!isGroup && (
              <>
                {sectionHeader("Required Documents")}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">
                      Passport Photo <span style={{ color: "red" }}>*</span>
                    </label>
                    <label
                      htmlFor="photoInputModal"
                      style={{ cursor: "pointer", display: "block" }}
                    >
                      <div
                        style={{
                          border: `2px dashed ${errors.passportPhoto ? "var(--danger)" : "var(--border)"}`,
                          borderRadius: 10,
                          padding: "16px",
                          textAlign: "center",
                          background: photoPreview ? "#f0f9ff" : "var(--bg)",
                        }}
                      >
                        {photoPreview ? (
                          <>
                            <img
                              src={photoPreview}
                              alt="Preview"
                              style={{
                                width: 72,
                                height: 88,
                                objectFit: "cover",
                                borderRadius: 6,
                                border: "2px solid var(--border)",
                                marginBottom: 6,
                              }}
                            />
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--success)",
                                fontWeight: 600,
                              }}
                            >
                              ✓ Uploaded
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                              }}
                            >
                              Click to change
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 28, marginBottom: 6 }}>
                              📷
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>
                              Upload Photo
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                              }}
                            >
                              JPG/PNG • Max 10MB
                            </div>
                          </>
                        )}
                      </div>
                    </label>
                    <input
                      id="photoInputModal"
                      ref={photoInputRef}
                      {...register("passportPhoto", {
                        required: "Photo is required",
                      })}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) setPhotoPreview(URL.createObjectURL(f));
                      }}
                    />
                    {errors.passportPhoto && (
                      <p className="form-error">
                        {errors.passportPhoto.message}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Birth Certificate PDF{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <label
                      htmlFor="certInputModal"
                      style={{ cursor: "pointer", display: "block" }}
                    >
                      <div
                        style={{
                          border: `2px dashed ${errors.birthCertificate ? "var(--danger)" : "var(--border)"}`,
                          borderRadius: 10,
                          padding: "16px",
                          textAlign: "center",
                          background: certName ? "#f0fdf4" : "var(--bg)",
                        }}
                      >
                        {certName ? (
                          <>
                            <div style={{ fontSize: 28, marginBottom: 6 }}>
                              📄
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--success)",
                                fontWeight: 600,
                              }}
                            >
                              ✓ Uploaded
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                                wordBreak: "break-all",
                              }}
                            >
                              {certName.substring(0, 20)}
                              {certName.length > 20 ? "..." : ""}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 28, marginBottom: 6 }}>
                              📑
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>
                              Upload PDF
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                              }}
                            >
                              PDF only • Max 10MB
                            </div>
                          </>
                        )}
                      </div>
                    </label>
                    <input
                      id="certInputModal"
                      ref={certInputRef}
                      {...register("birthCertificate", {
                        required: "Certificate is required",
                      })}
                      type="file"
                      accept="application/pdf"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) setCertName(f.name);
                      }}
                    />
                    {errors.birthCertificate && (
                      <p className="form-error">
                        {errors.birthCertificate.message}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            <DynamicFormSection
              formType="event_application"
              eventId={event?.id}
              values={customFieldValues}
              onChange={handleCustomFieldChange}
              errors={customFieldErrors}
            />

            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 12,
                color: "#1e40af",
                lineHeight: 1.6,
              }}
            >
              ℹ️ After submitting, the admin will review your application and
              send an <strong>email notification</strong> with the decision.
              Your registration number will appear on the confirmation screen.
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center", fontSize: 15 }}
                disabled={loading}
              >
                {loading ? "⏳ Submitting..." : "📨 Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
