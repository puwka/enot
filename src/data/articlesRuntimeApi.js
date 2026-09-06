import { apiFetch } from '../lib/apiClient';
import articleCredits from '../img_main/article-credits.png';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const mapArticleItem = (row) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  category: row.category || 'Статьи',
  date: formatDate(row.dateISO || row.publishedAt || row.createdAt),
  dateISO: row.dateISO ? String(row.dateISO).slice(0, 10) : '',
  readTime: row.readTime || row.read_time || '5 мин',
  cover: row.cover || row.cover_url || articleCredits,
  excerpt: row.excerpt || '',
  author: row.author || '',
  blocks: Array.isArray(row.blocks) ? row.blocks : Array.isArray(row.content_blocks) ? row.content_blocks : [],
  toc: Array.isArray(row.toc) ? row.toc : [],
  source: 'cms',
});

export const mergeArticleItems = (staticItems = [], cmsItems = []) => {
  const bySlug = new Map(staticItems.map((item) => [item.slug, { ...item, source: 'site' }]));
  cmsItems.forEach((item) => {
    bySlug.set(item.slug, item);
  });
  return Array.from(bySlug.values()).sort((a, b) => {
    const aTime = new Date(a.dateISO || 0).getTime();
    const bTime = new Date(b.dateISO || 0).getTime();
    return bTime - aTime;
  });
};

export const fetchArticlesList = async () => {
  try {
    const payload = await apiFetch('/catalog/articles');
    return (payload.items || []).map(mapArticleItem);
  } catch {
    return [];
  }
};

export const fetchArticleBySlug = async (slug) => {
  try {
    const payload = await apiFetch(`/catalog/articles/${encodeURIComponent(slug)}`);
    return payload.item ? mapArticleItem(payload.item) : null;
  } catch {
    return null;
  }
};

export const fetchFaqItems = async () => {
  try {
    const payload = await apiFetch('/catalog/faq');
    return payload.items || [];
  } catch {
    return [];
  }
};
