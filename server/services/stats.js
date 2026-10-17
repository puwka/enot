import { query } from '../db.js';

export const trackProductClick = async ({
  productId = null,
  productSlug = '',
  bankName = '',
  categorySlug = '',
  source = 'site',
} = {}) => {
  const { rows } = await query(
    `INSERT INTO public.product_clicks (product_id, product_slug, bank_name, category_slug, source)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, created_at`,
    [
      productId || null,
      productSlug || null,
      bankName || null,
      categorySlug || null,
      source || 'site',
    ]
  );
  return rows[0];
};

export const getCatalogStats = async () => {
  const { rows } = await query(
    `SELECT c.slug, c.title,
            COUNT(fp.id)::int AS total,
            COUNT(fp.id) FILTER (WHERE fp.featured = true)::int AS featured
     FROM public.categories c
     LEFT JOIN public.financial_products fp
       ON fp.category_id = c.id
      AND fp.deleted_at IS NULL
      AND fp.status = 'published'
      AND fp.active = true
     WHERE c.type = 'product' AND c.deleted_at IS NULL
     GROUP BY c.id, c.slug, c.title, c.sort_order
     ORDER BY c.sort_order ASC`
  );
  return rows;
};

export const getClickStats = async (days = 30) => {
  const { rows: byBank } = await query(
    `SELECT coalesce(nullif(bank_name, ''), 'Без банка') AS label,
            COUNT(*)::int AS clicks
     FROM public.product_clicks
     WHERE created_at >= timezone('utc', now()) - ($1 || ' days')::interval
     GROUP BY 1
     ORDER BY clicks DESC
     LIMIT 12`,
    [String(days)]
  );
  const { rows: byCategory } = await query(
    `SELECT coalesce(nullif(category_slug, ''), 'other') AS label,
            COUNT(*)::int AS clicks
     FROM public.product_clicks
     WHERE created_at >= timezone('utc', now()) - ($1 || ' days')::interval
     GROUP BY 1
     ORDER BY clicks DESC
     LIMIT 12`,
    [String(days)]
  );
  const { rows: totals } = await query(
    `SELECT COUNT(*)::int AS total_clicks,
            COUNT(*) FILTER (WHERE created_at >= timezone('utc', now()) - interval '1 day')::int AS clicks_today,
            COUNT(*) FILTER (WHERE created_at >= timezone('utc', now()) - interval '7 day')::int AS clicks_week
     FROM public.product_clicks`
  );
  return {
    days,
    totals: totals[0] || { total_clicks: 0, clicks_today: 0, clicks_week: 0 },
    byBank,
    byCategory,
  };
};

export const getAuditLogs = async ({ limit = 100, offset = 0 } = {}) => {
  const { rows } = await query(
    `SELECT al.id, al.action, al.entity_type, al.entity_id, al.after_data, al.created_at,
            coalesce(u.name, u.email, 'Админ') AS actor
     FROM public.audit_logs al
     LEFT JOIN public.users u ON u.id = coalesce(al.admin_actor_id, al.actor_id)
     ORDER BY al.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    entity: row.entity_type,
    entityId: row.entity_id,
    actor: row.actor,
    at: row.created_at,
    meta: row.after_data?.title || row.after_data?.slug || row.after_data?.key || '',
  }));
};
