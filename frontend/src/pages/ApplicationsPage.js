import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationsAPI } from "../services/api";
import { format } from "date-fns";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    applicationsAPI
      .getAll({ status: filter || undefined })
      .then((r) => setApplications(r.data.applications || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [filter]);

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
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>My Applications</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Track your event application status
            </p>
          </div>
          <Link to="/events" className="btn btn-primary btn-sm">
            Browse Events
          </Link>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
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

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : applications.length === 0 ? (
          <div
            className="card card-body"
            style={{ textAlign: "center", padding: 60 }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ color: "var(--text-muted)" }}>No applications found.</p>
            <Link
              to="/events"
              className="btn btn-primary btn-sm"
              style={{ marginTop: 12, display: "inline-flex" }}
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Reg. No</th>
                    <th>Event</th>
                    <th>Type</th>
                    <th>Grade</th>
                    <th>Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <code
                          style={{
                            fontSize: 12,
                            background: "#f1f5f9",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {app.registrationNumber}
                        </code>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {app.event?.title}
                        </div>
                        {app.event?.eventDate && (
                          <div
                            style={{ fontSize: 12, color: "var(--text-muted)" }}
                          >
                            {format(
                              new Date(app.event.eventDate),
                              "dd MMM yyyy",
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${app.event?.type}`}>
                          {app.event?.type}
                        </span>
                      </td>
                      <td>Grade {app.grade}</td>
                      <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {format(new Date(app.createdAt), "dd MMM yyyy")}
                      </td>
                      <td>
                        <span className={`badge badge-${app.status}`}>
                          {app.status}
                        </span>
                        {app.adminNote && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              marginTop: 4,
                            }}
                          >
                            {app.adminNote}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
