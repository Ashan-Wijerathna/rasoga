import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const menu = [
    ["Dashboard", "/admin"],
    ["Applications", "/admin/applications"],
    ["Events", "/admin/events"],
    ["Results", "/admin/results"],
    ["Schools", "/admin/schools"],
    ["Users", "/admin/users"],
    ["Reports", "/admin/reports"],
  ];

  return (
    <div style={{ display: "flex" }}>
      
      {/* Sidebar */}
      <div
        style={{
          width: open ? 220 : 70,
          background: "linear-gradient(180deg, #1e293b, #0f172a)",
          color: "#fff",
          height: "100vh",
          transition: "0.3s",
          padding: 12,
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          style={{
            marginBottom: 20,
            background: "transparent",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ☰
        </button>

        {menu.map(([label, path]) => {
          const active = location.pathname === path;
          return (
            <Link
              key={label}
              to={path}
              style={{
                display: "block",
                padding: "10px",
                borderRadius: 8,
                marginBottom: 6,
                textDecoration: "none",
                color: active ? "#fff" : "#cbd5f5",
                background: active ? "#4f46e5" : "transparent",
                transition: "0.2s",
              }}
            >
              {open ? label : label[0]}
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20 }}>
        
        {/* Topbar */}
        <div
          style={{
            background: "#fff",
            padding: 12,
            borderRadius: 12,
            marginBottom: 20,
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          }}
        >
          <b>Admin Panel</b>
        </div>

        {children}
      </div>
    </div>
  );
}