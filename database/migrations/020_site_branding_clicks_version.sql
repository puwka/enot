-- Product click tracking for dashboard
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

-- App version / boxed product metadata
INSERT INTO public.site_settings (key, value, status)
VALUES
  (
    'brand',
    jsonb_build_object(
      'name', 'ЕнотМани',
      'logo_url', '',
      'mascot_url', '',
      'telegram_url', 'https://t.me/enot_mani',
      'vk_url', 'https://vk.com/skupka_59_perm',
      'max_url', '',
      'primary_color', '#12b5a2',
      'secondary_color', '#0b1739',
      'accent_color', '#0d9b8a',
      'footer_text', 'Сервис сравнения финансовых продуктов. Выбирайте лучшее и экономьте время и деньги.'
    ),
    'published'
  ),
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
      'yandex_metrika_id', '',
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
      'update_notes', 'Версия из коробки. Обновления устанавливает команда поддержки или через git pull + migrate + build.'
    ),
    'published'
  )
ON CONFLICT (key) DO NOTHING;

-- Allow ADMIN to manage settings/system/media in authorize RPC
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
      ARRAY['content', 'news', 'articles', 'categories', 'faq', 'products', 'settings', 'system', 'media']
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
