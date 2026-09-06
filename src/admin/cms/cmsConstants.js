export const CONTENT_STATUSES = [
  { value: 'draft', label: 'DRAFT' },
  { value: 'published', label: 'PUBLISHED' },
  { value: 'archived', label: 'ARCHIVED' },
];

export const PAGE_BLOCK_TYPES = [
  { value: 'hero', label: 'Hero' },
  { value: 'text', label: 'Текст' },
  { value: 'image', label: 'Изображение' },
  { value: 'cards', label: 'Карточки' },
  { value: 'cta', label: 'CTA' },
  { value: 'faq', label: 'FAQ' },
  { value: 'table', label: 'Таблица' },
  { value: 'warning', label: 'Предупреждение' },
  { value: 'list', label: 'Список' },
];

export const ARTICLE_BLOCK_TYPES = [
  { value: 'p', label: 'Абзац' },
  { value: 'h2', label: 'Подзаголовок H2' },
  { value: 'h3', label: 'Подзаголовок H3' },
  { value: 'ul', label: 'Маркированный список' },
  { value: 'ol', label: 'Нумерованный список' },
  { value: 'image', label: 'Изображение' },
  { value: 'quote', label: 'Цитата' },
  { value: 'warning', label: 'Предупреждение' },
];

const CYR_TO_LAT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/** Latin slug for URLs; Cyrillic is transliterated so saves don't break on short/cyrillic-only values. */
export const slugify = (value = '') => {
  const raw = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е');
  let out = '';
  for (const ch of raw) {
    if (CYR_TO_LAT[ch] !== undefined) out += CYR_TO_LAT[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else out += '-';
  }
  return out
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
};

export const ensureProductSlug = (slug, title) => {
  let next = slugify(slug) || slugify(title);
  if (!next || next.length < 2) {
    next = `product-${Date.now().toString(36)}`;
  }
  return next;
};

export const statusLabel = (status) => {
  const found = CONTENT_STATUSES.find((item) => item.value === status);
  return found ? found.label : String(status || '').toUpperCase();
};
