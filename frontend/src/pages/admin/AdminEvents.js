import { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const GRADES = ['6', '7', '8', '9', '10', '11'];
const TYPES = ['school', 'zonal', 'provincial'];
const CATEGORIES = ['art', 'sports', 'academic', 'cultural', 'religious', 'other'];

function EventForm({ initial, onSave, onCancel }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      eventMode: 'individual',
      groupMinSize: 2,
      groupMaxSize: 5,
      ...initial,
    },
  });
  const [saving, setSaving] = useState(false);
  const eventMode = watch('eventMode');

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const grades = GRADES.filter((g) => data[`grade_${g}`]);
      const payload = { ...data, grades };
      GRADES.forEach((g) => delete payload[`grade_${g}`]);

      if (payload.eventMode === 'group') {
        payload.groupMinSize = parseInt(payload.groupMinSize, 10) || 2;
        payload.groupMaxSize = parseInt(payload.groupMaxSize, 10) || 5;
      } else {
        payload.groupMinSize = null;
        payload.groupMaxSize = null;
      }

      if (initial?.id) await eventsAPI.update(initial.id, payload);
      else await eventsAPI.create(payload);
      toast.success(initial ? 'Event updated' : 'Event created');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Event Title <span className="required">*</span></label>
          <input {...register('title', { required: 'Title required' })} className={`form-control ${errors.title ? 'error' : ''}`} placeholder="Event title" />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Event Type <span className="required">*</span></label>
          <select {...register('type', { required: 'Type required' })} className="form-control">
            <option value="">Select type</option>
            {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select {...register('category')} className="form-control">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Event Date <span className="required">*</span></label>
          <input {...register('eventDate', { required: 'Date required' })} type="date" className="form-control" />
        </div>

        <div className="form-group">
          <label className="form-label">Application Deadline <span className="required">*</span></label>
          <input {...register('applicationDeadline', { required: 'Deadline required' })} type="date" className="form-control" />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Venue <span className="required">*</span></label>
          <input {...register('venue', { required: 'Venue required' })} className="form-control" placeholder="Event venue / location" />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Application Mode <span className="required">*</span></label>
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            {[['individual', '👤 Individual', 'One student per application'], ['group', '👥 Group', 'Multiple students per application']].map(([val, label, desc]) => (
              <label
                key={val}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  border: `2px solid ${eventMode === val ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 10,
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: eventMode === val ? 'rgba(var(--primary-rgb, 15,35,56), 0.04)' : '#fff',
                  transition: 'all 0.2s',
                }}
              >
                <input {...register('eventMode')} type="radio" value={val} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {eventMode === 'group' && (
          <>
            <div className="form-group">
              <label className="form-label">Minimum Group Size <span className="required">*</span></label>
              <input
                {...register('groupMinSize', { required: 'Min size required', min: { value: 2, message: 'Min 2 members' } })}
                type="number" min={2} max={20}
                className={`form-control ${errors.groupMinSize ? 'error' : ''}`}
              />
              {errors.groupMinSize && <p className="form-error">{errors.groupMinSize.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Maximum Group Size <span className="required">*</span></label>
              <input
                {...register('groupMaxSize', { required: 'Max size required', min: { value: 2, message: 'Min 2 members' } })}
                type="number" min={2} max={50}
                className={`form-control ${errors.groupMaxSize ? 'error' : ''}`}
              />
              {errors.groupMaxSize && <p className="form-error">{errors.groupMaxSize.message}</p>}
            </div>
          </>
        )}

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Eligible Grades <span className="required">*</span></label>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            {GRADES.map((g) => (
              <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                <input {...register(`grade_${g}`)} type="checkbox" defaultChecked={initial?.grades?.includes(g)} />
                Grade {g}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Description <span className="required">*</span></label>
          <textarea {...register('description', { required: 'Description required' })} className="form-control" rows={3} placeholder="Event description..." />
        </div>

        <div className="form-group">
          <label className="form-label">Max Participants</label>
          <input {...register('maxParticipants')} type="number" className="form-control" placeholder="Leave blank for unlimited" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
          {saving ? 'Saving...' : initial ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}

export default function AdminEvents() {
  const { can, isMasterAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    eventsAPI.getAll({}).then((r) => setEvents(r.data.events || [])).catch(() => setEvents([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try { await eventsAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 26 }}>Events Management</h1>
          {(isMasterAdmin || can('events', 'create')) && (
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>+ Create Event</button>
          )}
        </div>

        {(showForm || editing) && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header"><h2 style={{ fontSize: 18 }}>{editing ? 'Edit Event' : 'New Event'}</h2></div>
            <div className="card-body">
              <EventForm
                initial={editing}
                onSave={() => { setShowForm(false); setEditing(null); load(); }}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          </div>
        )}

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Mode</th>
                    <th>Category</th>
                    <th>Event Date</th>
                    <th>Deadline</th>
                    <th>Grades</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length === 0 ? (
                    <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No events yet. Create your first event.</td></tr>
                  ) : events.map((ev) => (
                    <tr key={ev.id}>
                      <td style={{ fontWeight: 600, fontSize: 14 }}>{ev.title}</td>
                      <td><span className={`badge badge-${ev.type}`}>{ev.type}</span></td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: ev.eventMode === 'group' ? '#fef3c7' : '#f0f9ff',
                            color: ev.eventMode === 'group' ? '#92400e' : '#1e40af',
                          }}
                        >
                          {ev.eventMode === 'group' ? `👥 Group (${ev.groupMinSize}–${ev.groupMaxSize})` : '👤 Individual'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13 }}>{ev.category}</td>
                      <td style={{ fontSize: 13 }}>{format(new Date(ev.eventDate), 'dd MMM yyyy')}</td>
                      <td style={{ fontSize: 13, color: 'var(--warning)' }}>{format(new Date(ev.applicationDeadline), 'dd MMM yyyy')}</td>
                      <td style={{ fontSize: 12 }}>{ev.grades?.join(', ')}</td>
                      <td><span className={`badge ${ev.isActive ? 'badge-approved' : 'badge-rejected'}`}>{ev.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(isMasterAdmin || can('events', 'edit')) && (
                            <button className="btn btn-sm btn-outline" onClick={() => { setEditing(ev); setShowForm(false); }}>Edit</button>
                          )}
                          {(isMasterAdmin || can('events', 'delete')) && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ev.id)}>Del</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
