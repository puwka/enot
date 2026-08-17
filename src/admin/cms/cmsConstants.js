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

export const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const statusLabel = (status) => {
  const found = CONTENT_STATUSES.find((item) => item.value === status);
  return found ? found.label : String(status || '').toUpperCase();
};
