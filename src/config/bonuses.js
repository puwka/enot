export const BONUS_CONFIG = {
  pointsToRubleRate: 0.1,
  nextLevelStep: 2000,
  actions: {
    dailyLogin: { id: 'daily-login', title: 'Вход в аккаунт', points: 10 },
    inviteFriend: { id: 'invite-friend', title: 'Пригласить друга', points: 100 },
    socialShare: { id: 'social-share', title: 'Поделиться в соцсетях', points: 50 },
    readMaterial: { id: 'read-material', title: 'Изучить материал', points: 20 },
    completeProfile: { id: 'complete-profile', title: 'Заполнить профиль', points: 30 },
  },
};

export const formatPoints = (value) =>
  new Intl.NumberFormat('ru-RU').format(Math.max(0, Math.round(Number(value) || 0)));

export const pointsToRubles = (points, rate = BONUS_CONFIG.pointsToRubleRate) =>
  Math.round((Number(points) || 0) * rate);
