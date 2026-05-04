import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import { downloadBlob } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

export default function AdminReports() {
  const { can, isMasterAdmin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    eventId: "",
    schoolId: "",
  });

  useEffect(() => {
    axiosInstance
      .get("/api/reports/summary")
      .then((r) => {
        setSummary(r.data.summary);
        setEvents(r.data.events);
        setSchools(r.data.schools);
      })
      .catch(() => toast.error("Failed to load report data"))
      .finally(() => setLoading(false));
  }, []);

  const download = async (url, filename, type, key) => {
    setDownloading(key);
    try {
      const res = await axiosInstance.get("/api" + url, {
        responseType: "arraybuffer",
        params: filters,
      });
      const mimeType =
        type === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      downloadBlob(res.data, filename, mimeType);
      toast.success(`${filename} downloaded!`);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const isLoading = (key) => downloading === key;

  if (!isMasterAdmin && !can('reports', 'view')) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, marginBottom: 6 }}>Reports</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Download detailed reports in PDF or Excel format.
          </p>
        </div>

        {summary && (
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            {[
              {
                icon: "📋",
                label: "Total Applications",
                val: summary.totalApplications,
                color: "var(--primary)",
              },
              {
                icon: "⏳",
                label: "Pending",
                val: summary.pending,
                color: "var(--warning)",
              },
              {
                icon: "✅",
                label: "Approved",
                val: summary.approved,
                color: "var(--success)",
              },
              {
                icon: "❌",
                label: "Rejected",
                val: summary.rejected,
                color: "var(--danger)",
              },
              {
                icon: "🏫",
                label: "Schools",
                val: summary.totalSchools,
                color: "var(--primary-light)",
              },
              {
                icon: "📅",
                label: "Events",
                val: summary.totalEvents,
                color: "#7c3aed",
              },
            ].map(({ icon, label, val, color }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon">{icon}</div>
                <div className="stat-value" style={{ color }}>
                  {val ?? 0}
                </div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2 style={{ fontSize: 18 }}>📋 All Applications Report</h2>
          </div>
          <div className="card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Filter by Status</label>
                <select
                  className="form-control"
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Filter by Event</label>
                <select
                  className="form-control"
                  value={filters.eventId}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, eventId: e.target.value }))
                  }
                >
                  <option value="">All Events</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Filter by School</label>
                <select
                  className="form-control"
                  value={filters.schoolId}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, schoolId: e.target.value }))
                  }
                >
                  <option value="">All Schools</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                className="btn btn-primary"
                onClick={() =>
                  download(
                    "/reports/applications/pdf",
                    "applications-report.pdf",
                    "pdf",
                    "all-pdf",
                  )
                }
                disabled={isLoading("all-pdf")}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {isLoading("all-pdf") ? "⏳ Generating..." : "📄 Download PDF"}
              </button>
              <button
                className="btn btn-success"
                onClick={() =>
                  download(
                    "/reports/applications/excel",
                    "applications-report.xlsx",
                    "excel",
                    "all-excel",
                  )
                }
                disabled={isLoading("all-excel")}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {isLoading("all-excel")
                  ? "⏳ Generating..."
                  : "📊 Download Excel"}
              </button>
            </div>

            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                background: "var(--bg)",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              <strong>PDF</strong> — A3 landscape format with all application
              details, status badges and summary stats.
              <br />
              <strong>Excel</strong> — Full spreadsheet with all columns,
              color-coded statuses, filterable.
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2 style={{ fontSize: 18 }}>📅 Event-wise Reports</h2>
          </div>
          <div className="card-body">
            <div
              style={{
                marginBottom: 20,
                padding: "16px",
                background: "var(--bg)",
                borderRadius: 10,
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                All Events Summary
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 12,
                }}
              >
                One Excel file with a summary sheet and one sheet per event.
              </p>
              <button
                className="btn btn-success"
                onClick={() =>
                  download(
                    "/reports/events/excel",
                    "events-report.xlsx",
                    "excel",
                    "events-excel",
                  )
                }
                disabled={isLoading("events-excel")}
              >
                {isLoading("events-excel")
                  ? "⏳ Generating..."
                  : "📊 Download All Events Excel"}
              </button>
            </div>

            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              Individual Event PDF Reports:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {events.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  No events found.
                </p>
              ) : (
                events.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      background: "var(--bg)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        <span
                          className={"badge badge-" + ev.type}
                          style={{ marginRight: 8 }}
                        >
                          {ev.type}
                        </span>
                        {ev.eventDate
                          ? new Date(ev.eventDate).toLocaleDateString("en-LK")
                          : "—"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          download(
                            `/reports/events/${ev.id}/pdf`,
                            `event-${ev.id}-report.pdf`,
                            "pdf",
                            `event-pdf-${ev.id}`,
                          )
                        }
                        disabled={isLoading(`event-pdf-${ev.id}`)}
                      >
                        {isLoading(`event-pdf-${ev.id}`) ? "..." : "📄 PDF"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2 style={{ fontSize: 18 }}>🏫 School-wise Reports</h2>
          </div>
          <div className="card-body">
            <div
              style={{
                marginBottom: 20,
                padding: "16px",
                background: "var(--bg)",
                borderRadius: 10,
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                All Schools Summary
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 12,
                }}
              >
                One Excel with summary + one sheet per school showing all their
                students.
              </p>
              <button
                className="btn btn-success"
                onClick={() =>
                  download(
                    "/reports/schools/excel",
                    "schools-report.xlsx",
                    "excel",
                    "schools-excel",
                  )
                }
                disabled={isLoading("schools-excel")}
              >
                {isLoading("schools-excel")
                  ? "⏳ Generating..."
                  : "📊 Download All Schools Excel"}
              </button>
            </div>

            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              Individual School PDF Reports:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {schools.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  No schools found.
                </p>
              ) : (
                schools.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      background: "var(--bg)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        <code
                          style={{
                            fontSize: 11,
                            background: "#f1f5f9",
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {s.code}
                        </code>
                        <span style={{ marginLeft: 8 }}>{s.district}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          download(
                            `/reports/schools/${s.id}/pdf`,
                            `school-${s.code}-report.pdf`,
                            "pdf",
                            `school-pdf-${s.id}`,
                          )
                        }
                        disabled={isLoading(`school-pdf-${s.id}`)}
                      >
                        {isLoading(`school-pdf-${s.id}`) ? "..." : "📄 PDF"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: 18 }}>⚡ Quick Downloads</h2>
          </div>
          <div className="card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {[
                {
                  label: "All Pending — PDF",
                  url: "/reports/applications/pdf",
                  file: "pending-applications.pdf",
                  type: "pdf",
                  key: "quick-pending-pdf",
                  params: { status: "pending" },
                },
                {
                  label: "All Approved — PDF",
                  url: "/reports/applications/pdf",
                  file: "approved-applications.pdf",
                  type: "pdf",
                  key: "quick-approved-pdf",
                  params: { status: "approved" },
                },
                {
                  label: "All Pending — Excel",
                  url: "/reports/applications/excel",
                  file: "pending-applications.xlsx",
                  type: "excel",
                  key: "quick-pending-excel",
                  params: { status: "pending" },
                },
                {
                  label: "All Approved — Excel",
                  url: "/reports/applications/excel",
                  file: "approved-applications.xlsx",
                  type: "excel",
                  key: "quick-approved-excel",
                  params: { status: "approved" },
                },
              ].map((item) => (
                <button
                  key={item.key}
                  className="btn btn-outline"
                  style={{ justifyContent: "center", fontSize: 13 }}
                  disabled={isLoading(item.key)}
                  onClick={async () => {
                    setDownloading(item.key);
                    try {
                      const res = await axiosInstance.get("/api" + item.url, {
                        responseType: "arraybuffer",
                        params: item.params,
                      });
                      const mimeType =
                        item.type === "pdf"
                          ? "application/pdf"
                          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                      downloadBlob(res.data, item.file, mimeType);
                      toast.success("Downloaded!");
                    } catch {
                      toast.error("Failed");
                    } finally {
                      setDownloading(null);
                    }
                  }}
                >
                  {isLoading(item.key)
                    ? "⏳..."
                    : (item.type === "pdf" ? "📄 " : "📊 ") + item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
