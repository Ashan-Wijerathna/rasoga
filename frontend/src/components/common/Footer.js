import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/Languagecontext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        background: "#0f2338",
        color: "rgba(255,255,255,0.7)",
        marginTop: "auto",
        flexShrink: 0,
      }}
    >
      <div className="container" style={{ padding: "40px 24px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 32,
            marginBottom: 32,
          }}
        >
          <div>
            <h3
              style={{
                color: "#c8a951",
                fontFamily: "Noto Serif, serif",
                marginBottom: 12,
                fontSize: 18,
              }}
            >
              Dhaham EMS
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>{t("footerDesc")}</p>
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: 12, fontSize: 14 }}>
              {t("quickLinks")}
            </h4>
            {[
              ["/", t("home")],
              ["/events", t("events")],
              ["/results", t("results")],
              ["/login", t("adminLogin")],
            ].map(([to, label]) => (
              <div key={to} style={{ marginBottom: 6 }}>
                <Link
                  to={to}
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  {label}
                </Link>
              </div>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#fff", marginBottom: 12, fontSize: 14 }}>
              {t("contact")}
            </h4>
            <p style={{ fontSize: 13, lineHeight: 1.8 }}>
              {t("ministry")}
              <br />
              dhaham@education.gov.lk
            </p>
          </div>
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 20,
            textAlign: "center",
            fontSize: 12,
          }}
        >
          © {new Date().getFullYear()} Dhaham School Event Management System —
          Sri Lanka
        </div>
      </div>
    </footer>
  );
}
