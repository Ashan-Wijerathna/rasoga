import { useState, useEffect, useMemo } from "react";
import { resultsAPI, schoolsAPI } from "../services/api";
import { format } from "date-fns";

const MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" };
const MEDAL_BG = { 1: "#fef9c3", 2: "#f1f5f9", 3: "#fef3c7" };

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const [filterEvent, setFilterEvent] = useState("");
  const [filterSchool, setFilterSchool] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  useEffect(() => {
    Promise.all([resultsAPI.getPublic(), schoolsAPI.getAll()])
      .then(([r, s]) => {
        setResults(r.data.results || []);
        setSchools(s.data.schools || []);
      })
      .catch(() => {
        setResults([]);
        setSchools([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredResults = useMemo(() => {
    return results
      .filter(
        (result) =>
          !filterEvent || String(result.eventId) === String(filterEvent),
      )
      .map((result) => {
        let entries = result.entries || [];
        if (filterSchool) {
          entries = entries.filter(
            (e) =>
              e.schoolName &&
              e.schoolName.toLowerCase().includes(filterSchool.toLowerCase()),
          );
        }
        if (filterSearch) {
          entries = entries.filter(
            (e) =>
              e.studentName &&
              e.studentName.toLowerCase().includes(filterSearch.toLowerCase()),
          );
        }
        return { ...result, entries };
      })
      .filter((result) => {
        if (filterSchool || filterSearch) return result.entries.length > 0;
        return true;
      });
  }, [results, filterEvent, filterSchool, filterSearch]);

  const totalEntries = filteredResults.reduce(
    (sum, r) => sum + (r.entries?.length || 0),
    0,
  );

  const clearFilters = () => {
    setFilterEvent("");
    setFilterSchool("");
    setFilterSearch("");
  };

  const hasFilters = filterEvent || filterSchool || filterSearch;

  if (loading)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );

  const eventOptions = results.map((r) => ({
    id: r.eventId,
    title: r.event?.title,
  }));

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Event Results</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Official results for all Dhaham School events.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: 12,
                alignItems: "flex-end",
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: 12 }}>
                  Filter by Event
                </label>
                <select
                  className="form-control"
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                >
                  <option value="">— All Events —</option>
                  {eventOptions.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 12 }}>
                  Filter by School
                </label>
                <select
                  className="form-control"
                  value={filterSchool}
                  onChange={(e) => setFilterSchool(e.target.value)}
                >
                  <option value="">— All Schools —</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: 12 }}>
                  Search Student
                </label>
                <input
                  className="form-control"
                  placeholder="Student name..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                />
              </div>

              {hasFilters && (
                <button
                  className="btn btn-outline"
                  onClick={clearFilters}
                  style={{ whiteSpace: "nowrap" }}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                color: "var(--text-muted)",
              }}
            >
              Showing <strong>{filteredResults.length}</strong> event
              {filteredResults.length !== 1 ? "s" : ""} with{" "}
              <strong>{totalEntries}</strong> result
              {totalEntries !== 1 ? "s" : ""}
              {hasFilters && (
                <span style={{ color: "var(--warning)", marginLeft: 8 }}>
                  — filters active
                </span>
              )}
            </div>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div
            className="card card-body"
            style={{ textAlign: "center", padding: 60 }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <p style={{ color: "var(--text-muted)" }}>
              {hasFilters
                ? "No results match your filters. Try clearing them."
                : "No results published yet. Check back after events complete."}
            </p>
            {hasFilters && (
              <button
                className="btn btn-outline"
                onClick={clearFilters}
                style={{ marginTop: 12 }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {filteredResults.map((result) => (
              <div key={result.id} className="card">
                <div
                  className="card-header"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setExpanded(expanded === result.id ? null : result.id)
                  }
                >
                  <div>
                    <h2 style={{ fontSize: 18, marginBottom: 4 }}>
                      {result.event?.title}
                    </h2>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <span className={`badge badge-${result.event?.type}`}>
                        {result.event?.type}
                      </span>
                      {result.event?.eventDate && (
                        <span
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          {format(
                            new Date(result.event.eventDate),
                            "dd MMM yyyy",
                          )}
                        </span>
                      )}
                      <span
                        style={{ fontSize: 12, color: "var(--text-muted)" }}
                      >
                        {result.entries?.length}{" "}
                        {filterSchool || filterSearch ? "matching" : ""}{" "}
                        participant{result.entries?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <span style={{ fontSize: 18, color: "var(--text-muted)" }}>
                      {expanded === result.id ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {expanded === result.id && (
                  <div className="card-body">
                    {!filterSchool && !filterSearch && (
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          marginBottom: 24,
                          flexWrap: "wrap",
                        }}
                      >
                        {result.entries
                          ?.filter((e) => e.position <= 3)
                          .sort((a, b) => a.position - b.position)
                          .map((entry) => (
                            <div
                              key={entry.position}
                              style={{
                                flex: 1,
                                minWidth: 180,
                                background: MEDAL_BG[entry.position],
                                borderRadius: "var(--radius-lg)",
                                padding: "20px 16px",
                                textAlign: "center",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <div style={{ fontSize: 36, marginBottom: 6 }}>
                                {MEDALS[entry.position]}
                              </div>
                              {entry.artworkImage?.url && (
                                <img
                                  src={entry.artworkImage.url}
                                  alt={entry.studentName}
                                  style={{
                                    width: 70,
                                    height: 70,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    marginBottom: 8,
                                    border: "2px solid var(--border)",
                                  }}
                                />
                              )}
                              <div style={{ fontWeight: 700, fontSize: 15 }}>
                                {entry.studentName}
                              </div>
                              <div
                                style={{
                                  fontSize: 13,
                                  color: "var(--text-muted)",
                                  marginTop: 2,
                                }}
                              >
                                {entry.schoolName}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--text-muted)",
                                }}
                              >
                                Grade {entry.grade}
                              </div>
                              {entry.score !== undefined && (
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: "var(--primary)",
                                    marginTop: 6,
                                  }}
                                >
                                  {entry.score} pts
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}


                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
