import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

export default function DashboardPage() {
  const { user, isAdmin, isSchool, isStudent } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDash = isAdmin
      ? dashboardAPI.getAdminStats
      : isSchool
        ? dashboardAPI.getSchoolDashboard
        : dashboardAPI.getStudentDashboard;
    fetchDash()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin, isSchool]);

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
          <h1 style={{ fontSize: 26, marginBottom: 4 }}>
            Welcome, {user?.name}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {isAdmin
              ? "System Administrator"
              : isSchool
                ? "School Account"
                : "Student Account"}
            {user?.school?.name ? ` — ${user.school.name}` : ""}
          </p>
        </div>

        {data?.stats && (
          <div className="stats-grid">
            {isAdmin &&
              [
                ["Students", data.stats.totalStudents],
                ["Schools", data.stats.totalSchools],
                ["Events", data.stats.totalEvents],
                ["Pending", data.stats.pendingApplications, "var(--warning)"],
                ["Approved", data.stats.approvedApplications, "var(--success)"],
                ["Rejected", data.stats.rejectedApplications, "var(--danger)"],
              ].map(([label, val, color]) => (
                <div key={label} className="stat-card">
                  {/* <div className="stat-icon">{icon}</div> */}
                  <div
                    className="stat-value"
                    style={{ color: color || "var(--primary)" }}
                  >
                    {val ?? 0}
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            {(isSchool || isStudent) &&
              [
                ["Total", data.stats.total],
                ["Pending", data.stats.pending, "var(--warning)"],
                ["Approved", data.stats.approved, "var(--success)"],
                ["Rejected", data.stats.rejected, "var(--danger)"],
              ].map(([label, val, color]) => (
                <div key={label} className="stat-card">
                  {/* <div className="stat-icon">{icon}</div> */}
                  <div
                    className="stat-value"
                    style={{ color: color || "var(--primary)" }}
                  >
                    {val ?? 0}
                  </div>
                  <div className="stat-label">Applications</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
          </div>
        )}

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}
        >
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 17 }}>📅 Upcoming Events</h2>
              <Link to="/events" className="btn btn-outline btn-sm">
                View All
              </Link>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {(data?.upcomingEvents || []).length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 14,
                  }}
                >
                  No upcoming events
                </div>
              ) : (
                (data?.upcomingEvents || []).map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: "12px 20px",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {ev.venue} ·{" "}
                        {format(new Date(ev.eventDate), "dd MMM yyyy")}
                      </div>
                    </div>
                    <span className={`badge badge-${ev.type}`}>{ev.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: 17 }}>
                {isAdmin ? "⏳ Pending Applications" : "📢 Announcements"}
              </h2>
              {isAdmin && (
                <Link
                  to="/admin/applications"
                  className="btn btn-outline btn-sm"
                >
                  View All
                </Link>
              )}
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {isAdmin ? (
                (data?.recentApplications || []).length === 0 ? (
                  <div
                    style={{
                      padding: 24,
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: 14,
                    }}
                  >
                    No pending applications
                  </div>
                ) : (
                  (data?.recentApplications || []).map((app) => (
                    <div
                      key={app.id}
                      style={{
                        padding: "12px 20px",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>
                          {app.student?.name}
                        </div>
                        <div
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          {app.event?.title} · {app.school?.name}
                        </div>
                      </div>
                      <Link
                        to="/admin/applications"
                        className="btn btn-primary btn-sm"
                      >
                        Review
                      </Link>
                    </div>
                  ))
                )
              ) : (data?.announcements || []).length === 0 ? (
                <div
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: 14,
                  }}
                >
                  No announcements
                </div>
              ) : (
                (data?.announcements || []).map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      padding: "12px 20px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {ann.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {ann.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h2 style={{ fontSize: 17 }}>Quick Actions</h2>
          </div>
          <div
            className="card-body"
            style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
          >
            {isStudent && (
              <Link to="/events" className="btn btn-primary">
                Apply for Event
              </Link>
            )}
            {isStudent && (
              <Link to="/applications" className="btn btn-outline">
                My Applications
              </Link>
            )}
            {isSchool && (
              <Link to="/applications" className="btn btn-primary">
                School Applications
              </Link>
            )}
            {isSchool && (
              <Link to="/results" className="btn btn-outline">
                Download Results
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/applications" className="btn btn-primary">
                Review Applications
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/events" className="btn btn-outline">
                Manage Events
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/results" className="btn btn-outline">
                Manage Results
              </Link>
            )}
            <Link to="/results" className="btn btn-outline">
              View Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
