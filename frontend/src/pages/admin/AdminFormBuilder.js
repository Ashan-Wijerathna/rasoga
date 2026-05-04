import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import DynamicField from "../../components/common/DynamicField";

const FIELD_TYPES = [
  { value: "text", label: "Text Input", color: "#3b82f6" },
  { value: "textarea", label: "Long Text / Textarea", color: "#6366f1" },
  { value: "email", label: "Email Address", color: "#14b8a6" },
  { value: "tel", label: "Phone Number", color: "#06b6d4" },
  { value: "number", label: "Number", color: "#f59e0b" },
  { value: "date", label: "Date", color: "#f97316" },
  { value: "select", label: "Dropdown Select", color: "#8b5cf6" },
  { value: "radio", label: "Radio Buttons", color: "#ec4899" },
  { value: "checkbox", label: "Checkboxes", color: "#10b981" },
  { value: "file_image", label: "Image Upload", color: "#22c55e" },
  { value: "file_pdf", label: "PDF Upload", color: "#ef4444" },
  { value: "file_any", label: "Any File Upload", color: "#64748b" },
];

const TYPE_COLORS = Object.fromEntries(
  FIELD_TYPES.map((t) => [t.value, t.color]),
);

const emptyForm = {
  fieldLabel: "",
  fieldLabelSinhala: "",
  fieldName: "",
  fieldType: "text",
  isRequired: false,
  isActive: true,
  placeholder: "",
  placeholderSinhala: "",
  helpText: "",
  helpTextSinhala: "",
  section: "",
  sectionSinhala: "",
  showOnStep: "",
  displayOrder: "",
  adminOnly: false,
  fieldOptions: [],
  validationRules: {},
  eventId: null,
};

function toLabelKey(str) {
  return str
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w, i) =>
      i === 0
        ? w.toLowerCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join("");
}

