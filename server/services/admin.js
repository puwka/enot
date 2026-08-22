import { query } from '../db.js';

export const adminLogin = async (email, password) => {
  const { rows } = await query(`SELECT public.admin_login($1, $2) AS result`, [email, password]);
  return rows[0]?.result;
};

export const adminLogout = async (token) => {
  const { rows } = await query(`SELECT public.admin_logout($1) AS result`, [token]);
  return rows[0]?.result;
};

export const adminSession = async (token) => {
  const { rows } = await query(`SELECT public.admin_session($1) AS result`, [token]);
  return rows[0]?.result;
};

export const adminAuthorize = async (token, permission) => {
  const { rows } = await query(`SELECT public.admin_authorize($1, $2) AS result`, [token, permission]);
  return rows[0]?.result;
};

export const adminDashboard = async (token) => {
  const { rows } = await query(`SELECT public.admin_dashboard($1) AS result`, [token]);
  return rows[0]?.result;
};

export const adminCms = async (token, action, entity, id, data) => {
  const rpc =
    ['products', 'banks', 'calculator_configs'].includes(String(entity || '').toLowerCase())
      ? 'public.admin_products_cms'
      : 'public.admin_cms';
  const { rows } = await query(`SELECT ${rpc}($1, $2, $3, $4, $5) AS result`, [
    token,
    action,
    entity,
    id,
    data || {},
  ]);
  return rows[0]?.result;
};
