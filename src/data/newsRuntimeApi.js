import { apiFetch } from '../lib/apiClient';
import articleCredits from '../img_main/article-credits.png';

const CACHE_TTL_MS = 5 * 60 * 1000;

let listCache = null;
let listInflight = null;
const itemCache = new Map();
const itemInflight = new Map();

const isFresh = (entry) => entry && Date.now() - entry.at < CACHE_TTL_MS;

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

export const mapNewsItem = (row) => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  category: row.category || 'Новости',
  date: formatDate(row.dateISO || row.publishedAt || row.createdAt),
  dateISO: row.dateISO ? String(row.dateISO).slice(0, 10) : '',
  readTime: row.readTime || row.read_time || '5 мин',
  cover: row.cover || row.cover_url || articleCredits,
  lead: row.lead || row.excerpt || '',
  excerpt: row.excerpt || row.lead || '',
  author: row.author || '',
  facts: Array.isArray(row.facts) ? row.facts : [],
  blocks: Array.isArray(row.blocks) ? row.blocks : Array.isArray(row.content_blocks) ? row.content_blocks : [],
  toc: Array.isArray(row.toc) ? row.toc : [],
  cta:
    row.cta && typeof row.cta === 'object' && Object.keys(row.cta).length
      ? row.cta
      : {
          to: '/loans',
          label: 'К кредитам',
          text: 'Сравните актуальные предложения банков в каталоге ЕнотМани.',
        },
  source: 'cms',
});

export const mergeNewsItems = (staticItems = [], cmsItems = []) => {
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

export const fetchNewsList = async () => {
  if (isFresh(listCache)) return listCache.data;

  if (listInflight) return listInflight;

  listInflight = apiFetch('/catalog/news')
    .then((payload) => {
      const result = (payload.items || []).map(mapNewsItem);
      listCache = { at: Date.now(), data: result };
      return result;
    })
    .catch(() => [])
    .finally(() => {
      listInflight = null;
    });

  return listInflight;
};

export const fetchNewsBySlug = async (slug) => {
  const cached = itemCache.get(slug);
  if (isFresh(cached)) return cached.data;

  if (itemInflight.has(slug)) {
    return itemInflight.get(slug);
  }

  const promise = apiFetch(`/catalog/news/${encodeURIComponent(slug)}`)
    .then((payload) => {
      const result = payload.item ? mapNewsItem(payload.item) : null;
      itemCache.set(slug, { at: Date.now(), data: result });
      return result;
    })
    .catch(() => null)
    .finally(() => {
      itemInflight.delete(slug);
    });

  itemInflight.set(slug, promise);
  return promise;
};

export const fetchRelatedNews = async (slug, limit = 3) => {
  try {
    const payload = await apiFetch(`/catalog/news/${encodeURIComponent(slug)}`);
    return (payload.related || []).slice(0, limit).map(mapNewsItem);
  } catch {
    return [];
  }
};
