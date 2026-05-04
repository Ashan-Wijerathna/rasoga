import React from "react";
import { useNavigate } from "react-router-dom";

export default function ApplicationSuccess({ application, onClose }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1001,
        background: "rgba(15,35,56,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 500,
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            background: "#d1fae5",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 36,
          }}
        >
          ✅
        </div>

        <h1 style={{ fontSize: 26, marginBottom: 8, color: "#065f46" }}>
          Application Submitted!
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            marginBottom: 28,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          Your application has been received successfully. You will be notified
          via email and SMS.
        </p>

        <div
          style={{
            background: "var(--primary)",
            borderRadius: 14,
            padding: "24px",
            marginBottom: 20,
            color: "#fff",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Registration Number
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 3,
              color: "#c8a951",
            }}
          >
            {application.registrationNumber}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              marginTop: 8,
            }}
          >
            Save this number — needed on event day
          </div>
        </div>

        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: 10,
            padding: "14px 18px",
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#166534",
              marginBottom: 8,
            }}
          >
            Notifications Sent:
          </div>
          <div style={{ fontSize: 13, color: "#15803d", marginBottom: 4 }}>
            📧 Email → {application.email}
          </div>
          <div style={{ fontSize: 13, color: "#15803d" }}>
            📱 SMS → {application.phoneNumber}
          </div>
        </div>

        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 28,
            fontSize: 13,
            color: "#92400e",
          }}
        >
          <strong>Status: Pending Admin Review</strong>
          <br />
          <span style={{ fontSize: 12 }}>
            You will receive a decision notification once the admin reviews your
            application.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => {
              onClose();
              navigate("/events");
            }}
            className="btn btn-primary"
          >
            Browse More Events
          </button>
          <button onClick={onClose} className="btn btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
