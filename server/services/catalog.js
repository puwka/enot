import { query } from '../db.js';

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
  const advantages = Array.isArray(row.advantages) ? row.advantages : row.advantages ? row.advantages : [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    bank: row.bank_name || row.title,
    image: row.logo_url || row.bank_logo_url || '',
    rate: row.apr_rate != null ? `${row.apr_rate}%` : row.rate_label || '',
    sum: amount,
    term,
    payment: row.monthly_payment != null ? `${fmtCurrency(row.monthly_payment)} ₽` : '',
    link: row.link || row.partner_url || '',
    benefit1: advantages[0] || row.benefit_1 || '',
    benefit2: advantages[1] || row.benefit_2 || '',
    benefit3: advantages[2] || row.benefit_3 || '',
    spec: row.product_type || row.spec || '',
    catalogPath: row.category_path || '/loans',
    catalogLabel: row.category_title || 'Продукты',
    variant: row.category_variant || 'loan',
    ctaLabel: row.category_cta_label || 'Подробнее',
    categoryId: row.category_id,
    description: row.description || '',
    conditions: row.conditions || '',
    advantages,
    commission: row.commission,
    bankId: row.bank_id,
  };
};

const productSelect = `
  SELECT
    fp.*,
    b.name AS bank_name,
    b.logo_url AS bank_logo_url,
    c.path AS category_path,
    c.title AS category_title,
    c.variant AS category_variant,
    c.cta_label AS category_cta_label
  FROM public.financial_products fp
  LEFT JOIN public.banks b ON b.id = fp.bank_id
  LEFT JOIN public.categories c ON c.id = fp.category_id
`;

export const getCategoryId = async (categorySlug) => {
  const { rows } = await query(
    `SELECT id FROM public.categories WHERE type = 'product' AND slug = $1 LIMIT 1`,
    [categorySlug]
  );
  return rows[0]?.id || null;
};

export const fetchCatalogProducts = async (categorySlug) => {
  const categoryId = await getCategoryId(categorySlug);
  if (!categoryId) return [];
  const { rows } = await query(
    `${productSelect}
     WHERE fp.category_id = $1
       AND fp.status = 'published'
       AND fp.active = true
       AND fp.deleted_at IS NULL
     ORDER BY fp.sort_order ASC`,
    [categoryId]
  );
  return rows.map(mapProduct);
};

export const fetchOfferBySlug = async (slug) => {
  const { rows } = await query(
    `${productSelect}
     WHERE fp.slug = $1
       AND fp.status = 'published'
       AND fp.active = true
       AND fp.deleted_at IS NULL
     LIMIT 1`,
    [slug]
  );
  return rows[0] ? mapProduct(rows[0]) : null;
};

export const fetchRelatedOffers = async (categoryId, excludeSlug, limit = 4) => {
  const { rows } = await query(
    `${productSelect}
     WHERE fp.category_id = $1
       AND fp.status = 'published'
       AND fp.active = true
       AND fp.slug <> $2
       AND fp.deleted_at IS NULL
     ORDER BY fp.sort_order ASC
     LIMIT $3`,
    [categoryId, excludeSlug, limit]
  );
  return rows.map(mapProduct);
};

export const fetchCalculatorConfig = async (key = 'loan') => {
  const { rows } = await query(
    `SELECT key, min_amount, max_amount, min_term, max_term, rate, default_amount, default_term, default_purpose, purposes, status
     FROM public.calculator_configs
     WHERE key = $1 AND status = 'published' AND deleted_at IS NULL
     LIMIT 1`,
    [key]
  );
  return rows[0] || null;
};
