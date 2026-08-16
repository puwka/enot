import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BONUS_CONFIG } from '../config/bonuses';
import {
  addBonusTransaction,
  authenticateUser,
  claimActionBonus,
  changePassword,
  createUserRecord,
  deleteAccount,
  getSessionUserId,
  getUserById,
  resetPasswordByEmail,
  seedDemoCabinetData,
  setSessionUserId,
  subscribeAuth,
  updateProfile,
} from '../services/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const id = getSessionUserId();
    setUser(id ? getUserById(id) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeAuth(refresh);
  }, [refresh]);

  const login = useCallback(async (loginValue, password) => {
    const next = await authenticateUser(loginValue, password);
    setSessionUserId(next.id);
    claimActionBonus(next.id, BONUS_CONFIG.actions.dailyLogin);
    seedDemoCabinetData(next.id);
    refresh();
    return getUserById(next.id);
  }, [refresh]);

  const register = useCallback(async (payload) => {
    const created = await createUserRecord(payload);
    setSessionUserId(created.id);
    addBonusTransaction(created.id, {
      title: 'Добро пожаловать',
      points: 50,
      actionId: 'welcome',
    });
    claimActionBonus(created.id, BONUS_CONFIG.actions.dailyLogin);
    seedDemoCabinetData(created.id);
    refresh();
    return getUserById(created.id);
  }, [refresh]);

  const logout = useCallback(() => {
    setSessionUserId(null);
    refresh();
  }, [refresh]);

  const saveProfile = useCallback(
    (patch) => {
      if (!user) return null;
      const next = updateProfile(user.id, patch);
      refresh();
      return next;
    },
    [user, refresh]
  );

  const updatePassword = useCallback(
    async (currentPassword, nextPassword) => {
      if (!user) throw new Error('NOT_FOUND');
      await changePassword(user.id, currentPassword, nextPassword);
      refresh();
    },
    [user, refresh]
  );

  const recoverPassword = useCallback(async (email, nextPassword) => {
    await resetPasswordByEmail(email, nextPassword);
  }, []);

  const removeAccount = useCallback(() => {
    if (!user) return;
    deleteAccount(user.id);
    refresh();
  }, [user, refresh]);

  const claimBonus = useCallback(
    (action) => {
      if (!user) return null;
      const result = claimActionBonus(user.id, action);
      refresh();
      return result;
    },
    [user, refresh]
  );

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
