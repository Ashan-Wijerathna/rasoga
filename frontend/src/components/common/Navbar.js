import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/Languagecontext";



function PublicNavbar({ user, onLogout }) {
  const { t } = useLanguage();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const navLink = (to, label) => (
    <Link
      key={to}
      to={to}
      style={{
        color: isActive(to) ? "#c8a951" : "rgba(255,255,255,0.85)",
        padding: "6px 14px",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        textDecoration: "none",
        background: isActive(to) ? "rgba(255,255,255,0.08)" : "transparent",
        transition: "all 0.15s",
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav
      style={{
        background: "var(--primary)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
          gap: 12,
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          
          <div>
            <div
              style={{
                fontFamily: "Noto Serif, serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#c8a951",
                lineHeight: 1.2,
              }}
            >
              රසෝඝා
            </div>
          </div>
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {navLink("/", t("home"))}
          {navLink("/events", t("events"))}
          {navLink("/results", t("results"))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          
          {user ? (
            <>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
                {user.name}
              </span>
              <button
                onClick={onLogout}
                className="btn btn-sm"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-sm btn-accent">
              {t("adminLogin")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  if (user?.role === "admin" && isAdminRoute) {
    return null;
  }

  return <PublicNavbar user={user} onLogout={handleLogout} />;
}
