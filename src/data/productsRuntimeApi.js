import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { resolveProductImage } from './productImages';

const CACHE_TTL_MS = 5 * 60 * 1000;

const catalogCache = new Map();
const catalogInflight = new Map();
const offerCache = new Map();
const offerInflight = new Map();
const calculatorCache = new Map();
const calculatorInflight = new Map();
const categoryIdCache = new Map();
const categoryIdInflight = new Map();

const isFresh = (entry) => entry && Date.now() - entry.at < CACHE_TTL_MS;

const fmtCurrency = (value) => {
  if (value == null || value === '') return '';
  return Number(value).toLocaleString('ru-RU');
};

const mapProduct = (row) => {
  const amount =
    row.amount_min != null || row.amount_max != null
      ? `${row.amount_min != null ? `${fmtCurrency(row.amount_min)} ₽` : '—'} - ${row.amount_max != null ? `${fmtCurrency(row.amount_max)} ₽` : '—'}`
      : row.amount_label || '';
  const term =
    row.term_min != null || row.term_max != null
      ? `${row.term_min ?? '—'} - ${row.term_max ?? '—'} мес.`
      : row.term_label || '';
  const advantages = Array.isArray(row.advantages) ? row.advantages : [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    bank: row.bank?.name || row.title,
    image: resolveProductImage({
      slug: row.slug,
      link: row.link || row.partner_url,
      logoUrl: row.logo_url,
      bankLogoUrl: row.bank?.logo_url,
    }),
    rate: row.apr_rate != null ? `${row.apr_rate}%` : row.rate_label || '',
    sum: amount,
    term,
    payment: row.monthly_payment != null ? `${fmtCurrency(row.monthly_payment)} ₽` : '',
    link: row.link || row.partner_url || '',
    benefit1: advantages[0] || row.benefit_1 || '',
    benefit2: advantages[1] || row.benefit_2 || '',
    benefit3: advantages[2] || row.benefit_3 || '',
    spec: row.product_type || row.spec || '',
    catalogPath: row.category?.path || '/loans',
    catalogLabel: row.category?.title || 'Продукты',
    variant: row.category?.variant || 'loan',
    ctaLabel: row.category?.cta_label || 'Подробнее',
    categoryId: row.category_id,
  };
};

const catalogSelect = `
  id, slug, title, product_type, apr_rate, amount_min, amount_max, term_min, term_max,
  monthly_payment, logo_url, link, partner_url, rate_label, term_label, amount_label,
  benefit_1, benefit_2, benefit_3, spec, sort_order, category_id,
  bank:banks(name,logo_url),
  category:categories(path,title,variant,cta_label)
`;

const offerSelect = `
  id, slug, title, product_type, apr_rate, amount_min, amount_max, term_min, term_max,
  monthly_payment, commission, description, conditions, advantages, logo_url, link,
  partner_url, rate_label, term_label, amount_label, benefit_1, benefit_2, benefit_3,
  spec, sort_order, category_id,
  bank:banks(id,name,logo_url),
  category:categories(id,slug,title,path,variant,cta_label)
`;

const getProductCategoryId = async (categorySlug) => {
  const cached = categoryIdCache.get(categorySlug);
  if (cached) return cached;

  if (categoryIdInflight.has(categorySlug)) {
    return categoryIdInflight.get(categorySlug);
  }

  const promise = (async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('type', 'product')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (error) throw error;
    const id = data?.id || null;
    if (id) categoryIdCache.set(categorySlug, id);
    return id;
  })().finally(() => {
    categoryIdInflight.delete(categorySlug);
  });

  categoryIdInflight.set(categorySlug, promise);
  return promise;
};

export const fetchCatalogProducts = async (categorySlug) => {
  if (!isSupabaseConfigured || !supabase) return [];

  const cached = catalogCache.get(categorySlug);
  if (isFresh(cached)) return cached.data;

  if (catalogInflight.has(categorySlug)) {
    return catalogInflight.get(categorySlug);
  }

  const promise = (async () => {
    const categoryId = await getProductCategoryId(categorySlug);
    if (!categoryId) return [];

    const { data, error } = await supabase
      .from('financial_products')
      .select(catalogSelect)
      .eq('category_id', categoryId)
      .eq('status', 'published')
      .eq('active', true)
      .is('deleted_at', null)
      .order('sort_order', { ascending: true });
    if (error) throw error;

    const result = (data || []).map(mapProduct);
    catalogCache.set(categorySlug, { at: Date.now(), data: result });
    return result;
  })().finally(() => {
    catalogInflight.delete(categorySlug);
  });

  catalogInflight.set(categorySlug, promise);
  return promise;
};

export const fetchOfferBySlug = async (slug) => {
  if (!isSupabaseConfigured || !supabase) return null;

  const cached = offerCache.get(slug);
  if (isFresh(cached)) return cached.data;

  if (offerInflight.has(slug)) {
    return offerInflight.get(slug);
  }

  const promise = (async () => {
    const { data, error } = await supabase
      .from('financial_products')
      .select(offerSelect)
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('active', true)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    const result = data ? mapProduct(data) : null;
    offerCache.set(slug, { at: Date.now(), data: result });
    return result;
  })().finally(() => {
    offerInflight.delete(slug);
  });

  offerInflight.set(slug, promise);
  return promise;
};

export const fetchRelatedOffers = async (categoryId, excludeSlug, limit = 4) => {
  if (!isSupabaseConfigured || !supabase || !categoryId) return [];
  const { data, error } = await supabase
    .from('financial_products')
    .select(catalogSelect)
    .eq('status', 'published')
    .eq('active', true)
    .eq('category_id', categoryId)
    .neq('slug', excludeSlug)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data || []).map(mapProduct);
};

export const fetchRelatedOffersByCategory = async (categorySlug, excludeSlug, limit = 4) => {
  const rows = await fetchCatalogProducts(categorySlug);
  return rows.filter((item) => item.slug !== excludeSlug).slice(0, limit);
};

export const fetchCalculatorConfig = async (key = 'loan') => {
  if (!isSupabaseConfigured || !supabase) return null;

  const cached = calculatorCache.get(key);
  if (isFresh(cached)) return cached.data;

  if (calculatorInflight.has(key)) {
    return calculatorInflight.get(key);
  }

  const promise = (async () => {
    const { data, error } = await supabase
      .from('calculator_configs')
      .select('key,min_amount,max_amount,min_term,max_term,rate,default_amount,default_term,default_purpose,purposes,status')
      .eq('key', key)
      .eq('status', 'published')
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    const result = data || null;
    calculatorCache.set(key, { at: Date.now(), data: result });
    return result;
  })().finally(() => {
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
