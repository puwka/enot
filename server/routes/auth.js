import { Router } from 'express';
import {
  claimBonus,
  deleteAccount,
  loadCabinet,
  loginUser,
  registerUser,
  resolveSessionUserId,
  revokeSession,
  updatePassword,
  updateProfile,
} from '../services/users.js';

const router = Router();

const getToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return req.headers['x-user-token'] || '';
};

const requireUser = async (req, res, next) => {
  try {
    const userId = await resolveSessionUserId(getToken(req));
    if (!userId) {
      return res.status(401).json({ error: 'INVALID_SESSION', message: 'Сессия недействительна.' });
    }
    req.userId = userId;
    return next();
  } catch {
    return res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось проверить сессию.' });
  }
};

router.post('/register', async (req, res) => {
  try {
    const result = await registerUser(req.body || {});
    res.json(result);
  } catch (error) {
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'Email уже зарегистрирован.' });
    }
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось зарегистрироваться.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, login, password } = req.body || {};
    const result = await loginUser(email || login, password);
    res.json(result);
  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль.' });
    }
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось выполнить вход.' });
  }
});

router.post('/logout', async (req, res) => {
  await revokeSession(getToken(req));
  res.json({ ok: true });
});

router.get('/me', requireUser, async (req, res) => {
  const user = await loadCabinet(req.userId);
  if (!user) return res.status(404).json({ error: 'NOT_FOUND', message: 'Пользователь не найден.' });
  return res.json({ user });
});

router.patch('/profile', requireUser, async (req, res) => {
  try {
    const user = await updateProfile(req.userId, req.body || {});
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось сохранить профиль.' });
  }
});

router.post('/password', requireUser, async (req, res) => {
  try {
    const { currentPassword, nextPassword, email } = req.body || {};
    await updatePassword(req.userId, email, currentPassword, nextPassword);
    res.json({ ok: true });
  } catch (error) {
    if (error.message === 'INVALID_PASSWORD') {
      return res.status(400).json({ error: 'INVALID_PASSWORD', message: 'Неверный текущий пароль.' });
    }
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось сменить пароль.' });
  }
});

router.post('/recover', async (req, res) => {
  res.json({ ok: true, message: 'Если email существует, инструкция будет отправлена администратором.' });
});

router.delete('/account', requireUser, async (req, res) => {
  await deleteAccount(req.userId);
  await revokeSession(getToken(req));
  res.json({ ok: true });
});

router.post('/claim-bonus', requireUser, async (req, res) => {
  try {
    const actionKey = req.body?.actionKey || req.body?.id;
    const result = await claimBonus(req.userId, actionKey);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось начислить бонус.' });
  }
});

export default router;
