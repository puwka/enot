-- Ensure click tracking exists (safe if 020 already ran)
CREATE TABLE IF NOT EXISTS public.product_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.financial_products (id) ON DELETE SET NULL,
  product_slug text,
  bank_name text,
  category_slug text,
  source text NOT NULL DEFAULT 'site',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS product_clicks_created_idx ON public.product_clicks (created_at DESC);
CREATE INDEX IF NOT EXISTS product_clicks_product_idx ON public.product_clicks (product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS product_clicks_category_idx ON public.product_clicks (category_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS product_clicks_bank_idx ON public.product_clicks (bank_name, created_at DESC);

ALTER TABLE public.product_clicks DISABLE ROW LEVEL SECURITY;

INSERT INTO public.site_settings (key, value, status)
VALUES
  (
    'seo',
    jsonb_build_object(
      'title', 'ЕнотМани — сравнение финансовых продуктов',
      'description', 'Сравнение кредитов, микрозаймов, дебетовых и кредитных карт.',
      'keywords', 'кредиты, займы, карты, сравнение'
    ),
    'published'
  ),
  (
    'analytics',
    jsonb_build_object(
      'yandex_metrika_id', '108751085',
      'google_analytics_id', '',
      'custom_head_html', ''
    ),
    'published'
  ),
  (
    'app',
    jsonb_build_object(
      'version', '1.1.0',
      'product_name', 'ЕнотМани CMS',
      'update_channel', 'manual',
      'update_notes', 'Обновления: git pull → npm ci → build → db:migrate → restart.'
    ),
    'published'
  )
ON CONFLICT (key) DO NOTHING;

-- ADMIN must be able to save site settings / view audit / upload media
CREATE OR REPLACE FUNCTION public.admin_authorize(p_token text, p_permission text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  payload jsonb;
  role_name text;
  allowed boolean := false;
BEGIN
  payload := public.admin_session(p_token);
  role_name := payload -> 'admin' ->> 'role';

  IF role_name = 'SUPERADMIN' THEN
    allowed := true;
  ELSIF role_name = 'ADMIN' THEN
    allowed := p_permission IS NULL OR p_permission = ANY (
      ARRAY[
        'content', 'news', 'articles', 'categories', 'faq', 'products',
        'settings', 'system', 'media', 'users', 'bonuses'
      ]
    );
  ELSIF role_name = 'EDITOR' THEN
    allowed := p_permission IS NULL OR p_permission = ANY (
      ARRAY['news', 'articles', 'categories', 'faq', 'media']
    );
  END IF;

  IF NOT allowed THEN
    RAISE EXCEPTION 'FORBIDDEN' USING ERRCODE = '42501';
  END IF;

  RETURN jsonb_build_object('ok', true, 'admin', payload -> 'admin');
END;
$$;
