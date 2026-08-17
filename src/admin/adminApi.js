import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

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

export const clearAdminToken = () => setAdminToken('');

const requireClient = () => {
  if (!isSupabaseConfigured || !supabase) {
    const error = new Error('ADMIN_CONFIG_MISSING');
    error.code = 'ADMIN_CONFIG_MISSING';
    throw error;
  }
  return supabase;
};

const asAdminError = (error, fallbackCode = 'REQUEST_FAILED') => {
  const message = error?.message || fallbackCode;
  const next = new Error(message);
  if (/INVALID_CREDENTIALS/i.test(message)) next.code = 'INVALID_CREDENTIALS';
  else if (/INVALID_SESSION/i.test(message)) next.code = 'INVALID_SESSION';
  else if (/FORBIDDEN/i.test(message)) next.code = 'FORBIDDEN';
  else if (error?.code === 'ADMIN_CONFIG_MISSING') next.code = 'ADMIN_CONFIG_MISSING';
  else next.code = fallbackCode;
  next.status = next.code === 'FORBIDDEN' ? 403 : next.code === 'INVALID_SESSION' || next.code === 'INVALID_CREDENTIALS' ? 401 : 500;
  return next;
};

export const adminLogin = async (email, password) => {
  const client = requireClient();
  const { data, error } = await client.rpc('admin_login', {
    p_email: String(email || '').trim().toLowerCase(),
    p_password: String(password || ''),
  });
  if (error) throw asAdminError(error, 'INVALID_CREDENTIALS');
  return data;
};

export const adminLogout = async () => {
  const client = requireClient();
  const token = getAdminToken();
  if (!token) return { ok: true };
  const { data, error } = await client.rpc('admin_logout', { p_token: token });
  if (error) throw asAdminError(error);
  return data;
};

export const adminSession = async () => {
  const client = requireClient();
  const token = getAdminToken();
  if (!token) {
    const error = new Error('INVALID_SESSION');
    error.code = 'INVALID_SESSION';
    error.status = 401;
    throw error;
  }
  const { data, error } = await client.rpc('admin_session', { p_token: token });
  if (error) throw asAdminError(error, 'INVALID_SESSION');
  return data;
};

export const adminAuthorize = async (permission) => {
  const client = requireClient();
  const token = getAdminToken();
  if (!token) {
    const error = new Error('INVALID_SESSION');
    error.code = 'INVALID_SESSION';
    error.status = 401;
    throw error;
  }
  const { data, error } = await client.rpc('admin_authorize', {
    p_token: token,
    p_permission: permission || null,
  });
  if (error) throw asAdminError(error, 'FORBIDDEN');
  return data;
};

export const adminDashboard = async () => {
  const client = requireClient();
  const token = getAdminToken();
  if (!token) {
    const error = new Error('INVALID_SESSION');
    error.code = 'INVALID_SESSION';
    error.status = 401;
    throw error;
  }
  const { data, error } = await client.rpc('admin_dashboard', { p_token: token });
  if (error) throw asAdminError(error);
  return data;
};
