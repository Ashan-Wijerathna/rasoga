import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { eventsAPI } from "../services/api";
import { format, isPast } from "date-fns";
export default function EventDetailPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsAPI
      .getOne(id)
      .then((r) => setEvent(r.data.event))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  if (!event)
    return (
      <div className="container page">
        <div className="alert alert-danger">Event not found.</div>
      </div>
    );

  const deadlinePassed = isPast(new Date(event.applicationDeadline));
  const TYPE_COLOR =
    { school: "#1a3a5c", zonal: "#7c3aed", provincial: "#be123c" }[
      event.type
    ] || "var(--primary)";

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 20 }}>
          <Link
            to="/events"
            style={{ color: "var(--text-muted)", fontSize: 14 }}
          >
            ← Back to Events
          </Link>
        </div>

        <div className="card">
          <div style={{ height: 8, background: TYPE_COLOR }} />
          <div className="card-body">
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 16,
                flexWrap: "wrap",
              }}
            >
              <span className={`badge badge-${event.type}`}>{event.type}</span>
              <span className="badge badge-school">{event.category}</span>
              {event.isActive ? (
                <span className="badge badge-approved">Open</span>
              ) : (
                <span className="badge badge-rejected">Closed</span>
              )}
            </div>

            <h1 style={{ fontSize: 26, marginBottom: 20 }}>{event.title}</h1>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {[
                [
                  "📅 Event Date",
                  format(new Date(event.eventDate), "EEEE, dd MMMM yyyy"),
                ],
                ["📍 Venue", event.venue],
                [
                  "🎓 Eligible Grades",
                  event.grades?.map((g) => `Grade ${g}`).join(", "),
                ],
                [
                  "⏰ Application Deadline",
                  format(new Date(event.applicationDeadline), "dd MMMM yyyy"),
                ],
                [
                  "🏆 Event Type",
                  event.type.charAt(0).toUpperCase() + event.type.slice(1),
                ],
                ["📝 Category", event.category],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    padding: 14,
                    background: "var(--bg)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginBottom: 4,
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{val}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Description</h3>
              <p
                style={{
                  color: "var(--text-muted)",
                  lineHeight: 1.8,
                  fontSize: 14,
                }}
              >
                {event.description}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
