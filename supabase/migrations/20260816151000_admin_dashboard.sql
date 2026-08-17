CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    ALTER TABLE public.audit_logs
      ADD COLUMN IF NOT EXISTS admin_actor_id uuid REFERENCES public.admin_users (id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS audit_logs_admin_actor_created_idx
      ON public.audit_logs (admin_actor_id, created_at DESC);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.admin_dashboard(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  session_payload jsonb;
  result jsonb;
  users_total integer := 0;
  users_today integer := 0;
  users_week integer := 0;
  news_count integer := 0;
  articles_count integer := 0;
  pages_count integer := 0;
  products_active integer := 0;
  products_inactive integer := 0;
  bonus_credited bigint := 0;
  bonus_debited bigint := 0;
  user_activity jsonb := '[]'::jsonb;
  admin_activity jsonb := '[]'::jsonb;
  recent_changes jsonb := '[]'::jsonb;
  day_start timestamptz := date_trunc('day', timezone('utc', now()));
  week_start timestamptz := timezone('utc', now()) - interval '7 days';
BEGIN
  session_payload := public.admin_session(p_token);

  IF to_regclass('public.users') IS NOT NULL THEN
    EXECUTE $q$
      SELECT
        count(*) FILTER (WHERE deleted_at IS NULL),
        count(*) FILTER (WHERE deleted_at IS NULL AND created_at >= $1),
        count(*) FILTER (WHERE deleted_at IS NULL AND created_at >= $2)
      FROM public.users
    $q$
    INTO users_total, users_today, users_week
    USING day_start, week_start;
  END IF;

  IF to_regclass('public.news') IS NOT NULL THEN
    EXECUTE $q$
      SELECT count(*) FROM public.news WHERE deleted_at IS NULL
    $q$
    INTO news_count;
  END IF;

  IF to_regclass('public.articles') IS NOT NULL THEN
    EXECUTE $q$
      SELECT count(*) FROM public.articles WHERE deleted_at IS NULL
    $q$
    INTO articles_count;
  END IF;

  IF to_regclass('public.pages') IS NOT NULL THEN
    EXECUTE $q$
      SELECT count(*) FROM public.pages WHERE deleted_at IS NULL
    $q$
    INTO pages_count;
  END IF;

  IF to_regclass('public.financial_products') IS NOT NULL THEN
    EXECUTE $q$
      SELECT
        count(*) FILTER (WHERE deleted_at IS NULL AND status = 'published'),
        count(*) FILTER (WHERE deleted_at IS NULL AND status <> 'published')
      FROM public.financial_products
    $q$
    INTO products_active, products_inactive;
  END IF;

  IF to_regclass('public.bonus_transactions') IS NOT NULL THEN
    EXECUTE $q$
      SELECT
        coalesce(sum(points) FILTER (WHERE points > 0 AND status = 'credited'), 0),
        coalesce(sum(abs(points)) FILTER (WHERE points < 0 OR status IN ('reversed', 'rejected')), 0)
      FROM public.bonus_transactions
    $q$
    INTO bonus_credited, bonus_debited;
  END IF;

  IF to_regclass('public.bonus_transactions') IS NOT NULL AND to_regclass('public.users') IS NOT NULL THEN
    EXECUTE $q$
      SELECT coalesce(jsonb_agg(item ORDER BY item_time DESC), '[]'::jsonb)
      FROM (
        SELECT
          jsonb_build_object(
            'id', bt.id,
            'actor', coalesce(nullif(u.name, ''), u.email, 'Пользователь'),
            'action', bt.title,
            'meta', CASE
              WHEN bt.points > 0 THEN '+' || bt.points::text || ' баллов'
              ELSE bt.points::text || ' баллов'
            END,
            'at', bt.created_at
          ) AS item,
          bt.created_at AS item_time
        FROM public.bonus_transactions bt
        LEFT JOIN public.users u ON u.id = bt.user_id
        ORDER BY bt.created_at DESC
        LIMIT 8
      ) activity
    $q$
    INTO user_activity;
  END IF;

  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    EXECUTE $q$
      SELECT coalesce(jsonb_agg(item ORDER BY item_time DESC), '[]'::jsonb)
      FROM (
        SELECT
          jsonb_build_object(
            'id', al.id,
            'actor', coalesce(nullif(au.name, ''), au.email, nullif(u.name, ''), u.email, 'Система'),
            'action', al.action,
            'entity', coalesce(al.entity_type, '—'),
            'at', al.created_at
          ) AS item,
          al.created_at AS item_time
        FROM public.audit_logs al
        LEFT JOIN public.admin_users au ON au.id = al.admin_actor_id
        LEFT JOIN public.users u ON u.id = al.actor_id
        WHERE al.admin_actor_id IS NOT NULL
        ORDER BY al.created_at DESC
        LIMIT 8
      ) activity
    $q$
    INTO admin_activity;

    EXECUTE $q$
      SELECT coalesce(jsonb_agg(item ORDER BY item_time DESC), '[]'::jsonb)
      FROM (
        SELECT
          jsonb_build_object(
            'id', al.id,
            'actor', coalesce(nullif(au.name, ''), au.email, nullif(u.name, ''), u.email, 'Система'),
            'action', al.action,
            'entity', trim(both FROM coalesce(al.entity_type, '') || CASE
              WHEN al.entity_id IS NULL THEN ''
              ELSE ' · ' || left(al.entity_id::text, 8)
            END),
            'at', al.created_at
          ) AS item,
          al.created_at AS item_time
        FROM public.audit_logs al
        LEFT JOIN public.admin_users au ON au.id = al.admin_actor_id
        LEFT JOIN public.users u ON u.id = al.actor_id
        ORDER BY al.created_at DESC
        LIMIT 10
      ) changes
    $q$
    INTO recent_changes;
  END IF;

  IF admin_activity = '[]'::jsonb THEN
    SELECT coalesce(jsonb_agg(item ORDER BY item_time DESC), '[]'::jsonb)
    INTO admin_activity
    FROM (
      SELECT
        jsonb_build_object(
          'id', au.id,
          'actor', au.name,
          'action', 'Вход в админ-панель',
          'entity', au.role,
          'at', au.last_login_at
        ) AS item,
        au.last_login_at AS item_time
      FROM public.admin_users au
      WHERE au.deleted_at IS NULL
        AND au.last_login_at IS NOT NULL
      ORDER BY au.last_login_at DESC
      LIMIT 8
    ) logins;
  END IF;

  result := jsonb_build_object(
    'users', jsonb_build_object(
      'total', coalesce(users_total, 0),
      'today', coalesce(users_today, 0),
      'week', coalesce(users_week, 0)
    ),
    'content', jsonb_build_object(
      'news', coalesce(news_count, 0),
      'articles', coalesce(articles_count, 0),
      'pages', coalesce(pages_count, 0)
    ),
    'products', jsonb_build_object(
      'active', coalesce(products_active, 0),
      'inactive', coalesce(products_inactive, 0)
    ),
    'bonuses', jsonb_build_object(
      'turnover', coalesce(bonus_credited, 0) + coalesce(bonus_debited, 0),
      'credited', coalesce(bonus_credited, 0),
      'debited', coalesce(bonus_debited, 0)
    ),
    'userActivity', coalesce(user_activity, '[]'::jsonb),
    'adminActivity', coalesce(admin_activity, '[]'::jsonb),
    'recentChanges', coalesce(recent_changes, '[]'::jsonb)
  );

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_login(p_email text, p_password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  admin_row public.admin_users%ROWTYPE;
  raw_token text;
  expires_at timestamptz;
BEGIN
  SELECT *
  INTO admin_row
  FROM public.admin_users
  WHERE lower(email) = lower(trim(p_email))
    AND deleted_at IS NULL
    AND status = 'active'
  LIMIT 1;

  IF admin_row.id IS NULL THEN
    RAISE EXCEPTION 'INVALID_CREDENTIALS' USING ERRCODE = '28000';
  END IF;

  IF admin_row.password_hash IS DISTINCT FROM crypt(p_password, admin_row.password_hash) THEN
    RAISE EXCEPTION 'INVALID_CREDENTIALS' USING ERRCODE = '28000';
  END IF;

  raw_token := encode(gen_random_bytes(32), 'base64');
  expires_at := timezone('utc', now()) + interval '7 days';

  INSERT INTO public.admin_sessions (admin_user_id, token_hash, expires_at)
  VALUES (admin_row.id, public.admin_hash_token(raw_token), expires_at);

  UPDATE public.admin_users
  SET last_login_at = timezone('utc', now())
  WHERE id = admin_row.id;

  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    BEGIN
      INSERT INTO public.audit_logs (admin_actor_id, action, entity_type, entity_id, after_data)
      VALUES (
        admin_row.id,
        'login',
        'admin_session',
        admin_row.id,
        jsonb_build_object('email', admin_row.email, 'role', admin_row.role)
      );
    EXCEPTION WHEN undefined_column THEN
      NULL;
    END;
  END IF;

  RETURN jsonb_build_object(
    'token', raw_token,
    'expiresAt', expires_at,
    'admin', public.admin_public_user(admin_row)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_dashboard(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_login(text, text) TO anon, authenticated;
