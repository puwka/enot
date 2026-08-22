import { BONUS_CONFIG } from '../config/bonuses';
import { apiFetch } from '../lib/apiClient';
import { clearPrivateCache } from '../pwa/serviceWorkerRegistration';

const TOKEN_KEY = 'enotmani-user-token';

export const getUserToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setUserToken = (token) => {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
};

const authFetch = (path, options = {}) =>
  apiFetch(path, {
    ...options,
    token: options.token ?? getUserToken(),
  });

export const getCurrentSessionUser = async () => {
  const token = getUserToken();
  if (!token) return null;
  const data = await authFetch('/auth/me');
  return data.user;
};

export const subscribeAuthSession = (callback) => {
  getCurrentSessionUser()
    .then(callback)
    .catch(() => callback(null));
  return () => {};
};

export const registerWithApi = async ({ name, email, phone, password, referralCode }) => {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: { name, email, phone, password, referralCode },
  });
  if (data.token) setUserToken(data.token);
  await authFetch('/auth/claim-bonus', {
    method: 'POST',
    body: { actionKey: BONUS_CONFIG.actions.dailyLogin.id },
    token: data.token,
  }).catch(() => {});
  return getCurrentSessionUser();
};

export const loginWithApi = async (loginValue, password) => {
  const value = String(loginValue || '').trim();
  if (!value.includes('@')) {
    const err = new Error('EMAIL_REQUIRED');
    err.code = 'EMAIL_REQUIRED';
    throw err;
  }
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: { email: value.toLowerCase(), password },
  });
  if (data.token) setUserToken(data.token);
  return data.user;
};

export const logoutFromApi = async () => {
  await authFetch('/auth/logout', { method: 'POST' }).catch(() => {});
  setUserToken('');
  clearPrivateCache();
};

export const updateApiProfile = async (patch) => {
  const data = await authFetch('/auth/profile', { method: 'PATCH', body: patch });
  return data.user;
};

export const updateApiPassword = async (currentPassword, nextPassword, email) => {
  await authFetch('/auth/password', {
    method: 'POST',
    body: { currentPassword, nextPassword, email },
  });
};

export const recoverApiPassword = async (email) => {
  await apiFetch('/auth/recover', { method: 'POST', body: { email } });
};

export const removeApiAccount = async () => {
  await authFetch('/auth/account', { method: 'DELETE' });
  setUserToken('');
  clearPrivateCache();
};

export const claimApiBonus = async (action) => {
  const data = await authFetch('/auth/claim-bonus', {
    method: 'POST',
    body: { actionKey: action.id },
  });
  return { already: Boolean(data.already), user: data.user };
};
