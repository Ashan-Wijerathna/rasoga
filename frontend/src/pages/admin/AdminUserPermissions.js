import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import adminAPI from '../../api/adminAPI';
import permissionAPI from '../../api/permissionAPI';

const MODULES = [
  { key: 'applications', label: 'Applications' },
  { key: 'events',       label: 'Events' },
  { key: 'results',      label: 'Results' },
  { key: 'schools',      label: 'Schools' },
  { key: 'users',        label: 'Users' },
  { key: 'reports',      label: 'Reports' },
  { key: 'slides',       label: 'Hero Slides' },
  { key: 'resoza',       label: 'Resoza' },
  { key: 'formBuilder',  label: 'Form Builder' },
];

const ACTIONS = [
  { key: 'canView',   label: 'View' },
  { key: 'canCreate', label: 'Create' },
  { key: 'canEdit',   label: 'Edit' },
  { key: 'canDelete', label: 'Delete' },
];

const emptyPerms = () => {
  const map = {};
  MODULES.forEach(m => {
    map[m.key] = { canView: false, canCreate: false, canEdit: false, canDelete: false };
  });
  return map;
};

export default function AdminUserPermissions() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isMasterAdmin } = useAuth();

  const [targetUser, setTargetUser] = useState(null);
  const [perms, setPerms] = useState(emptyPerms());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      adminAPI.getUser(userId),
      permissionAPI.getUserPermissions(userId),
    ]).then(([userRes, permRes]) => {
      setTargetUser(userRes.data.user);

      const map = emptyPerms();
      permRes.data.permissions.forEach(p => {
        map[p.module] = {
          canView:   p.canView,
          canCreate: p.canCreate,
          canEdit:   p.canEdit,
          canDelete: p.canDelete,
        };
      });
      setPerms(map);
    }).catch(() => toast.error('Failed to load permissions'));
  }, [userId]);

  if (!isMasterAdmin) return <Navigate to="/unauthorized" replace />;

  const toggle = (module, action) => {
    setPerms(prev => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module]?.[action] },
    }));
  };

  const toggleRow = (module) => {
    const allTrue = ACTIONS.every(a => perms[module]?.[a.key]);
    setPerms(prev => ({
      ...prev,
      [module]: { canView: !allTrue, canCreate: !allTrue, canEdit: !allTrue, canDelete: !allTrue },
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const permissions = MODULES
        .filter(m => Object.values(perms[m.key] || {}).some(Boolean))
        .map(m => ({ module: m.key, ...perms[m.key] }));
      await permissionAPI.saveUserPermissions(targetUser.id, permissions);
      toast.success('Permissions saved successfully!');
    } catch {
      toast.error('Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/admin/users')}
          style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 14 }}
        >
          ← Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, color: '#0f2338' }}>Manage Permissions</h2>
          {targetUser && (
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 14 }}>
              {targetUser.name} — {targetUser.email}
            </p>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f2338' }}>
              <th style={{ padding: '14px 20px', textAlign: 'left', color: '#c8a951', fontSize: 13, fontWeight: 600 }}>
                Module
              </th>
              {ACTIONS.map(a => (
                <th key={a.key} style={{ padding: '14px 20px', textAlign: 'center', color: '#fff', fontSize: 13, fontWeight: 600 }}>
                  {a.label}
                </th>
              ))}
              <th style={{ padding: '14px 20px', textAlign: 'center', color: '#c8a951', fontSize: 13, fontWeight: 600 }}>
                All
              </th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m, idx) => (
              <tr key={m.key} style={{ background: idx % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                  {m.label}
                </td>
                {ACTIONS.map(a => (
                  <td key={a.key} style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={perms[m.key]?.[a.key] || false}
                      onChange={() => toggle(m.key, a.key)}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#1a3a5c' }}
                    />
                  </td>
                ))}
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                  <button
                    onClick={() => toggleRow(m.key)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #e2e8f0',
                      borderRadius: 4,
                      padding: '3px 10px',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: '#64748b',
                    }}
                  >
                    {ACTIONS.every(a => perms[m.key]?.[a.key]) ? 'None' : 'All'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          onClick={() => navigate('/admin/users')}
          style={{ padding: '10px 24px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          style={{ padding: '10px 24px', background: '#1a3a5c', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, color: '#fff', fontWeight: 600 }}
        >
          {saving ? 'Saving...' : '💾 Save Permissions'}
        </button>
      </div>
    </div>
  );
}
