import { BONUS_CONFIG } from '../config/bonuses';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const requireClient = () => {
  if (!isSupabaseConfigured || !supabase) {
    const error = new Error('SUPABASE_NOT_CONFIGURED');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }
  return supabase;
};

const mapHistory = (rows = []) =>
  rows.map((row) => ({
    id: row.id,
    title: row.title,
    points: row.points,
    status: row.status === 'credited' ? 'Начислено' : row.status,
    dateISO: row.created_at,
    actionId: row.meta?.action_key || null,
  }));

const mapUser = (profile, history = [], referralIds = []) => {
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

const loadCabinet = async (userId) => {
  const client = requireClient();
  const { data: profile, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!profile) return null;

  const [{ data: history }, { data: referrals }] = await Promise.all([
    client
      .from('bonus_transactions')
      .select('id, title, points, status, created_at, meta')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    client.from('referrals').select('invitee_id').eq('referrer_id', userId).is('deleted_at', null),
  ]);

  return mapUser(
    profile,
    history || [],
    (referrals || []).map((item) => item.invitee_id)
  );
};

export const getCurrentSessionUser = async () => {
  const client = requireClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  const session = data.session;
  if (!session?.user) return null;
  return loadCabinet(session.user.id);
};

export const subscribeAuthSession = (callback) => {
  if (!isSupabaseConfigured || !supabase) {
    callback(null);
    return () => {};
  }
  const { data } = supabase.auth.onAuthStateChange(async () => {
    try {
      const user = await getCurrentSessionUser();
      callback(user);
    } catch {
      callback(null);
    }
  });
  return () => data.subscription.unsubscribe();
};

export const registerWithSupabase = async ({ name, email, phone, password, referralCode }) => {
  const client = requireClient();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const { data, error } = await client.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        name: String(name || '').trim(),
        phone: String(phone || '').trim(),
        referral_code: String(referralCode || '').trim().toUpperCase(),
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) {
    if (/already registered|already been registered|User already registered/i.test(error.message)) {
      const err = new Error('EMAIL_EXISTS');
      err.code = 'EMAIL_EXISTS';
      throw err;
    }
    throw error;
  }

  if (!data.session) {
    const err = new Error('EMAIL_CONFIRM_REQUIRED');
    err.code = 'EMAIL_CONFIRM_REQUIRED';
    throw err;
  }

  await client.rpc('claim_bonus_action', { p_action_key: BONUS_CONFIG.actions.dailyLogin.id });
  return loadCabinet(data.user.id);
};

export const loginWithSupabase = async (loginValue, password) => {
  const client = requireClient();
  const value = String(loginValue || '').trim();
  let email = value.toLowerCase();

  if (!value.includes('@')) {
    const err = new Error('EMAIL_REQUIRED');
    err.code = 'EMAIL_REQUIRED';
    throw err;
  }

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const err = new Error('INVALID_CREDENTIALS');
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }

  await client.rpc('claim_bonus_action', { p_action_key: BONUS_CONFIG.actions.dailyLogin.id });
  return loadCabinet(data.user.id);
};

export const logoutFromSupabase = async () => {
  const client = requireClient();
  await client.auth.signOut();
};

export const updateSupabaseProfile = async (patch) => {
  const client = requireClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new Error('NOT_FOUND');

  const payload = {};
  if (patch.name !== undefined) payload.name = String(patch.name).trim();
  if (patch.phone !== undefined) payload.phone = String(patch.phone).trim();
  if (patch.notifications !== undefined) payload.notifications = patch.notifications;

  const { error } = await client.from('users').update(payload).eq('id', user.id);
  if (error) throw error;
  return loadCabinet(user.id);
};

export const updateSupabasePassword = async (currentPassword, nextPassword) => {
  const client = requireClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user?.email) throw new Error('NOT_FOUND');

  const { error: reauthError } = await client.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (reauthError) throw new Error('INVALID_PASSWORD');

  const { error } = await client.auth.updateUser({ password: nextPassword });
  if (error) throw error;
};

export const recoverSupabasePassword = async (email) => {
  const client = requireClient();
  const { error } = await client.auth.resetPasswordForEmail(String(email || '').trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
};

export const removeSupabaseAccount = async () => {
  const client = requireClient();
  const { error } = await client.rpc('soft_delete_own_account');
  if (error) throw error;
  await client.auth.signOut();
};

export const claimSupabaseBonus = async (action) => {
  const client = requireClient();
  const { data, error } = await client.rpc('claim_bonus_action', {
    p_action_key: action.id,
  });
  if (error) throw error;
  const user = await getCurrentSessionUser();
  return { already: Boolean(data?.already), user };
};
