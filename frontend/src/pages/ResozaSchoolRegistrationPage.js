import { useState } from "react";
import { toast } from "react-toastify";
import { resozaAPI } from "../services/api";

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

const COMPETENCY_OPTIONS = [
  {
    value: "ප්‍රාථමික ශ්‍රේණිය (Primary Level)",
    label: "ප්‍රාථමික ශ්‍රේණිය — Grade 1–5",
  },
  {
    value: "මූලික ශ්‍රේණිය (Basic Level)",
    label: "මූලික ශ්‍රේණිය — Grade 6–8",
  },
  {
    value: "මධ්‍යම ශ්‍රේණිය (Intermediate Level)",
    label: "මධ්‍යම ශ්‍රේණිය — Grade 9–10",
  },
  {
    value: "උසස් ශ්‍රේණිය (Advanced Level)",
    label: "උසස් ශ්‍රේණිය — Grade 11–13",
  },
  {
    value: "විශේෂ ශ්‍රේණිය (Special Category)",
    label: "විශේෂ ශ්‍රේණිය (Special Category)",
  },
];

function BiLabel({ si, en, required }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <span
        style={{
          display: "block",
          fontFamily: "Noto Sans Sinhala, sans-serif",
          fontWeight: 600,
          fontSize: 13,
          color: "#1a3a5c",
        }}
      >
        {si} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </span>
      <span style={{ display: "block", fontSize: 11, color: "#64748b" }}>
        {en}
      </span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #1a3a5c, #0f2338)",
        color: "#c8a951",
        fontWeight: 700,
        fontSize: 13,
        padding: "10px 16px",
        borderRadius: 8,
        marginBottom: 16,
        letterSpacing: 0.5,
      }}
    >
      {children}
    </div>
  );
}