export default function AdminFormBuilder() {
  const [activeTab, setActiveTab] = useState("school_registration");
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [fields, setFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const [panelMode, setPanelMode] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewValues, setPreviewValues] = useState({});

  useEffect(() => {
    axiosInstance
      .get("/api/events")
      .then((r) => setEvents(r.data.events || r.data || []))
      .catch(() => {});
  }, []);

  const fetchFields = useCallback(() => {
    setLoadingFields(true);
    const url = selectedEventId
      ? `/api/form-fields/admin/${activeTab}?eventId=${selectedEventId}`
      : `/api/form-fields/admin/${activeTab}`;
    axiosInstance
      .get(url)
      .then((r) => setFields(r.data.fields || []))
      .catch(() => toast.error("Failed to load fields"))
      .finally(() => setLoadingFields(false));
  }, [activeTab, selectedEventId]); // eslint-disable-line

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setFormErrors({});
    setEditingField(null);
    setPanelMode("add");
  };

  const openEdit = (field) => {
    setForm({
      fieldLabel: field.fieldLabel || "",
      fieldLabelSinhala: field.fieldLabelSinhala || "",
      fieldName: field.fieldName || "",
      fieldType: field.fieldType || "text",
      isRequired: field.isRequired || false,
      isActive: field.isActive !== false,
      placeholder: field.placeholder || "",
      placeholderSinhala: field.placeholderSinhala || "",
      helpText: field.helpText || "",
      helpTextSinhala: field.helpTextSinhala || "",
      section: field.section || "",
      sectionSinhala: field.sectionSinhala || "",
      showOnStep: field.showOnStep || "",
      displayOrder: field.displayOrder || "",
      adminOnly: field.adminOnly || false,
      fieldOptions: field.fieldOptions || [],
      validationRules: field.validationRules || {},
      eventId: field.eventId || null,
    });
    setFormErrors({});
    setEditingField(field);
    setPanelMode("edit");
  };

  const handleFormChange = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "fieldLabel" && panelMode === "add") {
        next.fieldName = toLabelKey(value);
      }
      return next;
    });
    setFormErrors((prev) => ({ ...prev, [key]: null }));
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      fieldOptions: [
        ...(prev.fieldOptions || []),
        { value: "", label: "", labelSi: "" },
      ],
    }));
  };

  const updateOption = (idx, key, value) => {
    setForm((prev) => ({
      ...prev,
      fieldOptions: prev.fieldOptions.map((o, i) =>
        i === idx ? { ...o, [key]: value } : o,
      ),
    }));
  };

  const removeOption = (idx) => {
    setForm((prev) => ({
      ...prev,
      fieldOptions: prev.fieldOptions.filter((_, i) => i !== idx),
    }));
  };

  const updateValidation = (key, value) => {
    setForm((prev) => ({
      ...prev,
      validationRules: {
        ...prev.validationRules,
        [key]: value === "" ? undefined : value,
      },
    }));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.fieldLabel.trim()) errs.fieldLabel = "Field label is required";
    if (!form.fieldName.trim()) errs.fieldName = "Field name (key) is required";
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(form.fieldName))
      errs.fieldName = "Field name must start with a letter, no spaces";
    if (!form.fieldType) errs.fieldType = "Field type is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        formType: activeTab,
        eventId: form.eventId || null,
        showOnStep: form.showOnStep ? parseInt(form.showOnStep) : null,
        displayOrder:
          form.displayOrder !== "" ? parseInt(form.displayOrder) : undefined,
        fieldOptions: ["select", "radio", "checkbox"].includes(form.fieldType)
          ? form.fieldOptions
          : null,
        validationRules:
          Object.keys(form.validationRules).length > 0
            ? form.validationRules
            : null,
      };

      if (panelMode === "add") {
        await axiosInstance.post("/api/form-fields", payload);
        toast.success("Field created successfully");
      } else {
        await axiosInstance.put(`/api/form-fields/${editingField.id}`, payload);
        toast.success("Field updated successfully");
      }

      fetchFields();
      setPanelMode(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save field");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (field) => {
    try {
      await axiosInstance.post(`/api/form-fields/${field.id}/toggle`, {});
      fetchFields();
    } catch {
      toast.error("Failed to toggle field");
    }
  };

  const moveField = async (idx, direction) => {
    const newFields = [...fields];
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= newFields.length) return;
    [newFields[idx], newFields[swapIdx]] = [newFields[swapIdx], newFields[idx]];
    setFields(newFields);
    setSavingOrder(true);
    try {
      await axiosInstance.put("/api/form-fields/reorder/bulk", {
        fields: newFields.map((f, i) => ({ id: f.id, displayOrder: i })),
      });
    } catch {
      toast.error("Failed to save order");
      fetchFields();
    } finally {
      setSavingOrder(false);
    }
  };

  const grouped = {};
  const ungrouped = [];
  fields.forEach((f) => {
    if (f.section) {
      if (!grouped[f.section]) grouped[f.section] = [];
      grouped[f.section].push(f);
    } else {
      ungrouped.push(f);
    }
  });

  const FieldCard = ({ field, idx }) => (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "12px 16px",
        background: field.isActive ? "#fff" : "#f8fafc",
        marginBottom: 8,
        opacity: field.isActive ? 1 : 0.6,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <button
          onClick={() => moveField(idx, -1)}
          disabled={idx === 0}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 4,
            width: 22,
            height: 22,
            cursor: "pointer",
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ▲
        </button>
        <button
          onClick={() => moveField(idx, 1)}
          disabled={idx === fields.length - 1}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 4,
            width: 22,
            height: 22,
            cursor: "pointer",
            fontSize: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ▼
        </button>
      </div>

      <span
        style={{
          background: TYPE_COLORS[field.fieldType] || "#64748b",
          color: "#fff",
          borderRadius: 5,
          padding: "2px 8px",
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {field.fieldType.replace("_", " ")}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {field.fieldLabel}
          {field.isRequired && (
            <span style={{ color: "red", fontSize: 16 }}>*</span>
          )}
          {field.adminOnly && (
            <span
              style={{
                fontSize: 10,
                background: "#fef3c7",
                color: "#92400e",
                borderRadius: 4,
                padding: "1px 5px",
              }}
            >
              Admin
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          key:{" "}
          <code
            style={{ background: "#f1f5f9", padding: "0 4px", borderRadius: 3 }}
          >
            {field.fieldName}
          </code>
          {field.showOnStep && (
            <span style={{ marginLeft: 8 }}>· Step {field.showOnStep}</span>
          )}
          {field.section && (
            <span style={{ marginLeft: 8 }}>· §{field.section}</span>
          )}
        </div>
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 5,
            background: field.isActive ? "#dcfce7" : "#f1f5f9",
            color: field.isActive ? "#166534" : "#64748b",
          }}
        >
          {field.isActive ? "Active" : "Inactive"}
        </span>
        <button
          onClick={() => openEdit(field)}
          className="btn btn-sm btn-outline"
          style={{ fontSize: 12 }}
        >
          Edit
        </button>
        <button
          onClick={() => handleToggle(field)}
          className="btn btn-sm btn-outline"
          style={{ fontSize: 12 }}
        >
          {field.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  );

  const hasOptions = ["select", "radio", "checkbox"].includes(form.fieldType);
  const isFileType = form.fieldType.startsWith("file_");
  const isTextType = ["text", "textarea", "email", "tel"].includes(
    form.fieldType,
  );
  const isNumType = form.fieldType === "number";

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>Form Builder</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Customize school registration and event application forms without
            any coding
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            {
              key: "school_registration",
              label: "🏫 School Registration Form",
            },
            { key: "event_application", label: "📝 Event Application Form" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPanelMode(null);
              }}
              className={
                activeTab === tab.key ? "btn btn-primary" : "btn btn-outline"
              }
              style={{ fontWeight: 600 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "event_application" && (
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              Select Event:
            </label>
            <select
              className="form-control"
              style={{ maxWidth: 320 }}
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="">All Events (global fields)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: panelMode ? "1fr 420px" : "1fr",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 17 }}>
                Form Fields
                {savingOrder && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginLeft: 10,
                    }}
                  >
                    Saving order…
                  </span>
                )}
              </h2>
              <button className="btn btn-primary btn-sm" onClick={openAdd}>
                + Add Field
              </button>
            </div>
            <div className="card-body">
              {loadingFields ? (
                <div className="loading-center">
                  <div className="spinner" />
                </div>
              ) : fields.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--text-muted)",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🗒️</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>
                    No custom fields added yet
                  </div>
                  <div style={{ fontSize: 13 }}>
                    Click "Add Field" to add your first custom field
                  </div>
                </div>
              ) : (
                <div>
                  {ungrouped.map((field, idx) => (
                    <FieldCard
                      key={field.id}
                      field={field}
                      idx={fields.indexOf(field)}
                    />
                  ))}
                  {Object.entries(grouped).map(([section, sFields]) => (
                    <div key={section} style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          padding: "6px 0",
                          borderBottom: "1px solid var(--border)",
                          marginBottom: 8,
                        }}
                      >
                        — {section} —
                      </div>
                      {sFields.map((field) => (
                        <FieldCard
                          key={field.id}
                          field={field}
                          idx={fields.indexOf(field)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {panelMode && (
            <div
              className="card"
              style={{ height: "fit-content", position: "sticky", top: 16 }}
            >
              <div className="card-header">
                <h2 style={{ fontSize: 17 }}>
                  {panelMode === "add" ? "Add New Field" : "Edit Field"}
                </h2>
                <button
                  onClick={() => setPanelMode(null)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 20,
                    cursor: "pointer",
                    color: "var(--text-muted)",
                  }}
                >
                  ×
                </button>
              </div>
              <div
                className="card-body"
                style={{ maxHeight: "78vh", overflowY: "auto" }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--primary)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 12,
                  }}
                >
                  Basic Info
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Field Label (English){" "}
                    <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    className={`form-control${formErrors.fieldLabel ? " error" : ""}`}
                    placeholder="e.g. Parent's Phone Number"
                    value={form.fieldLabel}
                    onChange={(e) =>
                      handleFormChange("fieldLabel", e.target.value)
                    }
                  />
                  {formErrors.fieldLabel && (
                    <p className="form-error">{formErrors.fieldLabel}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Field Label (Sinhala)</label>
                  <input
                    className="form-control"
                    placeholder="e.g. දෙමාපිය දුරකථන"
                    value={form.fieldLabelSinhala}
                    onChange={(e) =>
                      handleFormChange("fieldLabelSinhala", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Field Name (key) <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    className={`form-control${formErrors.fieldName ? " error" : ""}`}
                    placeholder="e.g. parentPhone"
                    value={form.fieldName}
                    onChange={(e) =>
                      handleFormChange("fieldName", e.target.value)
                    }
                  />
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 3,
                    }}
                  >
                    Unique identifier — no spaces, use camelCase
                    {panelMode === "add" && form.fieldLabel && (
                      <span>
                        {" "}
                        · Auto: <strong>{toLabelKey(form.fieldLabel)}</strong>
                      </span>
                    )}
                  </p>
                  {formErrors.fieldName && (
                    <p className="form-error">{formErrors.fieldName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Field Type <span style={{ color: "red" }}>*</span>
                  </label>
                  <select
                    className={`form-control${formErrors.fieldType ? " error" : ""}`}
                    value={form.fieldType}
                    onChange={(e) =>
                      handleFormChange("fieldType", e.target.value)
                    }
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {hasOptions && (
                  <>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--primary)",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 10,
                        marginTop: 4,
                        paddingTop: 12,
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      Field Options
                    </div>
                    {(form.fieldOptions || []).map((opt, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr auto",
                          gap: 6,
                          marginBottom: 6,
                        }}
                      >
                        <input
                          className="form-control"
                          placeholder="value"
                          style={{ fontSize: 12 }}
                          value={opt.value}
                          onChange={(e) =>
                            updateOption(idx, "value", e.target.value)
                          }
                        />
                        <input
                          className="form-control"
                          placeholder="Label (EN)"
                          style={{ fontSize: 12 }}
                          value={opt.label}
                          onChange={(e) =>
                            updateOption(idx, "label", e.target.value)
                          }
                        />
                        <input
                          className="form-control"
                          placeholder="Label (සිං)"
                          style={{ fontSize: 12 }}
                          value={opt.labelSi}
                          onChange={(e) =>
                            updateOption(idx, "labelSi", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--danger)",
                            fontSize: 18,
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={addOption}
                      style={{ marginBottom: 12 }}
                    >
                      + Add Option
                    </button>
                  </>
                )}

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--primary)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 12,
                    marginTop: 4,
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  Configuration
                </div>

                <div
                  className="form-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <label style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>
                    Required Field
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.isRequired}
                      onChange={(e) =>
                        handleFormChange("isRequired", e.target.checked)
                      }
                    />
                    <span style={{ fontSize: 13 }}>
                      {form.isRequired ? "Yes" : "No"}
                    </span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Placeholder (English)</label>
                  <input
                    className="form-control"
                    placeholder="Shown inside the input"
                    value={form.placeholder}
                    onChange={(e) =>
                      handleFormChange("placeholder", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Placeholder (Sinhala)</label>
                  <input
                    className="form-control"
                    placeholder="ආදාන ක්ෂේත්‍රයේ දැකෙන"
                    value={form.placeholderSinhala}
                    onChange={(e) =>
                      handleFormChange("placeholderSinhala", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Help Text (English)</label>
                  <input
                    className="form-control"
                    placeholder="Shown below the field"
                    value={form.helpText}
                    onChange={(e) =>
                      handleFormChange("helpText", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Help Text (Sinhala)</label>
                  <input
                    className="form-control"
                    placeholder="ක්ෂේත්‍රය යටතේ දැකෙන"
                    value={form.helpTextSinhala}
                    onChange={(e) =>
                      handleFormChange("helpTextSinhala", e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Section / Group</label>
                  <input
                    className="form-control"
                    placeholder="e.g. Personal Details, School Info"
                    value={form.section}
                    onChange={(e) =>
                      handleFormChange("section", e.target.value)
                    }
                  />
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 3,
                    }}
                  >
                    Fields with same section name are grouped together
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label">Section Name (Sinhala)</label>
                  <input
                    className="form-control"
                    placeholder="e.g. පෞද්ගලික විස්තර"
                    value={form.sectionSinhala}
                    onChange={(e) =>
                      handleFormChange("sectionSinhala", e.target.value)
                    }
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Form Step</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="1, 2 or 3"
                      min="1"
                      max="3"
                      value={form.showOnStep}
                      onChange={(e) =>
                        handleFormChange("showOnStep", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Auto"
                      value={form.displayOrder}
                      onChange={(e) =>
                        handleFormChange("displayOrder", e.target.value)
                      }
                    />
                  </div>
                </div>

                <details style={{ marginBottom: 12 }}>
                  <summary
                    style={{
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      padding: "8px 0",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    Validation Rules
                  </summary>
                  <div style={{ paddingTop: 10 }}>
                    {isTextType && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        <div className="form-group">
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Min Length
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            style={{ fontSize: 12 }}
                            value={form.validationRules?.minLength || ""}
                            onChange={(e) =>
                              updateValidation(
                                "minLength",
                                e.target.value ? parseInt(e.target.value) : "",
                              )
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Max Length
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            style={{ fontSize: 12 }}
                            value={form.validationRules?.maxLength || ""}
                            onChange={(e) =>
                              updateValidation(
                                "maxLength",
                                e.target.value ? parseInt(e.target.value) : "",
                              )
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
                            Pattern (RegEx)
                          </label>
                          <input
                            className="form-control"
                            style={{ fontSize: 12 }}
                            placeholder="e.g. ^[A-Z0-9]+$"
                            value={form.validationRules?.pattern || ""}
                            onChange={(e) =>
                              updateValidation("pattern", e.target.value)
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
                            Pattern Error Message
                          </label>
                          <input
                            className="form-control"
                            style={{ fontSize: 12 }}
                            placeholder="e.g. Only uppercase letters"
                            value={form.validationRules?.patternMessage || ""}
                            onChange={(e) =>
                              updateValidation("patternMessage", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                    {isNumType && (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        <div className="form-group">
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Min Value
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            style={{ fontSize: 12 }}
                            value={form.validationRules?.min || ""}
                            onChange={(e) =>
                              updateValidation(
                                "min",
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : "",
                              )
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label
                            className="form-label"
                            style={{ fontSize: 12 }}
                          >
                            Max Value
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            style={{ fontSize: 12 }}
                            value={form.validationRules?.max || ""}
                            onChange={(e) =>
                              updateValidation(
                                "max",
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : "",
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                    {isFileType && (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 12 }}>
                          Max File Size (MB)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          style={{ fontSize: 12 }}
                          placeholder="5"
                          value={form.validationRules?.fileMaxSizeMB || ""}
                          onChange={(e) =>
                            updateValidation(
                              "fileMaxSizeMB",
                              e.target.value ? parseFloat(e.target.value) : "",
                            )
                          }
                        />
                      </div>
                    )}
                    {!isTextType && !isNumType && !isFileType && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        No validation rules for this field type.
                      </div>
                    )}
                  </div>
                </details>

                <div
                  className="form-group"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <label style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>
                    Admin Only
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.adminOnly}
                      onChange={(e) =>
                        handleFormChange("adminOnly", e.target.checked)
                      }
                    />
                    <span style={{ fontSize: 13 }}>
                      {form.adminOnly
                        ? "Yes — hidden from public"
                        : "No — visible in public form"}
                    </span>
                  </label>
                </div>

                {activeTab === "event_application" && (
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.eventId !== null && form.eventId !== ""}
                        onChange={(e) =>
                          handleFormChange(
                            "eventId",
                            e.target.checked ? selectedEventId || "" : null,
                          )
                        }
                      />
                      Specific to one event only
                    </label>
                    {form.eventId !== null && form.eventId !== "" && (
                      <select
                        className="form-control"
                        style={{ marginTop: 8 }}
                        value={form.eventId || ""}
                        onChange={(e) =>
                          handleFormChange("eventId", e.target.value || null)
                        }
                      >
                        <option value="">— Select Event —</option>
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <button
                    className="btn btn-outline"
                    onClick={() => setPanelMode(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    {saving
                      ? "Saving…"
                      : panelMode === "add"
                        ? "Create Field"
                        : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginBottom: 32 }}>
          <div className="card-header">
            <h2 style={{ fontSize: 17 }}>Live Form Preview</h2>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPreviewOpen(true)}
            >
              👁️ Preview Form
            </button>
          </div>
          <div
            className="card-body"
            style={{ color: "var(--text-muted)", fontSize: 13 }}
          >
            Click "Preview Form" to see how your custom fields will appear to
            students.
          </div>
        </div>
      </div>

      {previewOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15,35,56,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "var(--primary)",
                padding: "16px 20px",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                Form Preview — as seen by students
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#fff",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: 24 }}>
              {fields.filter((f) => f.isActive && !f.adminOnly).length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    padding: 24,
                  }}
                >
                  No active public fields to preview.
                </div>
              ) : (
                fields
                  .filter((f) => f.isActive && !f.adminOnly)
                  .map((field) => (
                    <DynamicField
                      key={field.fieldName}
                      field={field}
                      value={previewValues[field.fieldName]}
                      onChange={(name, val) =>
                        setPreviewValues((prev) => ({ ...prev, [name]: val }))
                      }
                      error={null}
                      language="en"
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
