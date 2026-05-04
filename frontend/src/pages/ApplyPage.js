import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { eventsAPI, schoolsAPI, applicationsAPI } from "../services/api";
import { format } from "date-fns";

const GRADES = ["6", "7", "8", "9", "10", "11"];

export default function ApplyPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [regNumber, setRegNumber] = useState("");

  const [schoolCodeInput, setSchoolCodeInput] = useState("");
  const [verifiedSchool, setVerifiedSchool] = useState(null);
  const [verifyStatus, setVerifyStatus] = useState("idle");
  const [verifyError, setVerifyError] = useState("");
  const verifyTimeoutRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    eventsAPI
      .getOne(eventId)
      .then((r) => setEvent(r.data.event))
      .catch(() => navigate("/events"));
  }, [eventId, navigate]);

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

  const onSubmit = async (data) => {
    if (!verifiedSchool) {
      toast.error("Please enter and verify your school code before submitting.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("fullName", data.fullName);
      formData.append("address", data.address);
      formData.append("dateOfBirth", data.dateOfBirth);
      formData.append("email", data.email);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("grade", data.grade);
      formData.append("schoolCode", verifiedSchool.code);
      formData.append("schoolName", verifiedSchool.name);

      if (data.passportPhoto?.[0]) {
        formData.append("passportPhoto", data.passportPhoto[0]);
      }

      if (data.birthCertificate?.[0]) {
        formData.append("birthCertificate", data.birthCertificate[0]);
      }

      const res = await applicationsAPI.submitPublic(formData);

      setRegNumber(res.data.application.registrationNumber);
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Submission failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: "var(--success)", marginBottom: 8, fontFamily: "Noto Serif, serif" }}>
            Application Submitted!
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: 15, lineHeight: 1.7 }}>
            Your application has been received and is pending admin review.
          </p>
          <div style={{ background: "var(--primary)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: 20, color: "#fff" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              Your Registration Number
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, fontFamily: "Noto Serif, serif", letterSpacing: 3, color: "var(--accent)" }}>
              {regNumber}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 8 }}>
              Save this number — you will need it on event day
            </div>
          </div>
          <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 28, fontSize: 13, color: "#92400e" }}>
            Admin will approve or reject your application. Check your email for notification.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => navigate("/events")} className="btn btn-primary">Browse Events</button>
            <button onClick={() => navigate("/")} className="btn btn-outline">Go to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  const sectionHeader = (title) => (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      color: "var(--primary)",
      textTransform: "uppercase",
      letterSpacing: 1,
      paddingBottom: 8,
      borderBottom: "2px solid var(--primary)",
      marginBottom: 18,
      marginTop: 4,
    }}>
      {title}
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 760 }}>

        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, marginBottom: 16, padding: 0 }}
        >
          ← Back to Events
        </button>

        <div style={{ background: "var(--primary)", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 24, color: "#fff" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
            Applying for
          </div>
          <h2 style={{ fontFamily: "Noto Serif, serif", fontSize: 20, marginBottom: 8 }}>{event.title}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: 13, color: "rgba(255,255,255,0.8)" }}>
            <span>📅 {format(new Date(event.eventDate), "dd MMMM yyyy")}</span>
            <span>📍 {event.venue}</span>
            {event.grades?.length > 0 && <span>🎓 Grades: {event.grades.join(", ")}</span>}
            {event.applicationDeadline && (
              <span style={{ color: "#fcd34d" }}>
                ⏰ Deadline: {format(new Date(event.applicationDeadline), "dd MMM yyyy")}
              </span>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 17 }}>Application Form</h3>
            <span style={{ fontSize: 12, color: "var(--danger)" }}>* Required fields</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>

              {sectionHeader("Personal Details")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input
                    {...register("fullName", { required: "Full name is required" })}
                    className={`form-control${errors.fullName ? " error" : ""}`}
                    placeholder="As written on birth certificate"
                  />
                  {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth <span className="required">*</span></label>
                  <input
                    type="date"
                    {...register("dateOfBirth", { required: "Date of birth is required" })}
                    className={`form-control${errors.dateOfBirth ? " error" : ""}`}
                  />
                  {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Grade <span className="required">*</span></label>
                  <select
                    {...register("grade", { required: "Please select your grade" })}
                    className={`form-control${errors.grade ? " error" : ""}`}
                  >
                    <option value="">— Select Grade —</option>
                    {GRADES.filter((g) => event.grades?.includes(g)).map((g) => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                  {errors.grade && <p className="form-error">{errors.grade.message}</p>}
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Address <span className="required">*</span></label>
                  <textarea
                    {...register("address", { required: "Address is required" })}
                    className={`form-control${errors.address ? " error" : ""}`}
                    rows={2}
                    placeholder="Full residential address"
                  />
                  {errors.address && <p className="form-error">{errors.address.message}</p>}
                </div>
              </div>

              {sectionHeader("Contact Details")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                      pattern: { value: /^[0-9]{9,10}$/, message: "Enter a valid Sri Lanka phone number" },
                    })}
                    className={`form-control${errors.phoneNumber ? " error" : ""}`}
                    placeholder="07XXXXXXXX"
                  />
                  {errors.phoneNumber && <p className="form-error">{errors.phoneNumber.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email address" },
                    })}
                    className={`form-control${errors.email ? " error" : ""}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="form-error">{errors.email.message}</p>}
                </div>
              </div>

              {sectionHeader("School Verification")}
              <div className="form-group">
                <label className="form-label">School Code <span className="required">*</span></label>
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
                        verifyStatus === "verified" ? "var(--success)"
                        : verifyStatus === "error" ? "var(--danger)"
                        : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyClick}
                    disabled={!schoolCodeInput.trim() || verifyStatus === "verifying"}
                    style={{
                      whiteSpace: "nowrap",
                      padding: "0 20px",
                      borderRadius: "var(--radius)",
                      border: "1.5px solid var(--primary)",
                      background: verifyStatus === "verified" ? "var(--success)" : "var(--primary)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      opacity: !schoolCodeInput.trim() ? 0.5 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {verifyStatus === "verifying" ? "Checking…" : verifyStatus === "verified" ? "✓ Verified" : "Verify"}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 5 }}>
                  Enter the school code given to you by your school principal
                </p>

                {verifyStatus === "verified" && verifiedSchool && (
                  <div style={{ marginTop: 8, padding: "10px 14px", background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#065f46" }}>
                    <span style={{ fontSize: 18 }}>✅</span>
                    <div>
                      <strong>{verifiedSchool.name}</strong>
                      <span style={{ color: "#047857", marginLeft: 10, fontSize: 12 }}>
                        {verifiedSchool.district} · {verifiedSchool.zone}
                      </span>
                    </div>
                  </div>
                )}

                {verifyStatus === "error" && (
                  <div style={{ marginTop: 8, padding: "10px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "var(--radius)", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#991b1b" }}>
                    <span>❌</span>
                    <span>{verifyError}</span>
                  </div>
                )}
              </div>

              {sectionHeader("Required Documents")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Passport Size Photo <span className="required">*</span></label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    {...register("passportPhoto", { required: "Passport photo is required" })}
                    className={`form-control${errors.passportPhoto ? " error" : ""}`}
                    style={{ padding: "7px 12px", cursor: "pointer" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setPhotoPreview(URL.createObjectURL(file));
                    }}
                  />
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>JPG or PNG — max 2MB</p>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      style={{ width: 72, height: 88, objectFit: "cover", borderRadius: 6, border: "2px solid var(--border)", marginTop: 8 }}
                    />
                  )}
                  {errors.passportPhoto && <p className="form-error">{errors.passportPhoto.message}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Birth Certificate (PDF) <span className="required">*</span></label>
                  <input
                    type="file"
                    accept="application/pdf"
                    {...register("birthCertificate", { required: "Birth certificate is required" })}
                    className={`form-control${errors.birthCertificate ? " error" : ""}`}
                    style={{ padding: "7px 12px", cursor: "pointer" }}
                  />
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>PDF only — max 5MB</p>
                  {errors.birthCertificate && <p className="form-error">{errors.birthCertificate.message}</p>}
                </div>
              </div>

              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "var(--radius)", padding: "12px 16px", marginTop: 8, marginBottom: 20, fontSize: 13, color: "#1e40af", lineHeight: 1.6 }}>
                ℹ️ After submitting, the admin will review your application and send an <strong>email notification</strong> with the decision. Your registration number will appear on the next screen.
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => navigate(-1)} disabled={loading}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", fontSize: 15 }}
                  disabled={loading || !verifiedSchool}
                >
                  {loading ? "⏳ Submitting…" : "📨 Submit Application"}
                </button>
              </div>

              {!verifiedSchool && schoolCodeInput.trim() === "" && (
                <p style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
                  Verify your school code to enable submission
                </p>
              )}

            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .apply-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
