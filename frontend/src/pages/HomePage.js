import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI, slidesAPI } from "../services/api";
import { format } from "date-fns";
import HeroSlider from "../components/common/HeroSlider";

export default function HomePage() {
  const [announcements, setAnnouncements] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);

  useEffect(() => {
    dashboardAPI
      .getAnnouncements()
      .then((r) => setAnnouncements(r.data.announcements || []))
      .catch(() => setAnnouncements([]));

    slidesAPI
      .getPublic()
      .then((r) => setHeroSlides(r.data.slides || []))
      .catch(() => setHeroSlides([]));
  }, []);

  return (
    <div>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
        }}
      >
        {/* <HeroSlider slides={heroSlides} /> */}
        <HeroSlider slides={heroSlides || []} />

        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            minHeight: "100vh",
            padding: "0 20px",
          }}
        >
          <h3
            style={{
              color: "#dfd3ae",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: "700",
              fontFamily: "'Noto Sans Sinhala', sans-serif",
              marginBottom: "20px",
              lineHeight: "1.3",
              letterSpacing: "1px",
              textShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          >
            "පුරන් වූ සාහිත්‍ය කෙත ප්‍රඥාවෙන් අස්වද්දන."
            <br />
            <br/>
            <h1>රසෝඝා 2026</h1>
          </h3>

          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "16px",
              maxWidth: "600px",
              marginBottom: "30px",
              lineHeight: "1.6",
            }}
          >
          </p>

          <div
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/events" className="btn btn-accent btn-lg">
              Browse All Events
            </Link>
          </div>
        </div>
      </div>

      <div className="container page">
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>
          Announcements
        </h2>

        {announcements.length === 0 ? (
          <div
            className="card card-body"
            style={{
              color: "#64748b",
              textAlign: "center",
              padding: 40,
            }}
          >
            No announcements at this time.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="card"
                style={{
                  borderLeft: "4px solid #c8a951",
                }}
              >
                <div
                  className="card-body"
                  style={{ padding: "14px 18px" }}
                >
                  <strong style={{ fontSize: 14 }}>
                    {ann.title}
                  </strong>

                  <p
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    {ann.content}
                  </p>

                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                    }}
                  >
                    {format(
                      new Date(ann.createdAt),
                      "dd MMM yyyy"
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
