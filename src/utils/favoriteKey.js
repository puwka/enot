const STORAGE_KEY = 'enotmani-favorites-v2';
const LEGACY_STORAGE_KEY = 'enotmani-favorites';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const getFavoriteKey = (itemOrKey) => {
  if (!itemOrKey) return '';
  if (typeof itemOrKey === 'string') return itemOrKey.trim();
  // Prefer stable snapshot key first (localStorage round-trip)
  if (itemOrKey.key) return String(itemOrKey.key).trim();
  if (itemOrKey.slug) return String(itemOrKey.slug).trim();
  if (itemOrKey.id) return String(itemOrKey.id).trim();
  if (itemOrKey.link) return String(itemOrKey.link).trim();
  return '';
};

export const toFavoriteSnapshot = (itemOrKey) => {
  if (!itemOrKey) return null;
  if (typeof itemOrKey === 'string') {
    const key = itemOrKey.trim();
    if (!key) return null;
    return {
      key,
      slug: UUID_RE.test(key) ? '' : key,
      id: UUID_RE.test(key) ? key : key,
      title: key,
      image: '',
      link: key.startsWith('http') ? key : '',
      catalogPath: '/loans',
      catalogLabel: 'Продукты',
      rate: '',
      benefit1: '',
      spec: '',
      sum: '',
      term: '',
    };
  }

  const key = getFavoriteKey(itemOrKey);
  if (!key) return null;

  return {
    key,
    slug: itemOrKey.slug || (UUID_RE.test(key) ? '' : key),
    id: itemOrKey.id || key,
    title: itemOrKey.title || itemOrKey.bank || itemOrKey.name || key,
    image: itemOrKey.image || itemOrKey.logo_url || '',
    link: itemOrKey.link || itemOrKey.partner_url || '',
    catalogPath: itemOrKey.catalogPath || itemOrKey.catalog_path || '/loans',
    catalogLabel: itemOrKey.catalogLabel || itemOrKey.catalog_label || 'Продукты',
    rate: itemOrKey.rate || '',
    benefit1: itemOrKey.benefit1 || '',
    spec: itemOrKey.spec || itemOrKey.product_type || '',
    sum: itemOrKey.sum || '',
    term: itemOrKey.term || '',
  };
};

const readLegacyKeys = () => {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => (typeof entry === 'string' ? toFavoriteSnapshot(entry) : toFavoriteSnapshot(entry)))
      .filter(Boolean);
  } catch {
    return [];
  }
};

export const readFavoriteSnapshots = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((entry) => toFavoriteSnapshot(entry))
          .filter(Boolean)
          .filter((item, index, list) => list.findIndex((x) => x.key === item.key) === index);
      }
    }
  } catch {
    // fall through to legacy
  }

  const legacy = readLegacyKeys();
  if (legacy.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
  }
  return legacy;
};

export const writeFavoriteSnapshots = (items) => {
  const next = (items || [])
    .map((entry) => toFavoriteSnapshot(entry))
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex((x) => x.key === item.key) === index);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  // keep legacy keys in sync for old code paths
  localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(next.map((item) => item.key)));
  return next;
};

export { STORAGE_KEY, LEGACY_STORAGE_KEY };
