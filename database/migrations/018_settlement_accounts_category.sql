INSERT INTO public.categories (type, slug, title, path, variant, cta_label, status, sort_order)
VALUES
  ('product', 'settlement-accounts', 'Расчётные счета', '/settlement-accounts', 'debit', 'Открыть счёт', 'published', 55)
ON CONFLICT (type, slug) DO UPDATE SET
  title = EXCLUDED.title,
  path = EXCLUDED.path,
  variant = EXCLUDED.variant,
  cta_label = EXCLUDED.cta_label,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order;
