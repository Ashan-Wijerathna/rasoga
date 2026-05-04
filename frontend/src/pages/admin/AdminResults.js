import { useState, useEffect, useMemo } from 'react';
import { resultsAPI, eventsAPI, applicationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

function EntriesTable({ entries, onChange }) {
  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
        No approved applications found for this event.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Pos', 'Reg #', 'Student / Group Name', 'School', 'Grade', 'Marks', 'Remarks'].map((h) => (
              <th key={h} style={{
                padding: '9px 10px', background: 'var(--primary)', color: '#fff',
                textAlign: 'left', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
              <td style={{ padding: '5px 6px' }}>
                <input
                  className="form-control"
                  style={{ width: 56, textAlign: 'center' }}
                  type="number"
                  min="1"
                  value={entry.position}
                  placeholder="#"
                  onChange={(e) => onChange(i, 'position', e.target.value)}
                />
              </td>

              <td style={{ padding: '5px 6px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {entry.registrationNumber || '—'}
              </td>

              <td style={{ padding: '5px 6px', fontWeight: 600, minWidth: 160 }}>
                {entry.studentName}
                {entry.applicationType === 'group' && (
                  <span style={{ marginLeft: 6, fontSize: 10, background: '#dbeafe', color: '#1e40af', borderRadius: 4, padding: '1px 5px', fontWeight: 500 }}>
                    GROUP
                  </span>
                )}
              </td>

              <td style={{ padding: '5px 6px', color: 'var(--text-muted)', fontSize: 12, minWidth: 120 }}>
                {entry.schoolName || '—'}
              </td>

              <td style={{ padding: '5px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {entry.grade ? `Grade ${entry.grade}` : '—'}
              </td>

              <td style={{ padding: '5px 6px' }}>
                <input
                  className="form-control"
                  style={{ width: 80, fontWeight: 700, textAlign: 'center' }}
                  type="number"
                  min="0"
                  value={entry.score}
                  placeholder="0"
                  onChange={(e) => onChange(i, 'score', e.target.value)}
                />
              </td>

              <td style={{ padding: '5px 6px' }}>
                <input
                  className="form-control"
                  style={{ minWidth: 120 }}
                  value={entry.remarks}
                  placeholder="Optional"
                  onChange={(e) => onChange(i, 'remarks', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildEntries(approvedApps, savedEntries) {
  const savedMap = {};
  (savedEntries || []).forEach((e) => {
    if (e.studentName) savedMap[e.studentName] = e;
  });

  return approvedApps.map((a, i) => {
    const studentName = a.applicationType === 'group' ? (a.groupName || a.fullName) : a.fullName;
    const saved = savedMap[studentName];
    return {
      registrationNumber: a.registrationNumber || '',
      studentName,
      schoolName: a.schoolName || '',
      grade: a.grade && a.grade !== 'N/A' ? a.grade : '',
      applicationType: a.applicationType || 'individual',
      position: saved?.position ?? (i + 1),
      score: saved?.score ?? '',
      remarks: saved?.remarks ?? '',
    };
  });
}

export default function AdminResults() {
  const { can, isMasterAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');

  const [appsLoading, setAppsLoading] = useState(false);
  const [editEntries, setEditEntries] = useState([]);

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    Promise.all([eventsAPI.getAll(), resultsAPI.getAll()])
      .then(([e, r]) => { setEvents(e.data.events || []); setResults(r.data.results || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedEvent = useMemo(
    () => events.find((e) => String(e.id) === String(selectedEventId)),
    [events, selectedEventId],
  );
  const eventResult = useMemo(
    () => results.find((r) => String(r.eventId) === String(selectedEventId)),
    [results, selectedEventId],
  );

  useEffect(() => {
    if (!selectedEventId) {
      setEditEntries([]);
      setConfirmDelete(false);
      return;
    }
    setConfirmDelete(false);
    setAppsLoading(true);

    const existing = results.find((r) => String(r.eventId) === String(selectedEventId));

    applicationsAPI.getAll({ eventId: selectedEventId, status: 'approved' })
      .then((r) => {
        const approved = (r.data.applications || []).filter((a) => a.status === 'approved');
        setEditEntries(buildEntries(approved, existing?.entries));
      })
      .catch(() => setEditEntries([]))
      .finally(() => setAppsLoading(false));
  }, [selectedEventId]);

  const reloadResults = async () => {
    try { const r = await resultsAPI.getAll(); setResults(r.data.results || []); } catch {}
  };

  const updateEntry = (idx, field, val) =>
    setEditEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: val } : e)));

  const saveResult = async () => {
    const filled = editEntries.filter((e) => e.studentName && String(e.position) !== '');
    if (!filled.length) return toast.error('No entries to save. Make sure there are approved applications.');
    setSaving(true);
    try {
      const entries = filled.map(({ registrationNumber, applicationType, ...rest }) => rest);
      await resultsAPI.create({ eventId: selectedEventId, entries });
      toast.success('Results saved');
      await reloadResults();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const publishResult = async () => {
    if (!eventResult) return;
    setPublishing(true);
    try {
      await resultsAPI.publish(eventResult.id);
      toast.success('Results published — schools notified');
      await reloadResults();
    } catch { toast.error('Publish failed'); }
    finally { setPublishing(false); }
  };

  const deleteResult = async () => {
    if (!eventResult) return;
    setDeleting(true);
    try {
      await resultsAPI.delete(eventResult.id);
      toast.success('Result deleted');
      setConfirmDelete(false);
      setEditEntries((prev) => prev.map((e, i) => ({ ...e, position: i + 1, score: '', remarks: '' })));
      await reloadResults();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const download = async (type) => {
    if (!eventResult) return toast.error('Save results first before downloading');
    try {
      const res = type === 'pdf'
        ? await resultsAPI.downloadPDF(eventResult.id)
        : await resultsAPI.downloadExcel(eventResult.id);
      const url = URL.createObjectURL(res.data);
      const ext = type === 'pdf' ? 'pdf' : 'xlsx';
      Object.assign(document.createElement('a'), {
        href: url,
        download: `result-${(selectedEvent?.title || 'event').replace(/\s+/g, '-')}.${ext}`,
      }).click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="page">
      <div className="container">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 26 }}>Results Management</h1>
          {selectedEventId && (
            <button className="btn btn-outline" onClick={() => setSelectedEventId('')}>← All Results</button>
          )}
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <label className="form-label" style={{ fontSize: 12, marginBottom: 4, display: 'block' }}>
              Select Event to Manage Results
            </label>
            <select
              className="form-control"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{ maxWidth: 520 }}
            >
              <option value="">— All Events (overview) —</option>
              {events.map((ev) => {
                const hasResult = results.some((r) => String(r.eventId) === String(ev.id));
                return (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                    {ev.eventDate ? ` (${format(new Date(ev.eventDate), 'dd MMM yyyy')})` : ''}
                    {hasResult ? ' ✓' : ''}
                  </option>
                );
              })}
            </select>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              ✓ = result already saved for that event
            </p>
          </div>
        </div>

        {!selectedEventId && (
          loading ? <div className="loading-center"><div className="spinner" /></div> : (
            <div className="card">
              <div className="card-header"><h2 style={{ fontSize: 16 }}>All Saved Results</h2></div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Entries</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                          No results yet. Select an event above to add results.
                        </td>
                      </tr>
                    ) : results.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, fontSize: 14 }}>{r.event?.title}</td>
                        <td>
                          <span className={`badge badge-${r.event?.type}`}>{r.event?.type}</span>
                        </td>
                        <td style={{ fontSize: 13 }}>
                          {r.event?.eventDate ? format(new Date(r.event.eventDate), 'dd MMM yyyy') : '—'}
                        </td>
                        <td>{r.entries?.length || 0} participants</td>
                        <td>
                          <span className={`badge ${r.isPublished ? 'badge-approved' : 'badge-pending'}`}>
                            {r.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline"
                            style={{ fontSize: 11, padding: '3px 8px' }}
                            onClick={() => setSelectedEventId(String(r.eventId))}
                          >
                            ✏️ Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {selectedEventId && selectedEvent && (
          <>
            <div style={{
              background: 'var(--primary)', borderRadius: 10, padding: '14px 20px',
              marginBottom: 16, color: '#fff',
            }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{selectedEvent.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {selectedEvent.eventDate
                  ? format(new Date(selectedEvent.eventDate), 'dd MMM yyyy')
                  : 'Date TBD'}
                {selectedEvent.venue && ` · ${selectedEvent.venue}`}
                {eventResult && (
                  <span style={{
                    background: eventResult.isPublished ? '#16a34a' : '#92400e',
                    borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600,
                  }}>
                    {eventResult.isPublished ? '● Published' : '● Draft'}
                  </span>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: 15, margin: 0 }}>
                    Result Entries
                    {appsLoading ? (
                      <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>loading…</span>
                    ) : (
                      <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: 'var(--text-muted)' }}>
                        {editEntries.length} approved applicant{editEntries.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {eventResult ? (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        last saved {format(new Date(eventResult.updatedAt), 'dd MMM yyyy HH:mm')}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#b45309', fontWeight: 500 }}>not saved yet</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-body">
                {appsLoading ? (
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    <div className="spinner" style={{ display: 'inline-block' }} />
                  </div>
                ) : (
                  <>
                    {editEntries.length > 0 && (
                      <div style={{
                        background: '#eff6ff', border: '1px solid #bfdbfe',
                        borderRadius: 8, padding: '9px 14px', marginBottom: 14,
                        fontSize: 12, color: '#1e40af',
                      }}>
                        Student details are auto-filled from approved applications. Enter <strong>position</strong> and <strong>marks</strong> for each participant.
                      </div>
                    )}

                    <EntriesTable entries={editEntries} onChange={updateEntry} />

                    <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                      {(isMasterAdmin || (eventResult ? can('results', 'edit') : can('results', 'create'))) && (
                        <button
                          className="btn btn-primary"
                          onClick={saveResult}
                          disabled={saving || editEntries.length === 0}
                        >
                          {saving ? 'Saving...' : eventResult ? '💾 Update Results' : '💾 Save Results'}
                        </button>
                      )}

                      {eventResult && !eventResult.isPublished && (isMasterAdmin || can('results', 'edit')) && (
                        <button className="btn btn-success" onClick={publishResult} disabled={publishing}>
                          {publishing ? 'Publishing...' : '📢 Publish'}
                        </button>
                      )}

                      {eventResult && (
                        <>
                          <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => download('pdf')}>
                            📄 Download PDF
                          </button>
                          <button className="btn btn-outline" style={{ fontSize: 13 }} onClick={() => download('excel')}>
                            📊 Download Excel
                          </button>
                        </>
                      )}

                      <div style={{ flex: 1 }} />

                      {eventResult && (isMasterAdmin || can('results', 'delete')) && (
                        confirmDelete ? (
                          <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600 }}>
                              Delete this result?
                            </span>
                            <button className="btn btn-sm btn-danger" onClick={deleteResult} disabled={deleting}>
                              {deleting ? '...' : 'Yes, delete'}
                            </button>
                            <button className="btn btn-sm btn-outline" onClick={() => setConfirmDelete(false)}>
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm"
                            style={{ color: 'var(--danger)', border: '1px solid var(--danger)', background: 'none', fontSize: 12 }}
                            onClick={() => setConfirmDelete(true)}
                          >
                            🗑 Delete Result
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {selectedEventId && !selectedEvent && !loading && (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Event not found.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
