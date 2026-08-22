import crypto from 'crypto';
import { query, withClient } from '../db.js';
import { createToken, hashToken } from '../lib/tokens.js';
import { config } from '../config.js';

const SESSION_MS = config.sessionDays * 24 * 60 * 60 * 1000;

const mapHistory = (rows = []) =>
  rows.map((row) => ({
    id: row.id,
    title: row.title,
    points: row.points,
    status: row.status === 'credited' ? 'Начислено' : row.status,
    dateISO: row.created_at,
    actionId: row.meta?.action_key || null,
  }));

export const mapUser = (profile, history = [], referralIds = []) => {
  const completedActions = {};
  history.forEach((item) => {
    if (item.actionId && item.points > 0) {
      completedActions[item.actionId] = item.dateISO;
    }
  });

  return {
    id: profile.id,
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    avatar: '',
    notifications: profile.notifications || { email: true, pushes: false },
    bonusBalance: profile.bonus_balance || 0,
    bonusHistory: mapHistory(history),
    completedActions,
    referralCode: profile.referral_code || '',
    referredBy: profile.referred_by || null,
    referrals: referralIds,
    loans: profile.loans_demo || [],
    applications: profile.applications_demo || { total: 0, approved: 0, rejected: 0 },
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    lastLoginDate: profile.last_login_at ? String(profile.last_login_at).slice(0, 10) : '',
  };
};

export const loadCabinet = async (userId) => {
  const { rows: profiles } = await query(
    `SELECT * FROM public.users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
    [userId]
  );
  const profile = profiles[0];
  if (!profile) return null;

  const [{ rows: history }, { rows: referrals }] = await Promise.all([
    query(
      `SELECT id, title, points, status, created_at, meta
       FROM public.bonus_transactions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    ),
    query(
      `SELECT invitee_id FROM public.referrals WHERE referrer_id = $1 AND deleted_at IS NULL`,
      [userId]
    ),
  ]);

  return mapUser(
    profile,
    history,
    referrals.map((item) => item.invitee_id)
  );
};

const generateReferralCode = async (client) => {
  for (let i = 0; i < 20; i += 1) {
    const code = `ENOT-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const { rows } = await client.query(`SELECT 1 FROM public.users WHERE referral_code = $1 LIMIT 1`, [code]);
    if (!rows.length) return code;
  }
  throw new Error('REFERRAL_CODE_FAILED');
};

export const createSession = async (userId) => {
  const rawToken = createToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await query(
    `INSERT INTO public.user_sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt.toISOString()]
  );
  return { token: rawToken, expiresAt };
};

export const resolveSessionUserId = async (token) => {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const { rows } = await query(
    `SELECT user_id
     FROM public.user_sessions
     WHERE token_hash = $1
       AND revoked_at IS NULL
       AND expires_at > timezone('utc', now())
     LIMIT 1`,
    [tokenHash]
  );
  return rows[0]?.user_id || null;
};

