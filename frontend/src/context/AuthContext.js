import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('dhaham_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
      setPermissions(data.user.permissions || {});
    } catch {
      localStorage.removeItem('dhaham_token');
      localStorage.removeItem('dhaham_refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login(email, password);
    localStorage.setItem('dhaham_token', data.token);
    localStorage.setItem('dhaham_refreshToken', data.refreshToken);
    setUser(data.user);
    setPermissions(data.user.permissions || {});
    return data.user;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('dhaham_token');
    localStorage.removeItem('dhaham_refreshToken');
    setUser(null);
    setPermissions({});
  };

  // can(module, action) — action defaults to 'view'
  const can = (module, action = 'view') => {
    if (!user) return false;
    if (user.isMasterAdmin) return true;
    if (!permissions[module]) return false;
    const actionKey =
      action === 'view'   ? 'canView'   :
      action === 'create' ? 'canCreate' :
      action === 'edit'   ? 'canEdit'   :
      action === 'delete' ? 'canDelete' : 'canView';
    return permissions[module][actionKey] === true;
  };

  const isMasterAdmin = user?.isMasterAdmin === true;
  const isAdmin  = user?.role === 'admin';
  const isSchool = user?.role === 'school';

  return (
    <AuthContext.Provider value={{
      user, loading, permissions,
      login, logout, loadUser,
      can, isMasterAdmin, isAdmin, isSchool,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
