/** Tabs/categories that should NOT show external "Оформить" CTA */
const INFO_ONLY = new Set(['education', 'services', 'shops', 'obuchenie']);

export const isInfoOnlyCategory = (keyOrPath = '') => {
  const value = String(keyOrPath || '').toLowerCase();
  if (INFO_ONLY.has(value)) return true;
  return ['/obuchenie', '/education', '/services', '/shops'].some((path) => value.includes(path.replace('/', '')));
};

export const getApplyLabel = (tabKeyOrPath = '') => {
  const value = String(tabKeyOrPath || '').toLowerCase();
  if (value === 'jobs' || value.includes('/job')) return 'Оставить отклик';
  if (isInfoOnlyCategory(value)) return null;
  if (value.includes('card') || value.includes('debit') || value.includes('credit') || value === 'cards') {
    return 'Оформить';
  }
  return 'Оформить';
};

export const trackApplyClick = async (payload = {}) => {
  try {
    const base = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');
    await fetch(`${base}/site/clicks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    /* ignore tracking errors */
  }
};
