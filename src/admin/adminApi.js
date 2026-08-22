import { apiFetch } from '../lib/apiClient';
import { clearPrivateCache } from '../pwa/serviceWorkerRegistration';

const TOKEN_KEY = 'enotmani-admin-token';

export const getAdminToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setAdminToken = (token) => {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
};

export const clearAdminToken = () => {
  setAdminToken('');
  clearPrivateCache();
};

const adminFetch = (path, options = {}) =>
  apiFetch(path, {
    ...options,
    adminToken: options.adminToken ?? getAdminToken(),
  });

const asAdminError = (error, fallbackCode = 'REQUEST_FAILED') => {
  const message = error?.message || fallbackCode;
  const next = new Error(message);
  if (/INVALID_CREDENTIALS/i.test(message) || error?.code === 'INVALID_CREDENTIALS') {
    next.code = 'INVALID_CREDENTIALS';
  } else if (/INVALID_SESSION/i.test(message) || error?.code === 'INVALID_SESSION') {
    next.code = 'INVALID_SESSION';
  } else if (/FORBIDDEN/i.test(message) || error?.code === 'FORBIDDEN') {
    next.code = 'FORBIDDEN';
  } else if (error?.code === 'ADMIN_CONFIG_MISSING') {
    next.code = 'ADMIN_CONFIG_MISSING';
  } else {
    next.code = error?.code || fallbackCode;
  }
  next.status =
    next.code === 'FORBIDDEN' ? 403 : next.code === 'INVALID_SESSION' || next.code === 'INVALID_CREDENTIALS' ? 401 : 500;
  return next;
};

export const adminLogin = async (email, password) => {
  try {
    const data = await adminFetch('/admin/login', {
      method: 'POST',
      body: {
        email: String(email || '').trim().toLowerCase(),
        password: String(password || ''),
      },
      adminToken: '',
    });
    return data;
  } catch (error) {
    throw asAdminError(error, 'INVALID_CREDENTIALS');
  }
};

export const adminLogout = async () => {
  const token = getAdminToken();
  if (!token) return { ok: true };
  try {
    const data = await adminFetch('/admin/logout', { method: 'POST' });
    return data;
  } catch (error) {
    throw asAdminError(error);
  }
};

export const adminSession = async () => {
  const token = getAdminToken();
  if (!token) {
    const error = new Error('INVALID_SESSION');
    error.code = 'INVALID_SESSION';
    error.status = 401;
    throw error;
  }
  try {
    return await adminFetch('/admin/session');
  } catch (error) {
    throw asAdminError(error, 'INVALID_SESSION');
  }
};

export const adminAuthorize = async (permission) => {
  const token = getAdminToken();
  if (!token) {
    const error = new Error('INVALID_SESSION');
    error.code = 'INVALID_SESSION';
    error.status = 401;
    throw error;
  }
  try {
    const query = permission ? `?permission=${encodeURIComponent(permission)}` : '';
    return await adminFetch(`/admin/authorize${query}`);
  } catch (error) {
    throw asAdminError(error, 'FORBIDDEN');
  }
};

export const adminDashboard = async () => {
  const token = getAdminToken();
  if (!token) {
    const error = new Error('INVALID_SESSION');
    error.code = 'INVALID_SESSION';
    error.status = 401;
    throw error;
  }
  try {
    return await adminFetch('/admin/dashboard');
  } catch (error) {
    throw asAdminError(error);
  }
};