export const revokeSession = async (token) => {
  if (!token) return;
  const tokenHash = hashToken(token);
  await query(
    `UPDATE public.user_sessions
     SET revoked_at = timezone('utc', now())
     WHERE token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash]
  );
};

export const registerUser = async ({ name, email, phone, password, referralCode }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return withClient(async (client) => {
    await client.query('BEGIN');
    try {
      const existing = await client.query(`SELECT 1 FROM public.users WHERE lower(email) = $1 LIMIT 1`, [
        normalizedEmail,
      ]);
      if (existing.rows.length) {
        const err = new Error('EMAIL_EXISTS');
        err.code = 'EMAIL_EXISTS';
        throw err;
      }

      const { rows: roleRows } = await client.query(`SELECT id FROM public.roles WHERE slug = 'user' LIMIT 1`);
      const roleId = roleRows[0]?.id;
      if (!roleId) throw new Error('DEFAULT_ROLE_MISSING');

      let referrerId = null;
      const refCode = String(referralCode || '').trim().toUpperCase();
      if (refCode) {
        const { rows: referrerRows } = await client.query(
          `SELECT id FROM public.users
           WHERE referral_code = $1 AND deleted_at IS NULL AND status = 'active'
           LIMIT 1`,
          [refCode]
        );
        referrerId = referrerRows[0]?.id || null;
      }

      const code = await generateReferralCode(client);
      const { rows: userRows } = await client.query(
        `INSERT INTO public.users (role_id, email, password_hash, name, phone, referral_code, referred_by)
         VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5, $6, $7)
         RETURNING id`,
        [roleId, normalizedEmail, password, String(name || '').trim(), String(phone || '').trim(), code, referrerId]
      );
      const userId = userRows[0].id;

      await client.query(`SELECT set_config('app.allow_secure_update', 'on', true)`);

      const { rows: welcomeRuleRows } = await client.query(
        `SELECT id FROM public.bonus_rules WHERE action_key = 'welcome' LIMIT 1`
      );
      if (welcomeRuleRows[0]?.id) {
        await client.query(
          `INSERT INTO public.bonus_transactions (user_id, rule_id, title, points, status, meta)
           VALUES ($1, $2, 'Добро пожаловать', 50, 'credited', '{"action_key":"welcome"}'::jsonb)`,
          [userId, welcomeRuleRows[0].id]
        );
      }

      if (referrerId) {
        const { rows: inviteRuleRows } = await client.query(
          `SELECT id, points FROM public.bonus_rules
           WHERE action_key = 'invite-friend' AND status = 'published' AND deleted_at IS NULL
           LIMIT 1`
        );
        const inviteRuleId = inviteRuleRows[0]?.id;
        const invitePoints = inviteRuleRows[0]?.points || 100;
        if (inviteRuleId) {
          const { rows: txRows } = await client.query(
            `INSERT INTO public.bonus_transactions (user_id, rule_id, title, points, status, meta)
             VALUES ($1, $2, 'Приглашение друга', $3, 'credited', jsonb_build_object('action_key', 'invite-friend', 'invitee_id', $4))
             RETURNING id`,
            [referrerId, inviteRuleId, invitePoints, userId]
          );
          await client.query(
            `INSERT INTO public.referrals (referrer_id, invitee_id, status, bonus_transaction_id)
             VALUES ($1, $2, 'completed', $3)`,
            [referrerId, userId, txRows[0].id]
          );
        }
      }

      await client.query('COMMIT');
      const session = await createSession(userId);
      const user = await loadCabinet(userId);
      return { user, ...session };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  });
};

export const loginUser = async (email, password) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const { rows } = await query(
    `SELECT id, password_hash
     FROM public.users
     WHERE lower(email) = $1 AND deleted_at IS NULL AND status = 'active'
     LIMIT 1`,
    [normalizedEmail]
  );
  const row = rows[0];
  if (!row) {
    const err = new Error('INVALID_CREDENTIALS');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  const { rows: validRows } = await query(`SELECT (crypt($1, $2) = $2) AS ok`, [password, row.password_hash]);
  if (!validRows[0]?.ok) {
    const err = new Error('INVALID_CREDENTIALS');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  await query(`SELECT public.claim_bonus_action($1, $2)`, ['daily-login', row.id]);
  const session = await createSession(row.id);
  const user = await loadCabinet(row.id);
  return { user, ...session };
};

export const updateProfile = async (userId, patch) => {
  const payload = [];
  const values = [];
  let idx = 1;
  if (patch.name !== undefined) {
    payload.push(`name = $${idx++}`);
    values.push(String(patch.name).trim());
  }
  if (patch.phone !== undefined) {
    payload.push(`phone = $${idx++}`);
    values.push(String(patch.phone).trim());
  }
  if (patch.notifications !== undefined) {
    payload.push(`notifications = $${idx++}::jsonb`);
    values.push(JSON.stringify(patch.notifications));
  }
  if (!payload.length) return loadCabinet(userId);
  values.push(userId);
  await query(
    `UPDATE public.users SET ${payload.join(', ')}, updated_at = timezone('utc', now()) WHERE id = $${idx}`,
    values
  );
  return loadCabinet(userId);
};

export const updatePassword = async (userId, email, currentPassword, nextPassword) => {
  const { rows } = await query(`SELECT password_hash FROM public.users WHERE id = $1 LIMIT 1`, [userId]);
  const hash = rows[0]?.password_hash;
  if (!hash) throw new Error('NOT_FOUND');
  const { rows: validRows } = await query(`SELECT (crypt($1, $2) = $2) AS ok`, [currentPassword, hash]);
  if (!validRows[0]?.ok) throw new Error('INVALID_PASSWORD');
  await query(
    `UPDATE public.users SET password_hash = crypt($1, gen_salt('bf')), updated_at = timezone('utc', now()) WHERE id = $2`,
    [nextPassword, userId]
  );
};

export const deleteAccount = async (userId) => {
  await query(`SELECT public.soft_delete_own_account($1)`, [userId]);
};

export const claimBonus = async (userId, actionKey) => {
  const { rows } = await query(`SELECT public.claim_bonus_action($1, $2) AS result`, [actionKey, userId]);
  const user = await loadCabinet(userId);
  return { already: Boolean(rows[0]?.result?.already), user };
};
