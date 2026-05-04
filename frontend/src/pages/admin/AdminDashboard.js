import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { dashboardAPI, eventsAPI, applicationsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { isAdmin, isSchool } = useAuth();
  if (isAdmin) return <AdminDashboardView />;
  if (isSchool) return <SchoolDashboardView />;
  return <Navigate to="/unauthorized" replace />;
}

function AdminDashboardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI
      .getAdminStats()
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );

  const stats = [
    { label: "Students", val: data?.stats?.totalStudents, color: "#4f46e5" },
    { label: "Schools", val: data?.stats?.totalSchools, color: "#0ea5e9" },
    { label: "Events", val: data?.stats?.totalEvents, color: "#8b5cf6" },
    {
      label: "Pending",
      val: data?.stats?.pendingApplications,
      color: "#f59e0b",
    },
    {
      label: "Approved",
      val: data?.stats?.approvedApplications,
      color: "#10b981",
    },
    {
      label: "Rejected",
      val: data?.stats?.rejectedApplications,
      color: "#ef4444",
    },
  ];

  return (
    <div className="page">
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
        }}
      >
        {stats.map(({ label, val, color }) => (
          <div
            key={label}
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              color: "#fff",
              padding: 20,
              borderRadius: 16,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div style={{ fontSize: 26, fontWeight: "bold" }}>{val ?? 0}</div>
            <div style={{ fontSize: 13 }}>{label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 24,
        }}
      >
        <div style={card}>
          <div style={cardHeader}>
            <h3>Pending Applications</h3>
            <Link to="/admin/applications">View</Link>
          </div>
          {(data?.recentApplications || []).length === 0 ? (
            <div style={empty}>All clear!</div>
          ) : (
            data.recentApplications.slice(0, 5).map((app) => (
              <div key={app.id} style={item}>
                <b>{app.fullName || app.groupName}</b>
                <div style={muted}>
                  {app.event?.title} · {app.school?.name}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={card}>
          <div style={cardHeader}>
            <h3>Upcoming Events</h3>
            <Link to="/admin/events">Manage</Link>
          </div>
          {(data?.upcomingEvents || []).length === 0 ? (
            <div style={empty}>No events</div>
          ) : (
            data.upcomingEvents.map((ev) => (
              <div key={ev.id} style={item}>
                <b>{ev.title}</b>
                <div style={muted}>
                  {format(new Date(ev.eventDate), "dd MMM yyyy")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SchoolDashboardView() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, appsRes] = await Promise.all([
          eventsAPI.getAll({ isActive: true }),
          applicationsAPI.getAll({ schoolId: user.schoolId }),
        ]);
        setEvents(eventsRes.data.events || []);
        setApplications(appsRes.data.applications || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [user.schoolId]);

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );

  const pending = applications.filter((a) => a.status === "pending").length;
  const approved = applications.filter((a) => a.status === "approved").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  const statCards = [
    { label: "Total Applications", val: applications.length, color: "#4f46e5" },
    { label: "Pending", val: pending, color: "#f59e0b" },
    { label: "Approved", val: approved, color: "#10b981" },
    { label: "Rejected", val: rejected, color: "#ef4444" },
  ];

  return (
    <div className="page">
      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Welcome, {user.name}</h2>
      <p style={{ color: "#64748b", marginBottom: 20 }}>{user.school?.name}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {statCards.map(({ label, val, color }) => (
          <div
            key={label}
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}cc)`,
              color: "#fff",
              padding: 20,
              borderRadius: 16,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ fontSize: 26, fontWeight: "bold" }}>{val}</div>
            <div style={{ fontSize: 13 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={card}>
          <div style={cardHeader}>
            <h3>Available Events</h3>
            <Link to="/admin/applications">Apply</Link>
          </div>
          {events.length === 0 ? (
            <div style={empty}>No active events</div>
          ) : (
            events.slice(0, 5).map((ev) => (
              <div key={ev.id} style={item}>
                <b>{ev.title}</b>
                <div style={muted}>
                  Deadline:{" "}
                  {format(new Date(ev.applicationDeadline), "dd MMM yyyy")}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={card}>
          <div style={cardHeader}>
            <h3>My Applications</h3>
            <Link to="/admin/applications">View All</Link>
          </div>
          {applications.length === 0 ? (
            <div style={empty}>No applications yet</div>
          ) : (
            applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                style={{
                  ...item,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <b style={{ fontSize: 13 }}>
                    {app.fullName || app.groupName}
                  </b>
                  <div style={muted}>{app.event?.title}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 12,
                    background:
                      app.status === "approved"
                        ? "#d1fae5"
                        : app.status === "rejected"
                          ? "#fee2e2"
                          : "#fef3c7",
                    color:
                      app.status === "approved"
                        ? "#065f46"
                        : app.status === "rejected"
                          ? "#991b1b"
                          : "#92400e",
                  }}
                >
                  {app.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "#fff",
  padding: 16,
  borderRadius: 16,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};
const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10,
};
const item = { padding: "10px 0", borderBottom: "1px solid #eee" };
const muted = { fontSize: 12, color: "#777" };
const empty = { textAlign: "center", color: "#aaa", padding: 20 };
