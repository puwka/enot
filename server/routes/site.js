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

const requireAdmin = async (req, res, permission = 'settings') => {
  const token = getToken(req);
  await adminAuthorize(token, permission);
  const session = await adminSession(token);
  return session?.admin || session?.user || null;
};

router.get('/settings', async (_req, res) => {
  try {
    const settings = await getPublicSettings();
    res.json({ settings });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED' });
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
    await requireAdmin(req, res, 'settings');
    const settings = await getAdminSettingsBundle();
    res.json({ settings });
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_SESSION/i.test(message)) return res.status(401).json({ error: 'INVALID_SESSION' });
    if (/FORBIDDEN/i.test(message)) return res.status(403).json({ error: 'FORBIDDEN' });
    return res.status(500).json({ error: 'REQUEST_FAILED' });
  }
});

router.put('/admin/settings', async (req, res) => {
  try {
    const admin = await requireAdmin(req, res, 'settings');
    const settings = await saveSettingsBundle(req.body?.settings || req.body || {}, admin?.id || null);
    res.json({ settings });
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_SESSION/i.test(message)) return res.status(401).json({ error: 'INVALID_SESSION' });
    if (/FORBIDDEN/i.test(message)) return res.status(403).json({ error: 'FORBIDDEN' });
    return res.status(500).json({ error: 'REQUEST_FAILED', message });
  }
});

router.get('/admin/stats', async (req, res) => {
  try {
    await requireAdmin(req, res, null);
    const [catalog, clicks] = await Promise.all([getCatalogStats(), getClickStats(30)]);
    res.json({ catalog, clicks });
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_SESSION/i.test(message)) return res.status(401).json({ error: 'INVALID_SESSION' });
    if (/FORBIDDEN/i.test(message)) return res.status(403).json({ error: 'FORBIDDEN' });
    return res.status(500).json({ error: 'REQUEST_FAILED' });
  }
});

router.get('/admin/audit', async (req, res) => {
  try {
    await requireAdmin(req, res, 'system');
    const limit = Math.min(200, Number(req.query.limit) || 100);
    const offset = Math.max(0, Number(req.query.offset) || 0);
    const items = await getAuditLogs({ limit, offset });
    res.json({ items });
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_SESSION/i.test(message)) return res.status(401).json({ error: 'INVALID_SESSION' });
    if (/FORBIDDEN/i.test(message)) return res.status(403).json({ error: 'FORBIDDEN' });
    return res.status(500).json({ error: 'REQUEST_FAILED' });
  }
});

export default router;
