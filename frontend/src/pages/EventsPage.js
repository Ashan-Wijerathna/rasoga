import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventsAPI } from "../services/api";
import { format, isPast } from "date-fns";
import ApplicationModal from "../components/common/ApplicationModal";
import ApplicationSuccess from "../components/common/ApplicationSuccess";

const isResozaEvent = (ev) =>
  ev.title?.toLowerCase().includes("resoza") || ev.category === "literary";

const TYPE_COLORS = {
  school: "#1a3a5c",
  zonal: "#7c3aed",
  provincial: "#be123c",
};
const GRADES = ["6", "7", "8", "9", "10", "11"];
const TYPES = ["school", "zonal", "provincial"];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", grade: "", search: "" });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [successApp, setSuccessApp] = useState(null);

  useEffect(() => {
    setLoading(true);
    eventsAPI
      .getAll({ isActive: true, ...filters })
      .then((r) => setEvents(r.data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val }));
  const handleApply = (ev) => setSelectedEvent(ev);
  const handleSuccess = (app) => {
    setSelectedEvent(null);
    setSuccessApp(app);
  };

  return (
    <div className="page">
      {selectedEvent && (
        <ApplicationModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSuccess={handleSuccess}
        />
      )}
      {successApp && (
        <ApplicationSuccess
          application={successApp}
          onClose={() => setSuccessApp(null)}
        />
      )}

      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Events</h1>
          <p style={{ color: "#64748b" }}>
            Browse and apply for events. Click <strong>Apply Now</strong>
          </p>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div
            className="card-body"
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) => handleFilter("search", e.target.value)}
              />
            </div>
            <div style={{ minWidth: 150 }}>
              <label className="form-label">Event Type</label>
              <select
                className="form-control"
                value={filters.type}
                onChange={(e) => handleFilter("type", e.target.value)}
              >
                <option value="">All Types</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: 130 }}>
              <label className="form-label">Grade</label>
              <select
                className="form-control"
                value={filters.grade}
                onChange={(e) => handleFilter("grade", e.target.value)}
              >
                <option value="">All Grades</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setFilters({ type: "", grade: "", search: "" })}
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : events.length === 0 ? (
          <div
            className="card card-body"
            style={{ textAlign: "center", padding: 60, color: "#64748b" }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div>No events found.</div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {events.map((ev) => {
              const deadlinePassed = isPast(new Date(ev.applicationDeadline));
              return (
                <div
                  key={ev.id || ev._id}
                  className="card"
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      height: 5,
                      background: TYPE_COLORS[ev.type] || "#1a3a5c",
                    }}
                  />
                  <div className="card-body" style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <span className={"badge badge-" + ev.type}>
                        {ev.type}
                      </span>
                      <span className="badge badge-school">{ev.category}</span>
                    </div>
                    <h3
                      style={{
                        fontSize: 16,
                        marginBottom: 10,
                        fontWeight: 600,
                      }}
                    >
                      {ev.title}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        fontSize: 13,
                        color: "#64748b",
                        marginBottom: 14,
                      }}
                    >
                      <span>
                        📅{" "}
                        {format(new Date(ev.eventDate), "EEEE, dd MMMM yyyy")}
                      </span>
                      <span>📍 {ev.venue}</span>
                      <span>🎓 Grades: {ev.grades?.join(", ")}</span>
                      <span
                        style={{
                          color: deadlinePassed ? "#dc2626" : "#d97706",
                          fontWeight: 500,
                        }}
                      >
                        ⏰ Deadline:{" "}
                        {format(
                          new Date(ev.applicationDeadline),
                          "dd MMM yyyy",
                        )}{" "}
                        {deadlinePassed ? "(Closed)" : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link
                        to={"/events/" + (ev.id || ev._id)}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        View Details
                      </Link>
                      {!deadlinePassed && (
                        isResozaEvent(ev) ? (
                          <Link
                            to={"/apply/resoza-2026/" + (ev.id || ev._id)}
                            className="btn btn-sm"
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              background: "linear-gradient(135deg, #c8a951, #f0d078)",
                              color: "#1a3a5c",
                              fontWeight: 700,
                              border: "none",
                            }}
                          >
                            📜 Apply (Special Form)
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleApply(ev)}
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, justifyContent: "center" }}
                          >
                            Apply Now
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
