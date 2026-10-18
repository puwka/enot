import { Router } from 'express';
import { getPublicSettings, getAdminSettingsBundle, saveSettingsBundle } from '../services/siteSettings.js';
import { trackProductClick, getCatalogStats, getClickStats, getAuditLogs } from '../services/stats.js';
import { adminAuthorize, adminSession } from '../services/admin.js';

const router = Router();

const getToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return req.headers['x-admin-token'] || '';
};

/** Permissions that older DBs (pre-020) may not grant via RPC yet */
const LEGACY_ADMIN_EXTRA = new Set(['settings', 'system', 'media']);

const requireAdminWithReq = async (req, permission = 'settings') => {
  const token = getToken(req);
  if (!token) {
    const err = new Error('INVALID_SESSION');
    err.code = 'INVALID_SESSION';
    throw err;
  }

  let session;
  try {
    session = await adminSession(token);
  } catch {
    const err = new Error('INVALID_SESSION');
    err.code = 'INVALID_SESSION';
    throw err;
  }

  const admin = session?.admin || null;
  if (!admin) {
    const err = new Error('INVALID_SESSION');
    err.code = 'INVALID_SESSION';
    throw err;
  }

  const role = String(admin.role || '');
  if (role === 'SUPERADMIN') return admin;

  try {
    await adminAuthorize(token, permission);
    return admin;
  } catch (error) {
    const message = String(error?.message || '');
    if (
      role === 'ADMIN' &&
      LEGACY_ADMIN_EXTRA.has(permission || '') &&
      /FORBIDDEN/i.test(message)
    ) {
      return admin;
    }
    if (/INVALID_SESSION/i.test(message)) {
      const err = new Error('INVALID_SESSION');
      err.code = 'INVALID_SESSION';
      throw err;
    }
    const err = new Error('FORBIDDEN');
    err.code = 'FORBIDDEN';
    throw err;
  }
};

const sendAuthError = (res, error) => {
  const code = error?.code || '';
  const message = String(error?.message || '');
  if (code === 'INVALID_SESSION' || /INVALID_SESSION/i.test(message)) {
    return res.status(401).json({ error: 'INVALID_SESSION' });
  }
  if (code === 'FORBIDDEN' || /FORBIDDEN/i.test(message)) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Нет прав на эту операцию. Выполните npm run db:migrate на сервере.',
    });
  }
  return res.status(500).json({ error: 'REQUEST_FAILED', message: message.slice(0, 300) });
};

router.get('/settings', async (_req, res) => {
  try {
    const settings = await getPublicSettings();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: 'REQUEST_FAILED', message: String(error?.message || '').slice(0, 200) });
  }
});

router.post('/clicks', async (req, res) => {
  try {
    const body = req.body || {};
    const row = await trackProductClick({
      productId: body.productId || body.product_id || null,
      productSlug: body.productSlug || body.slug || '',
      bankName: body.bankName || body.bank || '',
      categorySlug: body.categorySlug || body.category || '',
      source: body.source || 'site',
    });
    res.json({ ok: true, item: row });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED' });
  }
});

router.get('/admin/settings', async (req, res) => {
  try {
    await requireAdminWithReq(req, 'settings');
    const settings = await getAdminSettingsBundle();
    res.json({ settings });
  } catch (error) {
    return sendAuthError(res, error);
  }
});

router.put('/admin/settings', async (req, res) => {
  try {
    const admin = await requireAdminWithReq(req, 'settings');
    const settings = await saveSettingsBundle(req.body?.settings || req.body || {}, admin?.id || null);
    res.json({ settings });
  } catch (error) {
    return sendAuthError(res, error);
  }
});

router.get('/admin/stats', async (req, res) => {
  try {
    await requireAdminWithReq(req, null);
    const [catalog, clicks] = await Promise.all([
      getCatalogStats().catch(() => []),
      getClickStats(30).catch(() => ({
        days: 30,
        totals: { total_clicks: 0, clicks_today: 0, clicks_week: 0 },
        byBank: [],
        byCategory: [],
      })),
    ]);
    res.json({ catalog, clicks });
  } catch (error) {
    return sendAuthError(res, error);
  }
});

router.get('/admin/audit', async (req, res) => {
  try {
    await requireAdminWithReq(req, 'system');
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const items = await getAuditLogs({ limit, offset });
    res.json({ items });
  } catch (error) {
    return sendAuthError(res, error);
  }
});

export default router;
