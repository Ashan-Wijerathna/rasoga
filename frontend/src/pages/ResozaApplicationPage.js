import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { schoolsAPI, eventsAPI, applicationsAPI } from "../services/api";

const COMPETENCY_OPTIONS = [
  {
    value: "ප්‍රාථමික ශ්‍රේණිය (Primary Level)",
    label: "ප්‍රාථමික ශ්‍රේණිය (Primary Level) — Grade 1–5",
  },
  {
    value: "මූලික ශ්‍රේණිය (Basic Level)",
    label: "මූලික ශ්‍රේණිය (Basic Level) — Grade 6–8",
  },
  {
    value: "මධ්‍යම ශ්‍රේණිය (Intermediate Level)",
    label: "මධ්‍යම ශ්‍රේණිය (Intermediate Level) — Grade 9–10",
  },
  {
    value: "උසස් ශ්‍රේණිය (Advanced Level)",
    label: "උසස් ශ්‍රේණිය (Advanced Level) — Grade 11–13",
  },
  {
    value: "විශේෂ ශ්‍රේණිය (Special Category)",
    label: "විශේෂ ශ්‍රේණිය (Special Category)",
  },
];

const ZONE_OPTIONS = [
  "කොළඹ කලාපය (Colombo Zone)",
  "ගම්පහ කලාපය (Gampaha Zone)",
  "කළුතර කලාපය (Kalutara Zone)",
  "කන්ද කලාපය (Kandy Zone)",
  "මාතලේ කලාපය (Matale Zone)",
  "නුවරඑළිය කලාපය (Nuwara Eliya Zone)",
  "ගාල්ල කලාපය (Galle Zone)",
  "මාතර කලාපය (Matara Zone)",
  "හම්බන්තොට කලාපය (Hambantota Zone)",
  "යාපනය කලාපය (Jaffna Zone)",
  "කිලිනොච්චි කලාපය (Kilinochchi Zone)",
  "මන්නාරම කලාපය (Mannar Zone)",
  "වව්නියාව කලාපය (Vavuniya Zone)",
  "මුලතිව් කලාපය (Mullaitivu Zone)",
  "බත්තිකලෝව කලාපය (Batticaloa Zone)",
  "අම්පාර කලාපය (Ampara Zone)",
  "ත්‍රිකුණාමලය කලාපය (Trincomalee Zone)",
  "කුරුණෑගල කලාපය (Kurunegala Zone)",
  "පුත්තලම කලාපය (Puttalam Zone)",
  "අනුරාධපුර කලාපය (Anuradhapura Zone)",
  "පොළොන්නරුව කලාපය (Polonnaruwa Zone)",
  "බදුල්ල කලාපය (Badulla Zone)",
  "මොනරාගල කලාපය (Monaragala Zone)",
  "රත්නපුර කලාපය (Ratnapura Zone)",
  "කෑගල්ල කලාපය (Kegalle Zone)",
];

const GRADES = ["6", "7", "8", "9", "10", "11"];

const REQ_ERR = "This field is required / මෙම ක්ෂේත්‍රය අවශ්‍යයි";

function BiLabel({ si, en, required }) {
  return (
    <div className="bilingual-label" style={{ marginBottom: 4 }}>
      <span className="si">
        {si} {required && <span style={{ color: "var(--danger)" }}>*</span>}
      </span>
      <span className="en">{en}</span>
    </div>
  );
}

