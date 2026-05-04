import { useState, useEffect } from "react";
import { schoolsAPI } from "../../services/api";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const PROVINCES = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy code"
      style={{
        background: copied ? "var(--success)" : "var(--bg)",
        border: `1px solid ${copied ? "var(--success)" : "var(--border)"}`,
        borderRadius: 6,
        padding: "2px 8px",
        cursor: "pointer",
        fontSize: 11,
        color: copied ? "#fff" : "var(--text-muted)",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? "✓ Copied" : "⎘ Copy"}
    </button>
  );
}

function EditSchoolModal({ school, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: school.name || "",
    district: school.district || "",
    zone: school.zone || "",
    province: school.province || "",
    address: school.address || "",
    contactEmail: school.contactEmail || "",
    contactPhone: school.contactPhone || "",
    principalName: school.principalName || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const required = [
      "name",
      "district",
      "zone",
      "province",
      "address",
      "contactEmail",
      "contactPhone",
    ];
    for (const f of required) {
      if (!form[f].trim()) {
        toast.error(`${f} is required`);
        return;
      }
    }
    setSaving(true);
    try {
      await schoolsAPI.update(school.id, form);
      toast.success("School updated successfully");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 560,
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
          overflow: "hidden",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: "var(--primary)",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
              Edit School
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {school.code}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 22,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={save} style={{ padding: 24 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
          >
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">
                School Name <span className="required">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                District <span className="required">*</span>
              </label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Zone <span className="required">*</span>
              </label>
              <input
                name="zone"
                value={form.zone}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Province <span className="required">*</span>
              </label>
              <select
                name="province"
                value={form.province}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select province</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Principal Name</label>
              <input
                name="principalName"
                value={form.principalName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact Phone <span className="required">*</span>
              </label>
              <input
                name="contactPhone"
                value={form.contactPhone}
                onChange={handleChange}
                className="form-control"
                type="tel"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact Email <span className="required">*</span>
              </label>
              <input
                name="contactEmail"
                value={form.contactEmail}
                onChange={handleChange}
                className="form-control"
                type="email"
              />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">
                Address <span className="required">*</span>
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SchoolForm({ onSave, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await schoolsAPI.create(data);
      toast.success(`School created! Code: ${res.data.school?.code}`);
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          ["name", "School Name", "text", "Dhaham School Colombo", true],
          ["district", "District", "text", "Colombo", true],
          ["zone", "Zone", "text", "Zone 1", true],
          ["principalName", "Principal Name", "text", "", false],
          ["password", "Login Password", "password", "Min 6 chars", true],
        ].map(([name, label, type, placeholder, req]) => (
          <div key={name} className="form-group">
            <label className="form-label">
              {label} {req && <span className="required">*</span>}
            </label>
            <input
              {...register(name, req ? { required: `${label} required` } : {})}
              type={type}
              className={`form-control ${errors[name] ? "error" : ""}`}
              placeholder={placeholder}
            />
            {errors[name] && (
              <p className="form-error">{errors[name].message}</p>
            )}
          </div>
        ))}

        <div className="form-group">
          <label className="form-label">
            Contact Phone <span className="required">*</span>
          </label>
          <input
            {...register("contactPhone", { required: "Contact phone required" })}
            type="tel"
            className={`form-control ${errors.contactPhone ? "error" : ""}`}
            placeholder="0112xxxxxx"
          />
          {errors.contactPhone && (
            <p className="form-error">{errors.contactPhone.message}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Contact Email <span className="required">*</span>
          </label>
          <input
            {...register("contactEmail", { required: "Contact email required" })}
            type="email"
            className={`form-control ${errors.contactEmail ? "error" : ""}`}
            placeholder="school@dhaham.lk"
          />
          {errors.contactEmail && (
            <p className="form-error">{errors.contactEmail.message}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            School Code{" "}
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
              (auto-generated if blank)
            </span>
          </label>
          <input
            {...register("code")}
            className="form-control"
            placeholder="e.g. DHS-CMB-001"
            style={{ fontFamily: "monospace", letterSpacing: 1 }}
          />
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>
            Leave blank to auto-generate based on district
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">
            Province <span className="required">*</span>
          </label>
          <select
            {...register("province", { required: "Province required" })}
            className="form-control"
          >
            <option value="">Select province</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {errors.province && (
            <p className="form-error">{errors.province.message}</p>
          )}
        </div>

        <div className="form-group" style={{ gridColumn: "1 / -1" }}>
          <label className="form-label">
            Address <span className="required">*</span>
          </label>
          <input
            {...register("address", { required: "Address required" })}
            className="form-control"
            placeholder="Full school address"
          />
          {errors.address && (
            <p className="form-error">{errors.address.message}</p>
          )}
        </div>
      </div>

      <div className="alert alert-info" style={{ fontSize: 13, marginTop: 8 }}>
        A login account will be created using the contact email and password.
        The school code will be shared with students to verify enrollment during
        applications.
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: "center" }}
          disabled={saving}
        >
          {saving ? "Creating..." : "Create School"}
        </button>
      </div>
    </form>
  );
}

export default function AdminSchools() {
  const { can, isMasterAdmin } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editingSchool, setEditingSchool] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const load = () => {
    schoolsAPI
      .getAll({ search: search || undefined })
      .then((r) => setSchools(r.data.schools || []))
      .catch(() => setSchools([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [search]);

  const toggle = async (id) => {
    try {
      await schoolsAPI.toggle(id);
      toast.success("Status updated");
      load();
    } catch {
      toast.error("Failed");
    }
  };

  const deleteSchool = async (id) => {
    try {
      await schoolsAPI.delete(id);
      toast.success("School deleted");
      setConfirmDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h1 style={{ fontSize: 26 }}>Schools Management</h1>
          {(isMasterAdmin || can('schools', 'create')) && (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(!showForm)}
            >
              + Add School
            </button>
          )}
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <h2 style={{ fontSize: 18 }}>Register New School</h2>
            </div>
            <div className="card-body">
              <SchoolForm
                onSave={() => {
                  setShowForm(false);
                  load();
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body">
            <input
              className="form-control"
              placeholder="Search schools by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                    <th>School Name</th>
                    <th>School Code</th>
                    <th>District</th>
                    <th>Province</th>
                    <th>Zone</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: "center",
                          color: "var(--text-muted)",
                          padding: 40,
                        }}
                      >
                        No schools registered.
                      </td>
                    </tr>
                  ) : (
                    schools.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600, fontSize: 14 }}>
                          {s.name}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                background: "var(--primary)",
                                color: "#fff",
                                borderRadius: 6,
                                padding: "3px 10px",
                                fontFamily: "monospace",
                                fontSize: 12,
                                fontWeight: 700,
                                letterSpacing: 1,
                              }}
                            >
                              {s.code}
                            </span>
                            <CopyButton text={s.code} />
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>{s.district}</td>
                        <td style={{ fontSize: 13 }}>{s.province}</td>
                        <td style={{ fontSize: 13 }}>{s.zone}</td>
                        <td
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          {s.contactEmail}
                        </td>
                        <td>
                          <span
                            className={`badge ${s.isActive ? "badge-approved" : "badge-rejected"}`}
                          >
                            {s.isActive ? "Active" : "Inactive"}
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
                            {(isMasterAdmin || can('schools', 'edit')) && (
                              <button
                                className="btn btn-sm btn-outline"
                                style={{ padding: "3px 8px", fontSize: 11 }}
                                onClick={() => setEditingSchool(s)}
                              >
                                ✏️ Edit
                              </button>
                            )}
                            {(isMasterAdmin || can('schools', 'edit')) && (
                              <button
                                className={`btn btn-sm ${s.isActive ? "btn-danger" : "btn-success"}`}
                                style={{ padding: "3px 8px", fontSize: 11 }}
                                onClick={() => toggle(s.id)}
                              >
                                {s.isActive ? "Deactivate" : "Activate"}
                              </button>
                            )}
                            {(isMasterAdmin || can('schools', 'delete')) && (
                              confirmDeleteId === s.id ? (
                                <span
                                  style={{
                                    display: "flex",
                                    gap: 4,
                                    alignItems: "center",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "var(--danger)",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Sure?
                                  </span>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    style={{ padding: "3px 8px", fontSize: 11 }}
                                    onClick={() => deleteSchool(s.id)}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline"
                                    style={{ padding: "3px 8px", fontSize: 11 }}
                                    onClick={() => setConfirmDeleteId(null)}
                                  >
                                    No
                                  </button>
                                </span>
                              ) : (
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    background: "none",
                                    color: "var(--danger)",
                                    border: "1px solid var(--danger)",
                                    padding: "3px 8px",
                                    fontSize: 11,
                                  }}
                                  onClick={() => setConfirmDeleteId(s.id)}
                                >
                                  🗑 Delete
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editingSchool && (
        <EditSchoolModal
          school={editingSchool}
          onClose={() => setEditingSchool(null)}
          onSaved={() => {
            setEditingSchool(null);
            load();
          }}
        />
      )}
    </div>
  );
}
