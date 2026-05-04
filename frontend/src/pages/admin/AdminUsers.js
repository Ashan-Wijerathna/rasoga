import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const MASTER_ADMIN_EMAIL = "admin@dhaham.lk";

const PERMISSIONS = [
  {
    key: "edit_results",
    label: "Edit Results",
    desc: "Create, publish and edit result sheets",
  },
  {
    key: "edit_schools",
    label: "Edit School Details",
    desc: "Create, update and toggle schools",
  },
  {
    key: "edit_applications",
    label: "Edit Application Details",
    desc: "Review and evaluate applications",
  },
];

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const [permissions, setPermissions] = useState(user.permissions || []);
  const [fullAccess, setFullAccess] = useState(
    !user.permissions || user.permissions.length === 0,
  );
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const togglePerm = (key) =>
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSaving(true);
    try {
      const permsToSave =
        form.role === "admin" ? (fullAccess ? [] : permissions) : [];
      await adminAPI.updateUser(user.id, { ...form, permissions: permsToSave });
      toast.success("User updated successfully");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setResetting(true);
    try {
      await adminAPI.resetPassword(user.id, { newPassword });
      toast.success("Password reset successfully");
      setNewPassword("");
    } catch {
      toast.error("Password reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: 460,
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            background: "var(--primary)",
            padding: "18px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
              Edit User
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {user.email}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Full name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="form-control"
                placeholder="email@example.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="form-control"
              >
                <option value="school">School</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {form.role === "admin" && (
              <div className="form-group">
                <label className="form-label">Admin Permissions</label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={fullAccess}
                    onChange={(e) => {
                      setFullAccess(e.target.checked);
                      if (e.target.checked) setPermissions([]);
                    }}
                    style={{
                      width: 15,
                      height: 15,
                      accentColor: "var(--primary)",
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    Full Access{" "}
                    <span
                      style={{ fontWeight: 400, color: "var(--text-muted)" }}
                    >
                      (all permissions)
                    </span>
                  </span>
                </label>
                {!fullAccess && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      paddingLeft: 4,
                    }}
                  >
                    {PERMISSIONS.map(({ key, label, desc }) => (
                      <label
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          cursor: "pointer",
                          padding: "8px 12px",
                          borderRadius: 8,
                          border: `1.5px solid ${permissions.includes(key) ? "var(--primary)" : "var(--border)"}`,
                          background: permissions.includes(key)
                            ? "#eff6ff"
                            : "#fff",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={permissions.includes(key)}
                          onChange={() => togglePerm(key)}
                          style={{
                            width: 15,
                            height: 15,
                            marginTop: 1,
                            accentColor: "var(--primary)",
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {label}
                          </div>
                          <div
                            style={{ fontSize: 11, color: "var(--text-muted)" }}
                          >
                            {desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

          <div
            style={{ borderTop: "1px solid var(--border)", margin: "20px 0" }}
          />

          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 10,
                color: "var(--text-muted)",
              }}
            >
              Reset Password
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-control"
                placeholder="New password (min 6 chars)"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-outline"
                onClick={resetPassword}
                disabled={resetting}
                style={{ whiteSpace: "nowrap" }}
              >
                {resetting ? "..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleDropdown({ user, onRoleChange, disabled }) {
  const [open, setOpen] = useState(false);

  const roles = [
    { value: "admin", label: "Make Admin" },
    { value: "school", label: "Make School" },
  ].filter((r) => r.value !== user.role);

  return (
    <div style={{ position: "relative" }}>
      <button
        className="btn btn-sm btn-outline"
        onClick={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        style={{ whiteSpace: "nowrap" }}
        title={disabled ? "Cannot modify this account" : "Change role"}
      >
        Role ▾
      </button>
      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: 8,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              zIndex: 100,
              minWidth: 140,
              overflow: "hidden",
            }}
          >
            {roles.map((r) => (
              <button
                key={r.value}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "9px 14px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.target.style.background = "#f5f5f5")}
                onMouseLeave={(e) => (e.target.style.background = "none")}
                onClick={() => {
                  setOpen(false);
                  onRoleChange(user.id, r.value, user.name);
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminUsers() {
  const { user: currentUser, isMasterAdmin, can } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [changingRoleId, setChangingRoleId] = useState(null);

  const isMasterAdminUser = (u) => u.email === MASTER_ADMIN_EMAIL;
  const isCurrentUser = (u) => u.id === currentUser?.id;
  const canModify = (u) => !isMasterAdminUser(u) && !isCurrentUser(u);

  const load = () => {
    setLoading(true);
    adminAPI
      .getUsers({ role: roleFilter || undefined, search: search || undefined })
      .then((r) => setUsers(r.data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [roleFilter, search]);

  const toggle = async (u) => {
    const action = u.isActive ? "disable" : "enable";
    const confirmed = window.confirm(
      u.isActive
        ? `Disable ${u.name}? They will not be able to login.`
        : `Enable ${u.name}? They will be able to login again.`,
    );
    if (!confirmed) return;

    setTogglingId(u.id);
    try {
      const res = await adminAPI.toggleUser(u.id);
      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id ? { ...x, isActive: res.data.user.isActive } : x,
        ),
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleRoleChange = async (userId, role, name) => {
    const confirmed = window.confirm(`Change ${name}'s role to "${role}"?`);
    if (!confirmed) return;

    setChangingRoleId(userId);
    try {
      const res = await adminAPI.changeRole(userId, role);
      setUsers((prev) =>
        prev.map((x) =>
          x.id === userId ? { ...x, role: res.data.user.role } : x,
        ),
      );
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change role");
    } finally {
      setChangingRoleId(null);
    }
  };

  const deleteUser = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      toast.success("User deleted");
      setConfirmDeleteId(null);
      setUsers((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const disabledUsers = users.filter((u) => !u.isActive).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  const roleBadgeStyle = (role) => {
    const styles = {
      admin: { background: "#1a3a5c", color: "#fff" },
      school: { background: "#0ea5e9", color: "#fff" },
    };
    return styles[role] || { background: "#7c3aed", color: "#fff" };
  };

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>User Management</h1>
        <p
          style={{ color: "var(--text-muted)", marginBottom: 20, fontSize: 14 }}
        >
          Control user access and permissions
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Total Users",
              value: totalUsers,
              color: "var(--primary)",
            },
            { label: "Active", value: activeUsers, color: "#16a34a" },
            { label: "Disabled", value: disabledUsers, color: "#dc2626" },
            { label: "Admins", value: adminUsers, color: "#1a3a5c" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card" style={{ margin: 0 }}>
              <div className="card-body" style={{ padding: "14px 18px" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>
                  {loading ? "—" : value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and filter */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div
            className="card-body"
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              alignItems: "flex-end",
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Role</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  ["", "All"],
                  ["school", "Schools"],
                  ["admin", "Admins"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setRoleFilter(val)}
                    className="btn btn-sm"
                    style={{
                      background:
                        roleFilter === val
                          ? "var(--primary)"
                          : "var(--bg-card)",
                      color: roleFilter === val ? "#fff" : "var(--text)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>School</th>
                    <th>Last Login</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          textAlign: "center",
                          color: "var(--text-muted)",
                          padding: 40,
                        }}
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => {
                      const modifiable = canModify(u);
                      const isToggling = togglingId === u.id;
                      const isChangingRole = changingRoleId === u.id;
                      const disabledTitle = isMasterAdminUser(u)
                        ? "Master admin cannot be modified"
                        : isCurrentUser(u)
                          ? "Cannot modify your own account"
                          : "";

                      return (
                        <tr key={u.id}>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  background: "var(--primary)",
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: 15,
                                  flexShrink: 0,
                                }}
                              >
                                {u.name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                  {u.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  {u.createdAt
                                    ? format(
                                        new Date(u.createdAt),
                                        "dd MMM yyyy",
                                      )
                                    : ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td
                            style={{ fontSize: 13, color: "var(--text-muted)" }}
                          >
                            {u.email}
                          </td>
                          <td>
                            <span
                              style={{
                                ...roleBadgeStyle(u.role),
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "3px 9px",
                                borderRadius: 20,
                              }}
                            >
                              {u.role}
                            </span>
                            {u.role === "admin" &&
                              u.permissions &&
                              u.permissions.length > 0 && (
                                <div
                                  style={{
                                    marginTop: 4,
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 3,
                                  }}
                                >
                                  {u.permissions.map((p) => (
                                    <span
                                      key={p}
                                      style={{
                                        fontSize: 10,
                                        background: "#eff6ff",
                                        color: "#1d4ed8",
                                        border: "1px solid #bfdbfe",
                                        borderRadius: 4,
                                        padding: "1px 5px",
                                      }}
                                    >
                                      {p.replace("edit_", "")}
                                    </span>
                                  ))}
                                </div>
                              )}
                            {u.role === "admin" &&
                              (!u.permissions ||
                                u.permissions.length === 0) && (
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "var(--text-muted)",
                                    marginTop: 2,
                                  }}
                                >
                                  full access
                                </div>
                              )}
                          </td>
                          <td style={{ fontSize: 13 }}>
                            {u.school?.name || "—"}
                          </td>
                          <td
                            style={{ fontSize: 12, color: "var(--text-muted)" }}
                          >
                            {u.lastLogin
                              ? format(new Date(u.lastLogin), "dd MMM yyyy")
                              : "Never"}
                          </td>
                          <td>
                            {(isMasterAdmin || can('users', 'edit')) ? (
                              <button
                                onClick={() =>
                                  modifiable && !isToggling && toggle(u)
                                }
                                disabled={!modifiable || isToggling}
                                title={
                                  !modifiable
                                    ? disabledTitle
                                    : u.isActive
                                      ? "Click to disable"
                                      : "Click to enable"
                                }
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "4px 10px",
                                  borderRadius: 20,
                                  border: "none",
                                  cursor:
                                    modifiable && !isToggling
                                      ? "pointer"
                                      : "not-allowed",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  background: u.isActive ? "#dcfce7" : "#fee2e2",
                                  color: u.isActive ? "#16a34a" : "#dc2626",
                                  opacity: !modifiable ? 0.6 : 1,
                                }}
                              >
                                {isToggling ? (
                                  <>⏳ Updating...</>
                                ) : (
                                  <>{u.isActive ? "● Active" : "○ Disabled"}</>
                                )}
                              </button>
                            ) : (
                              <span style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "4px 10px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                                background: u.isActive ? "#dcfce7" : "#fee2e2",
                                color: u.isActive ? "#16a34a" : "#dc2626",
                              }}>
                                {u.isActive ? "● Active" : "○ Disabled"}
                              </span>
                            )}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "nowrap",
                                alignItems: "center",
                              }}
                            >
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => setEditingUser(u)}
                              >
                                ✏️ Edit
                              </button>

                              {isMasterAdmin && !isMasterAdminUser(u) && (
                                <button
                                  onClick={() =>
                                    navigate(`/admin/users/${u.id}/permissions`)
                                  }
                                  style={{
                                    background: "#1a3a5c",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    padding: "5px 12px",
                                    fontSize: 12,
                                    cursor: "pointer",
                                  }}
                                >
                                  🔑 Permissions
                                </button>
                              )}

                              <RoleDropdown
                                user={u}
                                onRoleChange={handleRoleChange}
                                disabled={!modifiable || isChangingRole}
                              />

                              {u.role !== "admin" &&
                                (confirmDeleteId === u.id ? (
                                  <span
                                    style={{
                                      display: "flex",
                                      gap: 4,
                                      alignItems: "center",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: "var(--danger)",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Sure?
                                    </span>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => deleteUser(u.id)}
                                    >
                                      Yes
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline"
                                      onClick={() => setConfirmDeleteId(null)}
                                    >
                                      No
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-danger"
                                    style={{
                                      background: "none",
                                      color: "var(--danger)",
                                      border: "1px solid var(--danger)",
                                    }}
                                    onClick={() => setConfirmDeleteId(u.id)}
                                  >
                                    🗑 Delete
                                  </button>
                                ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            load();
          }}
        />
      )}
    </div>
  );
}
