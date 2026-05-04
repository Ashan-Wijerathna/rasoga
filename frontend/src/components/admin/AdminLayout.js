import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ALL_NAV_ITEMS = [
  { to: "/admin",              label: "Dashboard",   module: null,           exact: true },
  { to: "/admin/applications", label: "Applications", module: "applications"              },
  { to: "/admin/events",       label: "Events",       module: "events"                    },
  { to: "/admin/results",      label: "Results",      module: "results"                   },
  { to: "/admin/schools",      label: "Schools",      module: "schools"                   },
  { to: "/admin/users",        label: "Users",        module: "users"                     },
  { to: "/admin/slides",       label: "Hero Slides",  module: "slides"                    },
  { to: "/admin/reports",      label: "Reports",      module: "reports"                   },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const { user, logout, can, isMasterAdmin, isSchool } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = ALL_NAV_ITEMS.filter((item) => {
    if (!item.module) return true;
    if (isSchool) return item.module === "applications";
    if (isMasterAdmin) return true;
    return can(item.module, "view");
  });

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const W = collapsed ? 64 : 240;
  const currentLabel = navItems.find((i) => isActive(i))?.label || "Admin";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9" }}>
      {/* ── SIDEBAR ── */}
      <aside
        style={{
          width: W,
          minHeight: "100vh",
          background: "#0a1628",
          borderRight: "1px solid rgba(200,169,81,0.2)",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 150,
          display: "flex",
          flexDirection: "column",
          transition: "width 0.25s ease",
          overflowX: "hidden",
        }}
      >
        {/* Gold accent */}
        <div style={{ height: 3, background: "#c8a951", flexShrink: 0 }} />

        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "16px 0" : "20px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <div>
              <div
                style={{
                  fontFamily: "Noto Serif, serif",
                  fontWeight: 700,
                  fontSize: 20,
                  color: "#c8a951",
                }}
              >
                රසෝඝා
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 2,
                }}
              >
                ADMIN PANEL
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: collapsed ? "11px 0" : "11px 16px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  textDecoration: "none",
                  color: active ? "#c8a951" : "rgba(255,255,255,0.7)",
                  background: active ? "rgba(200,169,81,0.12)" : "transparent",
                  borderLeft: active
                    ? "3px solid #c8a951"
                    : "3px solid transparent",
                  fontWeight: active ? 600 : 400,
                  fontSize: 15,
                  transition: "background 0.15s, color 0.15s",
                  marginBottom: 2,
                  borderRadius: collapsed ? 0 : "0 8px 8px 0",
                  marginRight: collapsed ? 0 : 8,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div
          style={{
            padding: collapsed ? "12px 0" : "14px 16px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          {!collapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "#c8a951",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#0a1628",
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {user?.role?.toUpperCase()}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: collapsed ? "8px 0" : "8px 12px",
              background: "rgba(220,38,38,0.15)",
              border: "1px solid rgba(220,38,38,0.3)",
              color: "#fca5a5",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span></span>
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main
        style={{
          marginLeft: W,
          flex: 1,
          minHeight: "100vh",
          transition: "margin-left 0.25s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>
            {currentLabel}
          </div>
          {/* <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
              background: "#f8fafc",
              padding: "4px 12px",
              borderRadius: 20,
              border: "1px solid #e2e8f0",
            }}
          >
            🌐 rasogha.com
          </div> */}
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: "24px" }}>{children}</div>
      </main>
    </div>
  );
}
