const USERS_KEY = 'enotmani-users';
const SESSION_KEY = 'enotmani-session';
const EVENT = 'enotmani-auth';

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const emit = () => window.dispatchEvent(new Event(EVENT));

export const hashPassword = async (password) => {
  const data = new TextEncoder().encode(String(password));
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const readUsers = () => safeParse(localStorage.getItem(USERS_KEY), []);

const writeUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  emit();
};

export const getSessionUserId = () => localStorage.getItem(SESSION_KEY) || null;

export const setSessionUserId = (userId) => {
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
  emit();
};

export const getUserById = (id) => readUsers().find((user) => user.id === id) || null;

export const getUserByEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  return readUsers().find((user) => user.email === normalized) || null;
};

export const getUserByLogin = (login) => {
  const value = String(login || '').trim();
  if (!value) return null;
  const byEmail = getUserByEmail(value);
  if (byEmail) return byEmail;
  const phone = value.replace(/[^\d+]/g, '');
  return (
    readUsers().find((user) => {
      const stored = String(user.phone || '').replace(/[^\d+]/g, '');
      return stored && (stored === phone || stored.endsWith(phone) || phone.endsWith(stored));
    }) || null
  );
};

export const createReferralCode = () =>
  `ENOT-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString(36).slice(-3).toUpperCase()}`;

export const createUserRecord = async ({ name, email, phone, password, referralCode }) => {
  const users = readUsers();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('EMAIL_EXISTS');
  }

  const referrer = referralCode
    ? users.find((user) => user.referralCode === String(referralCode).trim().toUpperCase())
    : null;

  const now = new Date().toISOString();
  const user = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(name || '').trim(),
    email: normalizedEmail,
    phone: String(phone || '').trim(),
    passwordHash: await hashPassword(password),
    avatar: '',
    notifications: { email: true, pushes: false },
    bonusBalance: 0,
    bonusHistory: [],
    completedActions: {},
    referralCode: createReferralCode(),
    referredBy: referrer ? referrer.id : null,
    referrals: [],
    loans: [],
    applications: { total: 0, approved: 0, rejected: 0 },
    createdAt: now,
    updatedAt: now,
    lastLoginDate: '',
  };

  users.push(user);
  writeUsers(users);

  if (referrer) {
    applyReferralReward(referrer.id, user.id);
  }

  return getUserById(user.id);
};

const updateUser = (userId, updater) => {
  const users = readUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index < 0) return null;
  const next = updater({ ...users[index] });
  next.updatedAt = new Date().toISOString();
  users[index] = next;
  writeUsers(users);
  return next;
};

export const authenticateUser = async (login, password) => {
  const user = getUserByLogin(login);
  if (!user) throw new Error('INVALID_CREDENTIALS');
  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) throw new Error('INVALID_CREDENTIALS');
  return user;
};

export const addBonusTransaction = (userId, { title, points, status = 'Начислено', actionId }) =>
  updateUser(userId, (user) => {
    const amount = Number(points) || 0;
    const entry = {
      id: `bonus-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title,
      points: amount,
      status,
      dateISO: new Date().toISOString(),
      actionId: actionId || null,
    };
    return {
      ...user,
      bonusBalance: Math.max(0, (user.bonusBalance || 0) + amount),
      bonusHistory: [entry, ...(user.bonusHistory || [])],
      completedActions: actionId
        ? { ...(user.completedActions || {}), [actionId]: entry.dateISO }
        : user.completedActions || {},
    };
  });

export const claimActionBonus = (userId, action) => {
  const user = getUserById(userId);
  if (!user || !action) return null;
  if (user.completedActions?.[action.id] && action.id !== 'daily-login') {
    return { already: true, user };
  }
  if (action.id === 'daily-login') {
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastLoginDate === today) return { already: true, user };
    const next = updateUser(userId, (current) => ({ ...current, lastLoginDate: today }));
    addBonusTransaction(next.id, {
      title: action.title,
      points: action.points,
      actionId: action.id,
    });
    return { already: false, user: getUserById(userId) };
  }
  const next = addBonusTransaction(userId, {
    title: action.title,
    points: action.points,
    actionId: action.id,
  });
  return { already: false, user: next };
};

const applyReferralReward = (referrerId, inviteeId) => {
  updateUser(referrerId, (user) => ({
    ...user,
    referrals: [...new Set([...(user.referrals || []), inviteeId])],
  }));
  addBonusTransaction(referrerId, {
    title: 'Приглашение друга',
    points: 100,
    actionId: `invite-${inviteeId}`,
  });
};

export const updateProfile = (userId, patch) =>
  updateUser(userId, (user) => ({
    ...user,
    name: patch.name !== undefined ? String(patch.name).trim() : user.name,
    phone: patch.phone !== undefined ? String(patch.phone).trim() : user.phone,
    avatar: patch.avatar !== undefined ? patch.avatar : user.avatar,
    notifications: patch.notifications
      ? { ...user.notifications, ...patch.notifications }
      : user.notifications,
  }));

export const changePassword = async (userId, currentPassword, nextPassword) => {
  const user = getUserById(userId);
  if (!user) throw new Error('NOT_FOUND');
  const currentHash = await hashPassword(currentPassword);
  if (currentHash !== user.passwordHash) throw new Error('INVALID_PASSWORD');
  const passwordHash = await hashPassword(nextPassword);
  return updateUser(userId, (current) => ({ ...current, passwordHash }));
};

export const resetPasswordByEmail = async (email, nextPassword) => {
  const user = getUserByEmail(email);
  if (!user) throw new Error('NOT_FOUND');
  const passwordHash = await hashPassword(nextPassword);
  return updateUser(user.id, (current) => ({ ...current, passwordHash }));
};

export const deleteAccount = (userId) => {
  const users = readUsers().filter((user) => user.id !== userId);
  writeUsers(users);
  if (getSessionUserId() === userId) setSessionUserId(null);
};

export const seedDemoCabinetData = (userId) =>
  updateUser(userId, (user) => {
    if ((user.loans || []).length || (user.applications?.total || 0) > 0) return user;
    return {
      ...user,
      applications: { total: 12, approved: 7, rejected: 5 },
      loans: [
        {
          id: 'loan-demo-1',
          bank: 'Альфа Банк',
          type: 'Потребительский кредит',
          sum: '500 000 ₽',
          rate: '11,9%',
          term: '36 месяцев',
          status: 'Оформлен',
        },
        {
          id: 'loan-demo-2',
          bank: 'Т-Банк',
          type: 'Кредитная карта',
          sum: '150 000 ₽',
          rate: 'До 62%',
          term: '5 лет',
          status: 'Активна',
        },
      ],
    };
  });

export const subscribeAuth = (callback) => {
  const handler = () => callback();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};
