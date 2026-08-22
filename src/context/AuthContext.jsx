import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  claimApiBonus,
  getCurrentSessionUser,
  loginWithApi,
  logoutFromApi,
  recoverApiPassword,
  registerWithApi,
  removeApiAccount,
  subscribeAuthSession,
  updateApiPassword,
  updateApiProfile,
} from '../services/userAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await getCurrentSessionUser();
      setUser(next);
      setLoading(false);
      return next;
    } catch {
      setUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
    return subscribeAuthSession((next) => {
      setUser(next);
      setLoading(false);
    });
  }, [refresh]);

  const login = useCallback(async (loginValue, password) => {
    const next = await loginWithApi(loginValue, password);
    setUser(next);
    return next;
  }, []);

  const register = useCallback(async (payload) => {
    const next = await registerWithApi(payload);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await logoutFromApi();
    setUser(null);
  }, []);

  const saveProfile = useCallback(async (patch) => {
    const next = await updateApiProfile(patch);
    setUser(next);
    return next;
  }, []);

  const updatePassword = useCallback(async (currentPassword, nextPassword) => {
    await updateApiPassword(currentPassword, nextPassword, user?.email);
  }, [user?.email]);

  const recoverPassword = useCallback(async (email) => {
    await recoverApiPassword(email);
  }, []);

  const removeAccount = useCallback(async () => {
    await removeApiAccount();
    setUser(null);
  }, []);

  const claimBonus = useCallback(async (action) => {
    const result = await claimApiBonus(action);
    if (result.user) setUser(result.user);
    return result;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      saveProfile,
      updatePassword,
      recoverPassword,
      removeAccount,
      claimBonus,
      refresh,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      saveProfile,
      updatePassword,
      recoverPassword,
      removeAccount,
      claimBonus,
      refresh,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
