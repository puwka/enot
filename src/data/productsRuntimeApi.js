import { apiFetch } from '../lib/apiClient';
import { resolveProductImage } from './productImages';

const CACHE_TTL_MS = 5 * 60 * 1000;

const catalogCache = new Map();
const catalogInflight = new Map();
const offerCache = new Map();
const offerInflight = new Map();
const calculatorCache = new Map();
const calculatorInflight = new Map();

const isFresh = (entry) => entry && Date.now() - entry.at < CACHE_TTL_MS;

const mapProduct = (row) => {
  const amount = row.sum || '';
  const term = row.term || '';
  const advantages = Array.isArray(row.advantages) ? row.advantages : [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    bank: row.bank || row.title,
    image: resolveProductImage({
      slug: row.slug,
      link: row.link,
      logoUrl: row.image,
      bankLogoUrl: row.image,
    }),
    rate: row.rate || '',
    sum: amount,
    term,
    payment: row.payment || '',
    link: row.link || '',
    benefit1: row.benefit1 || advantages[0] || '',
    benefit2: row.benefit2 || advantages[1] || '',
    benefit3: row.benefit3 || advantages[2] || '',
    spec: row.spec || '',
    catalogPath: row.catalogPath || '/loans',
    catalogLabel: row.catalogLabel || 'Продукты',
    variant: row.variant || 'loan',
    ctaLabel: row.ctaLabel || 'Подробнее',
    categoryId: row.categoryId,
    description: row.description || '',
    conditions: row.conditions || '',
    advantages,
    commission: row.commission,
  };
};

export const fetchCatalogProducts = async (categorySlug) => {
  const cached = catalogCache.get(categorySlug);
  if (isFresh(cached)) return cached.data;

  if (catalogInflight.has(categorySlug)) {
    return catalogInflight.get(categorySlug);
  }

  const promise = apiFetch(`/catalog/products?category=${encodeURIComponent(categorySlug)}`)
    .then((payload) => {
      const result = (payload.items || []).map(mapProduct);
      catalogCache.set(categorySlug, { at: Date.now(), data: result });
      return result;
    })
    .catch(() => [])
    .finally(() => {
      catalogInflight.delete(categorySlug);
    });

  catalogInflight.set(categorySlug, promise);
  return promise;
};

export const fetchOfferBySlug = async (slug) => {
  const cached = offerCache.get(slug);
  if (isFresh(cached)) return cached.data;

  if (offerInflight.has(slug)) {
    return offerInflight.get(slug);
  }

  const promise = apiFetch(`/catalog/products/${encodeURIComponent(slug)}`)
    .then((payload) => {
      const result = payload.item ? mapProduct(payload.item) : null;
      offerCache.set(slug, { at: Date.now(), data: result });
      return result;
    })
    .catch(() => null)
    .finally(() => {
      offerInflight.delete(slug);
    });

  offerInflight.set(slug, promise);
  return promise;
};

export const fetchRelatedOffersByCategory = async (categorySlug, excludeSlug, limit = 4) => {
  const rows = await fetchCatalogProducts(categorySlug);
  return rows.filter((item) => item.slug !== excludeSlug).slice(0, limit);
};

export const fetchCalculatorConfig = async (key = 'loan') => {
  const cached = calculatorCache.get(key);
  if (isFresh(cached)) return cached.data;

  if (calculatorInflight.has(key)) {
    return calculatorInflight.get(key);
  }

  const promise = apiFetch(`/catalog/calculator/${encodeURIComponent(key)}`)
    .then((payload) => {
      const result = payload.config || null;
      calculatorCache.set(key, { at: Date.now(), data: result });
      return result;
    })
    .catch(() => null)
    .finally(() => {
      calculatorInflight.delete(key);
    });

  calculatorInflight.set(key, promise);
  return promise;
};

export const CATALOG_PATH_TO_CATEGORY_SLUG = {
  '/loans': 'loans',
  '/cards': 'debit-cards',
  '/auto-loans': 'credit-cards',
  '/consumer-loans': 'consumer-loans',
  '/collateral-loans': 'collateral-loans',
};