function FileUploadBox({
  id,
  label,
  accept,
  preview,
  fileName,
  onChange,
  error,
  isImage,
}) {
  return (
    <div className="form-group">
      <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>
        {label}
      </label>
      <label htmlFor={id} style={{ cursor: "pointer", display: "block" }}>
        <div
          style={{
            border: `2px dashed ${error ? "var(--danger)" : "var(--border)"}`,
            borderRadius: 8,
            padding: 12,
            textAlign: "center",
            background: preview || fileName ? "#f0f9ff" : "#fff",
            minHeight: 80,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {isImage && preview ? (
            <>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: 64,
                  height: 64,
                  objectFit: "contain",
                  borderRadius: 4,
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
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                Click to change
              </div>
            </>
          ) : fileName ? (
            <>
              <div style={{ fontSize: 24 }}>📄</div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--success)",
                  fontWeight: 600,
                }}
              >
                ✓ {fileName.substring(0, 22)}
                {fileName.length > 22 ? "…" : ""}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                Click to change
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 24 }}>{isImage ? "🖼️" : "📑"}</div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>
                Click to upload
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                {accept}
              </div>
            </>
          )}
        </div>
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={onChange}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default function ResozaApplicationPage() {
  const { eventId } = useParams();

  const [step, setStep] = useState(1);
  const [schools, setSchools] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(eventId || "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  const [classTeacherSigFile, setClassTeacherSigFile] = useState(null);
  const [classTeacherSigPreview, setClassTeacherSigPreview] = useState(null);
  const [principalSigFile, setPrincipalSigFile] = useState(null);
  const [principalSigPreview, setPrincipalSigPreview] = useState(null);
  const [sigErrors, setSigErrors] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
    watch,
  } = useForm();

  useEffect(() => {
    schoolsAPI
      .getAll()
      .then((r) => setSchools(r.data.schools || []))
      .catch(() => {});
    eventsAPI
      .getAll({ isActive: true })
      .then((r) => {
        const evs = r.data.events || [];
        setEvents(evs);
        if (!eventId && evs.length > 0) {
          const resoza = evs.find((e) =>
            e.title?.toLowerCase().includes("resoza"),
          );
          if (resoza) setSelectedEventId(String(resoza.id));
        }
      })
      .catch(() => {});
    document.body.style.overflow = "auto";
  }, [eventId]);

  const selectedEvent = events.find(
    (e) => String(e.id) === String(selectedEventId),
  );

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger([
        "studentNameSinhala",
        "studentNameEnglish",
        "address",
        "regionalEducationZone",
        "schoolName",
        "competencyAssessment",
      ]);
      if (valid) setStep(2);
      return;
    }
    if (step === 2) {
      const errs = {};
      if (!classTeacherSigFile) errs.classTeacherSig = REQ_ERR;
      if (!principalSigFile) errs.principalSig = REQ_ERR;
      const valid = await trigger(["classTeacherName"]);
      if (!valid || Object.keys(errs).length > 0) {
        setSigErrors(errs);
        return;
      }
      setSigErrors({});
      setStep(3);
      return;
    }
    if (step === 3) {
      const valid = await trigger(["email", "phoneNumber", "dateOfBirth"]);
      if (valid) setStep(4);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("eventId", selectedEventId);
      fd.append("studentNameSinhala", data.studentNameSinhala);
      fd.append("studentNameEnglish", data.studentNameEnglish);
      fd.append("fullName", data.studentNameEnglish || data.studentNameSinhala);
      fd.append("address", data.address);
      fd.append("regionalEducationZone", data.regionalEducationZone);
      fd.append("schoolName", data.schoolName);
      fd.append("competencyAssessment", data.competencyAssessment);
      fd.append("classTeacherName", data.classTeacherName);
      fd.append("email", data.email);
      fd.append("phoneNumber", data.phoneNumber);
      fd.append("dateOfBirth", data.dateOfBirth);
      fd.append("grade", data.grade || "N/A");
      fd.append("applicationType", "individual");
      if (classTeacherSigFile)
        fd.append("classTeacherSignature", classTeacherSigFile);
      if (principalSigFile) fd.append("principalSignature", principalSigFile);

      const res = await applicationsAPI.submit(fd);
      setSubmittedApp(res.data.application);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Submission failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["සිසු විස්තර", "ගුරු සහතිකය", "සම්බන්ධතා", "සමාලෝචනය"];

  if (submitted && submittedApp) {
    return (
      <div
        className="page"
        style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          minHeight: "100vh",
        }}
      >
        <div className="container" style={{ maxWidth: 680 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 24px 80px rgba(0,0,0,0.12)",
              overflow: "hidden",
              marginTop: 32,
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #1a3a5c 0%, #0f2338 100%)",
                padding: "32px 40px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div
                className="sinhala-heading"
                style={{ fontSize: 20, color: "#fff", marginBottom: 6 }}
              >
                අයදුම්පත සාර්ථකව ඉදිරිපත් කරන ලදී!
              </div>
              <div style={{ fontSize: 14, color: "#c8a951" }}>
                Application submitted successfully!
              </div>
            </div>
            <div style={{ padding: "32px 40px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #c8a951, #f0d078)",
                  borderRadius: 12,
                  padding: "20px 24px",
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                <div
                  className="sinhala-text"
                  style={{ fontSize: 12, color: "#1a3a5c", marginBottom: 4 }}
                >
                  ඔබේ ලියාපදිංචි අංකය / Your Registration Number
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    fontFamily: "monospace",
                    color: "#1a3a5c",
                    letterSpacing: 2,
                  }}
                >
                  {submittedApp.registrationNumber}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                  fontSize: 13,
                  marginBottom: 24,
                }}
              >
                {[
                  ["නම (සිංහල)", submittedApp.studentNameSinhala],
                  [
                    "Name (English)",
                    submittedApp.studentNameEnglish || submittedApp.fullName,
                  ],
                  ["ධර්ම පාසල", submittedApp.schoolName],
                  ["කලාපය", submittedApp.regionalEducationZone],
                  ["දක්ෂතාව", submittedApp.competencyAssessment],
                  ["Email", submittedApp.email],
                ]
                  .filter(([, v]) => v)
                  .map(([label, val]) => (
                    <div
                      key={label}
                      style={{
                        background: "#f8fafc",
                        borderRadius: 8,
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          fontFamily: "Noto Sans Sinhala, sans-serif",
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ fontWeight: 600, marginTop: 2 }}>{val}</div>
                    </div>
                  ))}
              </div>

              <div
                style={{
                  background: "#d1fae5",
                  border: "1px solid #6ee7b7",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#065f46",
                  marginBottom: 16,
                }}
              >
                <div className="sinhala-text">
                  📱 ඔබේ දුරකථනයට SMS දැනුම්දීමක් ලැබෙනු ඇත
                </div>
                <div>
                  You will receive an SMS notification on your registered phone.
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/events")}
                  style={{ minWidth: 200, justifyContent: "center" }}
                >
                  ← Back to Events
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="page"
      style={{
        background: "linear-gradient(135deg, #f0f4f8 0%, #e8edf3 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="container" style={{ maxWidth: 760 }}>
        <div
          style={{
            background: "linear-gradient(135deg, #1a3a5c 0%, #0f2338 100%)",
            borderRadius: "16px 16px 0 0",
            padding: "28px 32px",
            textAlign: "center",
            marginTop: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: "linear-gradient(90deg, #c8a951, #f0d078, #c8a951)",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                background: "#c8a951",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 800,
                color: "#1a3a5c",
              }}
            >
              D
            </div>
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}
              >
                Dhaham EMS — Official Form
              </div>
              <div style={{ fontSize: 11, color: "#c8a951", fontWeight: 600 }}>
                සාහිත්‍ය මහා මංගලාව රෙසෝඨා 2026
              </div>
            </div>
          </div>

          <div
            className="sinhala-heading"
            style={{
              fontSize: 22,
              color: "#ffffff",
              marginBottom: 4,
              lineHeight: 1.4,
            }}
          >
            සාහිත්‍ය මහා මංගලාව රෙසෝඨා 2026
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#c8a951",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Literary Grand Festival Resoza 2026
          </div>
          <div
            className="sinhala-text"
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.7)",
              marginBottom: 2,
            }}
          >
            පුරන්වු සාහිතය කෙතෙ ප්‍රාදාවෙන් අස්වද්දන
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            A literary enrichment and appreciation event
          </div>
          <div
            style={{
              marginTop: 12,
              borderTop: "1px solid rgba(200,169,81,0.3)",
              paddingTop: 10,
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: "#c8a951",
                fontWeight: 700,
                fontFamily: "Noto Sans Sinhala, sans-serif",
              }}
            >
              අයදුම් පත්‍රය
            </span>
            <span
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                marginLeft: 8,
              }}
            >
              / Application Form
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 20,
              justifyContent: "center",
            }}
          >
            {stepLabels.map((label, i) => {
              const num = i + 1;
              const done = step > num;
              const active = step === num;
              return (
                <div
                  key={num}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flex: i < 3 ? 1 : "none",
                    maxWidth: i < 3 ? 180 : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: done
                          ? "#16a34a"
                          : active
                            ? "#c8a951"
                            : "rgba(255,255,255,0.15)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 12,
                        flexShrink: 0,
                        transition: "all 0.3s",
                      }}
                    >
                      {done ? "✓" : num}
                    </div>
                    <span
                      className="sinhala-text"
                      style={{
                        fontSize: 9,
                        color: active
                          ? "#c8a951"
                          : done
                            ? "rgba(255,255,255,0.8)"
                            : "rgba(255,255,255,0.4)",
                        fontWeight: active ? 700 : 400,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: done ? "#16a34a" : "rgba(255,255,255,0.15)",
                        margin: "0 6px 14px",
                        borderRadius: 1,
                        transition: "all 0.3s",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "0 0 16px 16px",
            padding: "28px 32px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
          }}
        >
          {!eventId && (
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">
                Event / උත්සවය <span style={{ color: "red" }}>*</span>
              </label>
              <select
                className="form-control"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="">— Select Resoza Event —</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div>
                <div className="official-form-box">
                  <div className="section-title">
                    A — සිසු විස්තර / Student Details
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div className="form-group">
                      <BiLabel
                        si="සිසුවාගේ සම්පූර්ණ නම (සිංහලෙන්)"
                        en="Student's Full Name in Sinhala"
                        required
                      />
                      <input
                        {...register("studentNameSinhala", {
                          required: REQ_ERR,
                        })}
                        className={`form-control sinhala-text ${errors.studentNameSinhala ? "error" : ""}`}
                        placeholder="සිංහල අකුරෙන් ලියන්න"
                        style={{ fontFamily: "Noto Sans Sinhala, sans-serif" }}
                      />
                      {errors.studentNameSinhala && (
                        <p className="form-error">
                          {errors.studentNameSinhala.message}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <BiLabel
                        si="සිසුවාගේ සම්පූර්ණ නම (ඉංග්‍රීසියෙන්)"
                        en="Student's Full Name in English"
                        required
                      />
                      <input
                        {...register("studentNameEnglish", {
                          required: REQ_ERR,
                        })}
                        className={`form-control ${errors.studentNameEnglish ? "error" : ""}`}
                        placeholder="Write in block letters"
                        style={{ textTransform: "uppercase" }}
                      />
                      {errors.studentNameEnglish && (
                        <p className="form-error">
                          {errors.studentNameEnglish.message}
                        </p>
                      )}
                    </div>

                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <BiLabel
                        si="පෞද්ගලික ලිපිනය"
                        en="Personal Address"
                        required
                      />
                      <textarea
                        {...register("address", { required: REQ_ERR })}
                        className={`form-control sinhala-text ${errors.address ? "error" : ""}`}
                        rows={3}
                        placeholder="නිවස අංකය, වීදිය, නගරය"
                        style={{
                          resize: "none",
                          fontFamily: "Noto Sans Sinhala, sans-serif",
                        }}
                      />
                      {errors.address && (
                        <p className="form-error">{errors.address.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <BiLabel
                        si="කලාපීය අධ්‍යාපන කලාපය"
                        en="Regional Education Zone"
                        required
                      />
                      <select
                        {...register("regionalEducationZone", {
                          required: REQ_ERR,
                        })}
                        className={`form-control sinhala-text ${errors.regionalEducationZone ? "error" : ""}`}
                        style={{ fontFamily: "Noto Sans Sinhala, sans-serif" }}
                      >
                        <option value="">— කලාපය තෝරන්න —</option>
                        {ZONE_OPTIONS.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                      {errors.regionalEducationZone && (
                        <p className="form-error">
                          {errors.regionalEducationZone.message}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <BiLabel
                        si="ධර්ම පාසලේ නම"
                        en="Dhamma School Name"
                        required
                      />
                      <select
                        {...register("schoolName", { required: REQ_ERR })}
                        className={`form-control ${errors.schoolName ? "error" : ""}`}
                      >
                        <option value="">— Select School —</option>
                        {schools.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {errors.schoolName && (
                        <p className="form-error">
                          {errors.schoolName.message}
                        </p>
                      )}
                    </div>

                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <BiLabel
                        si="පෙනී සිටින දක්ෂතා තක්සේරුව"
                        en="Competency Assessment Being Appeared For"
                        required
                      />
                      <select
                        {...register("competencyAssessment", {
                          required: REQ_ERR,
                        })}
                        className={`form-control sinhala-text ${errors.competencyAssessment ? "error" : ""}`}
                        style={{ fontFamily: "Noto Sans Sinhala, sans-serif" }}
                      >
                        <option value="">— දක්ෂතා ශ්‍රේණිය තෝරන්න —</option>
                        {COMPETENCY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      {errors.competencyAssessment && (
                        <p className="form-error">
                          {errors.competencyAssessment.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                    style={{ minWidth: 200, justifyContent: "center" }}
                  >
                    ඊළඟ / Next →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="official-form-box">
                  <div className="section-title">
                    B — පන්තිභාර ගුරු සහතිකය / Class Teacher Certification
                  </div>

                  <div
                    style={{
                      background: "#fffbeb",
                      border: "1px dashed #c8a951",
                      borderRadius: 8,
                      padding: "12px 16px",
                      marginBottom: 16,
                      fontSize: 13,
                      lineHeight: 1.8,
                    }}
                  >
                    <p
                      className="sinhala-text"
                      style={{
                        color: "#1a3a5c",
                        fontFamily: "Noto Sans Sinhala, sans-serif",
                      }}
                    >
                      ඉහත සඳහන් තොරතුරු නිවැරදි බව සහ සිසුවා/සිසුවිය මෙම ධර්ම
                      පාසලේ ලියාපදිංචිව ඇති බව සහතික කරමි.
                    </p>
                    <p style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                      I hereby certify that the above information is correct and
                      the student is duly registered at this Dhamma School.
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <BiLabel
                        si="ගුරුවරයාගේ/ගුරුවරියගේ නම"
                        en="Class Teacher's Name"
                        required
                      />
                      <input
                        {...register("classTeacherName", { required: REQ_ERR })}
                        className={`form-control ${errors.classTeacherName ? "error" : ""}`}
                        placeholder="Full name of class teacher"
                      />
                      {errors.classTeacherName && (
                        <p className="form-error">
                          {errors.classTeacherName.message}
                        </p>
                      )}
                    </div>

                    <FileUploadBox
                      id="ctSig"
                      label="ගුරු අත්සන / Teacher's Signature"
                      accept="image/jpeg, image/png, image/webp"
                      preview={classTeacherSigPreview}
                      error={sigErrors.classTeacherSig}
                      isImage
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) {
                          setClassTeacherSigFile(f);
                          setClassTeacherSigPreview(URL.createObjectURL(f));
                          setSigErrors((p) => ({ ...p, classTeacherSig: "" }));
                        }
                      }}
                    />

                    <FileUploadBox
                      id="prinSig"
                      label="විදුහල්පතිගේ අත්සන සහ නිල මුද්‍රාව / Principal's Signature & Seal"
                      accept="image/jpeg, image/png, image/webp"
                      preview={principalSigPreview}
                      error={sigErrors.principalSig}
                      isImage
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) {
                          setPrincipalSigFile(f);
                          setPrincipalSigPreview(URL.createObjectURL(f));
                          setSigErrors((p) => ({ ...p, principalSig: "" }));
                        }
                      }}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 8,
                    }}
                  >
                    📷 Please upload a clear photo of signatures. Accepted: JPG,
                    PNG, WEBP
                  </p>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep(1)}
                  >
                    ← ආපසු / Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                    style={{ minWidth: 200, justifyContent: "center" }}
                  >
                    ඊළඟ / Next →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="official-form-box">
                  <div className="section-title">
                    C — සම්බන්ධතා විස්තර / Contact Details
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <div className="form-group">
                      <BiLabel
                        si="විද්‍යුත් තැපෑල"
                        en="Email Address"
                        required
                      />
                      <input
                        {...register("email", {
                          required: REQ_ERR,
                          pattern: {
                            value: /^\S+@\S+\.\S+$/,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        className={`form-control ${errors.email ? "error" : ""}`}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="form-error">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <BiLabel si="දුරකථන අංකය" en="Phone Number" required />
                      <input
                        {...register("phoneNumber", {
                          required: REQ_ERR,
                          pattern: {
                            value: /^[0-9]{9,10}$/,
                            message: "Enter valid Sri Lankan number",
                          },
                        })}
                        type="tel"
                        className={`form-control ${errors.phoneNumber ? "error" : ""}`}
                        placeholder="07XXXXXXXX"
                      />
                      {errors.phoneNumber && (
                        <p className="form-error">
                          {errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <BiLabel si="උපන් දිනය" en="Date of Birth" required />
                      <input
                        {...register("dateOfBirth", { required: REQ_ERR })}
                        type="date"
                        className={`form-control ${errors.dateOfBirth ? "error" : ""}`}
                      />
                      {errors.dateOfBirth && (
                        <p className="form-error">
                          {errors.dateOfBirth.message}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <BiLabel si="ශ්‍රේණිය" en="Current Grade" />
                      <select {...register("grade")} className="form-control">
                        <option value="">— Select Grade (optional) —</option>
                        {GRADES.map((g) => (
                          <option key={g} value={g}>
                            Grade {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginTop: 8,
                      fontSize: 12,
                      color: "#1e40af",
                      lineHeight: 1.8,
                    }}
                  >
                    <div
                      className="sinhala-text"
                      style={{ fontFamily: "Noto Sans Sinhala, sans-serif" }}
                    >
                      📧 ඔබේ අයදුම්පත් තත්ත්වය ඊමේල් සහ SMS මගින් දැනුම් දෙනු
                      ලැබේ
                    </div>
                    <div>
                      Your application status will be notified via Email and
                      SMS.
                    </div>
                  </div>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep(2)}
                  >
                    ← ආපසු / Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                    style={{ minWidth: 200, justifyContent: "center" }}
                  >
                    සමාලෝචනය / Review →
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="official-form-box">
                  <div className="section-title">
                    D — සමාලෝචනය / Review Your Application
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      fontSize: 13,
                      marginBottom: 16,
                    }}
                  >
                    {[
                      ["නම (සිංහල)", getValues("studentNameSinhala")],
                      ["Name (English)", getValues("studentNameEnglish")],
                      ["ලිපිනය / Address", getValues("address")],
                      ["කලාපය / Zone", getValues("regionalEducationZone")],
                      ["ධර්ම පාසල", getValues("schoolName")],
                      [
                        "දක්ෂතාව / Competency",
                        getValues("competencyAssessment"),
                      ],
                      ["ගුරු / Teacher", getValues("classTeacherName")],
                      ["Email", getValues("email")],
                      ["Phone", getValues("phoneNumber")],
                      ["DOB", getValues("dateOfBirth")],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        style={{
                          background: "#f8fafc",
                          borderRadius: 6,
                          padding: "8px 10px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            fontFamily: "Noto Sans Sinhala, sans-serif",
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontWeight: 600,
                            marginTop: 1,
                            wordBreak: "break-word",
                          }}
                        >
                          {val || "—"}
                        </div>
                      </div>
                    ))}
                  </div>

                  {(classTeacherSigPreview || principalSigPreview) && (
                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                      {classTeacherSigPreview && (
                        <div style={{ textAlign: "center" }}>
                          <img
                            src={classTeacherSigPreview}
                            alt="Teacher Sig"
                            style={{
                              width: 80,
                              height: 50,
                              objectFit: "contain",
                              border: "1px solid var(--border)",
                              borderRadius: 4,
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
                      {principalSigPreview && (
                        <div style={{ textAlign: "center" }}>
                          <img
                            src={principalSigPreview}
                            alt="Principal Sig"
                            style={{
                              width: 80,
                              height: 50,
                              objectFit: "contain",
                              border: "1px solid var(--border)",
                              borderRadius: 4,
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

                  {selectedEvent && (
                    <div
                      style={{
                        background: "#f0f9ff",
                        borderRadius: 8,
                        padding: "10px 14px",
                        fontSize: 13,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>
                        Event:{" "}
                      </span>
                      <strong>{selectedEvent.title}</strong>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--primary-light)",
                      fontSize: 12,
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    ✏️ Edit details
                  </button>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setStep(3)}
                    disabled={loading}
                  >
                    ← ආපසු
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center", fontSize: 15 }}
                    disabled={loading || !selectedEventId}
                  >
                    {loading ? (
                      "⏳ Submitting..."
                    ) : (
                      <span>
                        <span
                          className="sinhala-text"
                          style={{
                            fontFamily: "Noto Sans Sinhala, sans-serif",
                          }}
                        >
                          අයදුම්පත ඉදිරිපත් කරන්න
                        </span>
                        <span style={{ marginLeft: 8 }}>
                          / Submit Application
                        </span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
