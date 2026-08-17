import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  adminAuthorize,
  adminLogin,
  adminLogout,
  adminSession,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from './adminApi';
import { canAccessSection, getAllowedSections, hasPermission } from './permissions';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await adminSession();
      setAdmin(data.admin);
      setLoading(false);
      return data.admin;
    } catch {
      clearAdminToken();
      setAdmin(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email, password) => {
    const data = await adminLogin(email, password);
    setAdminToken(data.token);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch {
    } finally {
      clearAdminToken();
      setAdmin(null);
    }
  }, []);

  const authorize = useCallback(async (permission) => {
    const data = await adminAuthorize(permission);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      isAuthenticated: Boolean(admin),
      role: admin?.role || null,
      login,
      logout,
      refresh,
      authorize,
      hasPermission: (permission) => hasPermission(admin?.role, permission),
      canAccessSection: (sectionKey) => canAccessSection(admin?.role, sectionKey),
      allowedSections: getAllowedSections(admin?.role),
    }),
    [admin, loading, login, logout, refresh, authorize]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
