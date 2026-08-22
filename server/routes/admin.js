import { Router } from 'express';
import { adminAuthorize, adminCms, adminDashboard, adminLogin, adminLogout, adminSession } from '../services/admin.js';

const router = Router();

const getToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return req.headers['x-admin-token'] || '';
};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const data = await adminLogin(String(email || '').trim().toLowerCase(), String(password || ''));
    res.json(data);
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_CREDENTIALS/i.test(message)) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль.' });
    }
    return res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось выполнить вход.' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const data = await adminLogout(getToken(req));
    res.json(data || { ok: true });
  } catch {
    res.json({ ok: true });
  }
});

router.get('/session', async (req, res) => {
  try {
    const data = await adminSession(getToken(req));
    res.json(data);
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_SESSION/i.test(message)) {
      return res.status(401).json({ error: 'INVALID_SESSION', message: 'Сессия недействительна.' });
    }
    return res.status(500).json({ error: 'REQUEST_FAILED' });
  }
});

router.get('/authorize', async (req, res) => {
  try {
    const permission = req.query.permission || null;
    const data = await adminAuthorize(getToken(req), permission);
    res.json(data);
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_SESSION/i.test(message)) {
      return res.status(401).json({ error: 'INVALID_SESSION' });
    }
    if (/FORBIDDEN/i.test(message)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    return res.status(500).json({ error: 'REQUEST_FAILED' });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const data = await adminDashboard(getToken(req));
    res.json(data);
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_SESSION/i.test(message)) {
      return res.status(401).json({ error: 'INVALID_SESSION' });
    }
    return res.status(500).json({ error: 'REQUEST_FAILED' });
  }
});

router.post('/cms', async (req, res) => {
  try {
    const { action, entity, id = null, data = {} } = req.body || {};
    const payload = await adminCms(getToken(req), action, entity, id, data);
    res.json(payload);
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_SESSION/i.test(message)) {
      return res.status(401).json({ error: 'INVALID_SESSION' });
    }
    if (/FORBIDDEN|Недостаточно/i.test(message)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    if (/SLUG_EXISTS/i.test(message)) {
      return res.status(409).json({ error: 'SLUG_EXISTS' });
    }
    if (/Could not find the function|PGRST202|function .* does not exist/i.test(message)) {
      return res.status(503).json({ error: 'CMS_NOT_INSTALLED' });
    }
    return res.status(500).json({ error: 'REQUEST_FAILED', message });
  }
});

export default router;