export default function ResozaSchoolRegistrationPage() {
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolAddress: "",
    educationZone: "",
    principalName: "",
    contactPersonName: "",
    schoolEmail: "",
    whatsappNumber: "",
    numberOfStudents: "",
    additionalNotes: "",
  });
  const [competencyLevels, setCompetencyLevels] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedReg, setSubmittedReg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleCompetency = (val) => {
    setCompetencyLevels((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  const validate = () => {
    const e = {};
    if (!formData.schoolName.trim())
      e.schoolName = "This field is required / මෙම ක්ෂේත්‍රය අවශ්‍යයි";
    if (!formData.schoolAddress.trim())
      e.schoolAddress = "This field is required / මෙම ක්ෂේත්‍රය අවශ්‍යයි";
    if (!formData.educationZone)
      e.educationZone = "This field is required / මෙම ක්ෂේත්‍රය අවශ්‍යයි";
    if (!formData.principalName.trim())
      e.principalName = "This field is required / මෙම ක්ෂේත්‍රය අවශ්‍යයි";
    if (!formData.contactPersonName.trim())
      e.contactPersonName = "This field is required / මෙම ක්ෂේත්‍රය අවශ්‍යයි";
    if (!formData.schoolEmail.trim()) {
      e.schoolEmail = "This field is required / මෙම ක්ෂේත්‍රය අවශ්‍යයි";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.schoolEmail)) {
      e.schoolEmail = "Invalid email address";
    }
    if (!formData.whatsappNumber.trim()) {
      e.whatsappNumber = "This field is required / මෙම ක්ෂේත්‍රය අවශ්‍යයි";
    } else if (
      !/^[0-9]{9,10}$/.test(formData.whatsappNumber.replace(/\s/g, ""))
    ) {
      e.whatsappNumber = "Enter a valid Sri Lanka number (07XXXXXXXX)";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    try {
      const res = await resozaAPI.register({
        ...formData,
        competencyLevels,
        numberOfStudents: Number(formData.numberOfStudents) || 0,
      });
      setSubmittedReg(res.data.registration);
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

  if (submitted && submittedReg) {
    return (
      <div
        className="page"
        style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          minHeight: "100vh",
        }}
      >
        <div className="container" style={{ maxWidth: 640 }}>
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
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background:
                    "linear-gradient(90deg, #c8a951, #f0d078, #c8a951)",
                }}
              />
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div
                style={{
                  fontSize: 20,
                  color: "#fff",
                  fontFamily: "Noto Sans Sinhala, sans-serif",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                ලියාපදිංචිය සාර්ථකව ඉදිරිපත් කරන ලදී!
              </div>
              <div style={{ fontSize: 14, color: "#c8a951" }}>
                School registration submitted successfully!
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
                  style={{
                    fontSize: 12,
                    color: "#1a3a5c",
                    marginBottom: 4,
                    fontFamily: "Noto Sans Sinhala, sans-serif",
                  }}
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
                  {submittedReg.registrationNumber}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                {[
                  ["ධර්ම පාසල / School", submittedReg.schoolName],
                  ["Status", submittedReg.status],
                  ["Email", submittedReg.schoolEmail],
                ].map(([label, val]) => (
                  <div
                    key={label}
                    style={{
                      background: "#f8fafc",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>
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
                <div style={{ fontFamily: "Noto Sans Sinhala, sans-serif" }}>
                  📱 ඔබේ WhatsApp සහ ඊමේල් ලිපිනයට තහවුරු කිරීමේ දැනුම්දීමක්
                  ලැබෙනු ඇත
                </div>
                <div>
                  You will receive a confirmation on your WhatsApp and email.
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/")}
                  style={{ minWidth: 200, justifyContent: "center" }}
                >
                  ← Home / නිවස
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
            style={{
              fontSize: 22,
              color: "#fff",
              fontFamily: "Noto Sans Sinhala, sans-serif",
              fontWeight: 700,
              marginBottom: 4,
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
              පාසල් ලියාපදිංචි පත්‍රය
            </span>
            <span
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                marginLeft: 8,
              }}
            >
              / School Registration Form
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: "#fff",
              borderRadius: "0 0 16px 16px",
              padding: "28px 32px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <SectionTitle>A — පාසල් විස්තර / School Details</SectionTitle>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <BiLabel
                    si="ධර්ම පාසලේ නම"
                    en="Dhamma School Name"
                    required
                  />
                  <input
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    className={`form-control ${errors.schoolName ? "error" : ""}`}
                    placeholder="ධර්ම පාසලේ සම්පූර්ණ නම"
                    style={{ fontFamily: "Noto Sans Sinhala, sans-serif" }}
                  />
                  {errors.schoolName && (
                    <p className="form-error">{errors.schoolName}</p>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <BiLabel si="පාසල් ලිපිනය" en="School Address" required />
                  <textarea
                    name="schoolAddress"
                    value={formData.schoolAddress}
                    onChange={handleChange}
                    className={`form-control ${errors.schoolAddress ? "error" : ""}`}
                    rows={3}
                    placeholder="නිවස අංකය, වීදිය, නගරය"
                    style={{
                      resize: "none",
                      fontFamily: "Noto Sans Sinhala, sans-serif",
                    }}
                  />
                  {errors.schoolAddress && (
                    <p className="form-error">{errors.schoolAddress}</p>
                  )}
                </div>

                <div className="form-group">
                  <BiLabel
                    si="කලාපීය අධ්‍යාපන කලාපය"
                    en="Education Zone"
                    required
                  />
                  <select
                    name="educationZone"
                    value={formData.educationZone}
                    onChange={handleChange}
                    className={`form-control ${errors.educationZone ? "error" : ""}`}
                    style={{ fontFamily: "Noto Sans Sinhala, sans-serif" }}
                  >
                    <option value="">— කලාපය තෝරන්න —</option>
                    {ZONE_OPTIONS.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                  {errors.educationZone && (
                    <p className="form-error">{errors.educationZone}</p>
                  )}
                </div>

                <div className="form-group">
                  <BiLabel
                    si="සිසුන් සංඛ්‍යාව"
                    en="Number of Students Entering"
                  />
                  <input
                    name="numberOfStudents"
                    value={formData.numberOfStudents}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <SectionTitle>
                B — විදුහල්පති සහ සම්බන්ධතා / Principal &amp; Contact
              </SectionTitle>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="form-group">
                  <BiLabel
                    si="විදුහල්පතිගේ නම"
                    en="Principal's Name"
                    required
                  />
                  <input
                    name="principalName"
                    value={formData.principalName}
                    onChange={handleChange}
                    className={`form-control ${errors.principalName ? "error" : ""}`}
                    placeholder="Full name"
                  />
                  {errors.principalName && (
                    <p className="form-error">{errors.principalName}</p>
                  )}
                </div>

                <div className="form-group">
                  <BiLabel
                    si="සම්බන්ධ වීමට ඇති පුද්ගලයාගේ නම"
                    en="Contact Person's Name"
                    required
                  />
                  <input
                    name="contactPersonName"
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    className={`form-control ${errors.contactPersonName ? "error" : ""}`}
                    placeholder="Full name"
                  />
                  {errors.contactPersonName && (
                    <p className="form-error">{errors.contactPersonName}</p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <SectionTitle>
                C — සම්බන්ධතා විස්තර / Contact Details
              </SectionTitle>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div className="form-group">
                  <BiLabel
                    si="ඊමේල් ලිපිනය"
                    en="School Email Address"
                    required
                  />
                  <input
                    name="schoolEmail"
                    value={formData.schoolEmail}
                    onChange={handleChange}
                    type="email"
                    className={`form-control ${errors.schoolEmail ? "error" : ""}`}
                    placeholder="school@example.com"
                  />
                  {errors.schoolEmail && (
                    <p className="form-error">{errors.schoolEmail}</p>
                  )}
                </div>

                <div className="form-group">
                  <BiLabel si="WhatsApp අංකය" en="WhatsApp Number" required />
                  <input
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    type="tel"
                    className={`form-control ${errors.whatsappNumber ? "error" : ""}`}
                    placeholder="07XXXXXXXX"
                  />
                  {errors.whatsappNumber && (
                    <p className="form-error">{errors.whatsappNumber}</p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <SectionTitle>
                D — සහභාගී වන දක්ෂතා ශ්‍රේණි / Competency Levels Entering
              </SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {COMPETENCY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: `1.5px solid ${competencyLevels.includes(opt.value) ? "#1a3a5c" : "#e2e8f0"}`,
                      background: competencyLevels.includes(opt.value)
                        ? "#eff6ff"
                        : "#fff",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={competencyLevels.includes(opt.value)}
                      onChange={() => toggleCompetency(opt.value)}
                      style={{ width: 16, height: 16, accentColor: "#1a3a5c" }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontFamily: "Noto Sans Sinhala, sans-serif",
                        color: "#1a3a5c",
                      }}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <SectionTitle>E — අතිරේක සටහන් / Additional Notes</SectionTitle>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                className="form-control"
                rows={3}
                placeholder="ඕනෑම අතිරේක තොරතුරු / Any additional information..."
                style={{
                  resize: "none",
                  fontFamily: "Noto Sans Sinhala, sans-serif",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 24px",
                border: "none",
                borderRadius: 10,
                background: "#1a3a5c",
                color: "#c8a951",
                fontWeight: 700,
                fontSize: 16,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              {loading ? (
                "⏳ ඉදිරිපත් කරමින්... / Submitting..."
              ) : (
                <>
                  <span style={{ fontFamily: "Noto Sans Sinhala, sans-serif" }}>
                    ලියාපදිංචිය ඉදිරිපත් කරන්න
                  </span>
                  <span style={{ marginLeft: 8 }}>/ Submit Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
