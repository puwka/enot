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
  const normalizedId = id && String(id).trim() && !String(id).startsWith('site-') ? String(id).trim() : null;
  try {
    const { rows } = await query(`SELECT ${rpc}($1, $2, $3, $4::uuid, $5::jsonb) AS result`, [
      token,
      action,
      entity,
      normalizedId,
      JSON.stringify(data || {}),
    ]);
    return rows[0]?.result;
  } catch (error) {
    const message = String(error?.message || error || '');
    if (/unique|duplicate key/i.test(message)) {
      const err = new Error('SLUG_EXISTS');
      err.code = 'SLUG_EXISTS';
      throw err;
    }
    if (/invalid input syntax for type uuid/i.test(message)) {
      const err = new Error(
        'Некорректный ID категории или банка. Обновите страницу и заново выберите категорию раздела.'
      );
      err.code = 'INVALID_UUID';
      throw err;
    }
    if (/null value in column \"category_id\"/i.test(message)) {
      const err = new Error('Не выбрана категория. Выберите категорию раздела перед сохранением.');
      err.code = 'CATEGORY_REQUIRED';
      throw err;
    }
    if (/null value in column \"partner_url\"|null value in column \"slug\"/i.test(message)) {
      const err = new Error('Заполните slug и ссылку на партнёра (или оставьте пустую ссылку — подставится заглушка).');
      err.code = 'REQUIRED_FIELD';
      throw err;
    }
    throw error;
  }
};
