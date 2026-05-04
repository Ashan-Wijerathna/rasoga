import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f1f5f9",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "48px 40px",
        textAlign: "center",
        maxWidth: 440,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        border: "1px solid #e2e8f0",
      }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          You do not have permission to access this page.
          {user && <span> Your role is <strong>{user.role}</strong>.</span>}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 20px",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              color: "#475569",
            }}
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
              background: "#1a3a5c",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              color: "#fff",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
