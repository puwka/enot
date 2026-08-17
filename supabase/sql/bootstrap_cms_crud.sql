CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('product', 'article', 'news')),
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  path text,
  variant text,
  cta_label text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz,
  CONSTRAINT categories_type_slug_unique UNIQUE (type, slug)
);

DROP TRIGGER IF EXISTS categories_set_updated_at ON public.categories;
CREATE TRIGGER categories_set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

DROP TRIGGER IF EXISTS pages_set_updated_at ON public.pages;
CREATE TRIGGER pages_set_updated_at
BEFORE UPDATE ON public.pages
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.pages (id) ON DELETE CASCADE,
  block_type text NOT NULL,
  title text,
  body text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

DROP TRIGGER IF EXISTS page_blocks_set_updated_at ON public.page_blocks;
CREATE TRIGGER page_blocks_set_updated_at
BEFORE UPDATE ON public.page_blocks
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  lead text,
  excerpt text,
  cover_media_id uuid,
  cover_url text,
  author text,
  read_time text,
  facts jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  toc jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

DROP TRIGGER IF EXISTS news_set_updated_at ON public.news;
CREATE TRIGGER news_set_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  cover_media_id uuid,
  cover_url text,
  author text,
  read_time text,
  content_blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  toc jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta_title text,
  meta_description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

DROP TRIGGER IF EXISTS articles_set_updated_at ON public.articles;
CREATE TRIGGER articles_set_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz
);

DROP TRIGGER IF EXISTS faq_set_updated_at ON public.faq;
CREATE TRIGGER faq_set_updated_at
BEFORE UPDATE ON public.faq
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  admin_actor_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.news
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS excerpt text;

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS cover_url text;

ALTER TABLE public.faq
  ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE public.page_blocks
  ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    ALTER TABLE public.audit_logs
      ADD COLUMN IF NOT EXISTS admin_actor_id uuid;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.admin_cms_require(p_token text, p_permission text)
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
      ARRAY['content', 'news', 'articles', 'categories', 'faq', 'products', 'users', 'bonuses']
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

CREATE OR REPLACE FUNCTION public.admin_cms(
  p_token text,
  p_action text,
  p_entity text,
  p_id uuid DEFAULT NULL,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_action text := lower(trim(coalesce(p_action, '')));
  v_entity text := lower(trim(coalesce(p_entity, '')));
  v_data jsonb := coalesce(p_data, '{}'::jsonb);
  v_permission text;
  v_auth jsonb;
  v_admin_id uuid;
  v_token_hash text;
  v_items jsonb;
  v_item jsonb;
  v_blocks jsonb;
  v_page_id uuid;
  v_block_type text;
  v_status text;
  rec_categories public.categories%ROWTYPE;
  rec_pages public.pages%ROWTYPE;
  rec_page_blocks public.page_blocks%ROWTYPE;
  rec_news public.news%ROWTYPE;
  rec_articles public.articles%ROWTYPE;
  rec_faq public.faq%ROWTYPE;
  item_elem jsonb;
BEGIN
  v_permission := CASE v_entity
    WHEN 'pages' THEN 'content'
    WHEN 'page_blocks' THEN 'content'
    WHEN 'news' THEN 'news'
    WHEN 'articles' THEN 'articles'
    WHEN 'faq' THEN 'faq'
    WHEN 'categories' THEN 'categories'
    ELSE NULL
  END;

  IF v_permission IS NULL THEN
    RAISE EXCEPTION 'UNKNOWN_ENTITY' USING ERRCODE = '22023';
  END IF;

  v_auth := public.admin_cms_require(p_token, v_permission);
  v_admin_id := (v_auth -> 'admin' ->> 'id')::uuid;

  BEGIN
    v_token_hash := public.admin_hash_token(p_token);
    SELECT s.admin_user_id
    INTO v_admin_id
    FROM public.admin_sessions s
    WHERE s.token_hash = v_token_hash
      AND s.revoked_at IS NULL
      AND s.expires_at > timezone('utc', now())
    LIMIT 1;
  EXCEPTION WHEN undefined_function THEN
    v_admin_id := (v_auth -> 'admin' ->> 'id')::uuid;
  END;

  IF v_admin_id IS NULL THEN
    v_admin_id := (v_auth -> 'admin' ->> 'id')::uuid;
  END IF;

  IF v_action = 'list' THEN
    IF v_entity = 'pages' THEN
      SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.created_at), '[]'::jsonb)
      INTO v_items
      FROM (
        SELECT * FROM public.pages WHERE deleted_at IS NULL ORDER BY sort_order, created_at
      ) t;
    ELSIF v_entity = 'page_blocks' THEN
      IF v_data->>'page_id' IS NULL THEN
        RAISE EXCEPTION 'PAGE_ID_REQUIRED' USING ERRCODE = '22023';
      END IF;
      v_page_id := (v_data->>'page_id')::uuid;
      SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.created_at), '[]'::jsonb)
      INTO v_items
      FROM (
        SELECT * FROM public.page_blocks
        WHERE deleted_at IS NULL AND page_id = v_page_id
        ORDER BY sort_order, created_at
      ) t;
    ELSIF v_entity = 'news' THEN
      SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.created_at DESC), '[]'::jsonb)
      INTO v_items
      FROM (
        SELECT * FROM public.news WHERE deleted_at IS NULL ORDER BY sort_order, created_at DESC
      ) t;
    ELSIF v_entity = 'articles' THEN
      SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.created_at DESC), '[]'::jsonb)
      INTO v_items
      FROM (
        SELECT * FROM public.articles WHERE deleted_at IS NULL ORDER BY sort_order, created_at DESC
      ) t;
    ELSIF v_entity = 'faq' THEN
      SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.created_at), '[]'::jsonb)
      INTO v_items
      FROM (
        SELECT * FROM public.faq WHERE deleted_at IS NULL ORDER BY sort_order, created_at
      ) t;
    ELSIF v_entity = 'categories' THEN
      SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY t.sort_order, t.created_at), '[]'::jsonb)
      INTO v_items
      FROM (
        SELECT * FROM public.categories WHERE deleted_at IS NULL ORDER BY sort_order, created_at
      ) t;
    END IF;
    RETURN jsonb_build_object('items', coalesce(v_items, '[]'::jsonb));
  END IF;

  IF v_action = 'get' THEN
    IF p_id IS NULL THEN
      RAISE EXCEPTION 'ID_REQUIRED' USING ERRCODE = '22023';
    END IF;

    IF v_entity = 'pages' THEN
      SELECT * INTO rec_pages FROM public.pages WHERE id = p_id AND deleted_at IS NULL;
      IF rec_pages.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      SELECT coalesce(jsonb_agg(to_jsonb(b) ORDER BY b.sort_order, b.created_at), '[]'::jsonb)
      INTO v_blocks
      FROM public.page_blocks b
      WHERE b.page_id = p_id AND b.deleted_at IS NULL;
      v_item := to_jsonb(rec_pages) || jsonb_build_object('blocks', coalesce(v_blocks, '[]'::jsonb));
      RETURN jsonb_build_object('item', v_item);
    ELSIF v_entity = 'page_blocks' THEN
      SELECT * INTO rec_page_blocks FROM public.page_blocks WHERE id = p_id AND deleted_at IS NULL;
      IF rec_page_blocks.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_page_blocks));
    ELSIF v_entity = 'news' THEN
      SELECT * INTO rec_news FROM public.news WHERE id = p_id AND deleted_at IS NULL;
      IF rec_news.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_news));
    ELSIF v_entity = 'articles' THEN
      SELECT * INTO rec_articles FROM public.articles WHERE id = p_id AND deleted_at IS NULL;
      IF rec_articles.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_articles));
    ELSIF v_entity = 'faq' THEN
      SELECT * INTO rec_faq FROM public.faq WHERE id = p_id AND deleted_at IS NULL;
      IF rec_faq.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_faq));
    ELSIF v_entity = 'categories' THEN
      SELECT * INTO rec_categories FROM public.categories WHERE id = p_id AND deleted_at IS NULL;
      IF rec_categories.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      RETURN jsonb_build_object('item', to_jsonb(rec_categories));
    END IF;
  END IF;

  IF v_action = 'create' THEN
    BEGIN
      IF v_entity = 'pages' THEN
        INSERT INTO public.pages (
          slug, title, meta_title, meta_description, status, sort_order
        ) VALUES (
          nullif(trim(v_data->>'slug'), ''),
          coalesce(nullif(trim(v_data->>'title'), ''), 'Untitled'),
          nullif(v_data->>'meta_title', ''),
          nullif(v_data->>'meta_description', ''),
          coalesce(nullif(v_data->>'status', ''), 'draft'),
          coalesce((v_data->>'sort_order')::integer, 0)
        )
        RETURNING * INTO rec_pages;
        v_item := to_jsonb(rec_pages);
        p_id := rec_pages.id;
      ELSIF v_entity = 'page_blocks' THEN
        v_block_type := coalesce(v_data->>'block_type', 'text');
        IF v_block_type NOT IN ('hero', 'text', 'image', 'cards', 'cta', 'faq', 'table', 'warning', 'list') THEN
          RAISE EXCEPTION 'INVALID_BLOCK_TYPE' USING ERRCODE = '22023';
        END IF;
        IF v_data->>'page_id' IS NULL THEN
          RAISE EXCEPTION 'PAGE_ID_REQUIRED' USING ERRCODE = '22023';
        END IF;
        INSERT INTO public.page_blocks (
          page_id, block_type, title, body, payload, status, sort_order, is_hidden
        ) VALUES (
          (v_data->>'page_id')::uuid,
          v_block_type,
          nullif(v_data->>'title', ''),
          nullif(v_data->>'body', ''),
          coalesce(v_data->'payload', '{}'::jsonb),
          coalesce(nullif(v_data->>'status', ''), 'draft'),
          coalesce((v_data->>'sort_order')::integer, 0),
          coalesce((v_data->>'is_hidden')::boolean, false)
        )
        RETURNING * INTO rec_page_blocks;
        v_item := to_jsonb(rec_page_blocks);
        p_id := rec_page_blocks.id;
      ELSIF v_entity = 'news' THEN
        INSERT INTO public.news (
          slug, title, lead, excerpt, content_blocks, toc, cta, facts,
          cover_url, cover_media_id, category_id, author, read_time,
          status, sort_order, meta_title, meta_description, published_at
        ) VALUES (
          nullif(trim(v_data->>'slug'), ''),
          coalesce(nullif(trim(v_data->>'title'), ''), 'Untitled'),
          nullif(v_data->>'lead', ''),
          nullif(v_data->>'excerpt', ''),
          coalesce(v_data->'content_blocks', '[]'::jsonb),
          coalesce(v_data->'toc', '[]'::jsonb),
          coalesce(v_data->'cta', '{}'::jsonb),
          coalesce(v_data->'facts', '[]'::jsonb),
          nullif(v_data->>'cover_url', ''),
          CASE WHEN v_data ? 'cover_media_id' AND nullif(v_data->>'cover_media_id', '') IS NOT NULL
            THEN (v_data->>'cover_media_id')::uuid ELSE NULL END,
          CASE WHEN v_data ? 'category_id' AND nullif(v_data->>'category_id', '') IS NOT NULL
            THEN (v_data->>'category_id')::uuid ELSE NULL END,
          nullif(v_data->>'author', ''),
          nullif(v_data->>'read_time', ''),
          coalesce(nullif(v_data->>'status', ''), 'draft'),
          coalesce((v_data->>'sort_order')::integer, 0),
          nullif(v_data->>'meta_title', ''),
          nullif(v_data->>'meta_description', ''),
          CASE WHEN v_data ? 'published_at' AND nullif(v_data->>'published_at', '') IS NOT NULL
            THEN (v_data->>'published_at')::timestamptz ELSE NULL END
        )
        RETURNING * INTO rec_news;
        v_item := to_jsonb(rec_news);
        p_id := rec_news.id;
      ELSIF v_entity = 'articles' THEN
        INSERT INTO public.articles (
          slug, title, excerpt, content_blocks, toc, cta,
          cover_url, cover_media_id, category_id, author, read_time,
          status, sort_order, meta_title, meta_description, published_at
        ) VALUES (
          nullif(trim(v_data->>'slug'), ''),
          coalesce(nullif(trim(v_data->>'title'), ''), 'Untitled'),
          nullif(v_data->>'excerpt', ''),
          coalesce(v_data->'content_blocks', '[]'::jsonb),
          coalesce(v_data->'toc', '[]'::jsonb),
          coalesce(v_data->'cta', '{}'::jsonb),
          nullif(v_data->>'cover_url', ''),
          CASE WHEN v_data ? 'cover_media_id' AND nullif(v_data->>'cover_media_id', '') IS NOT NULL
            THEN (v_data->>'cover_media_id')::uuid ELSE NULL END,
          CASE WHEN v_data ? 'category_id' AND nullif(v_data->>'category_id', '') IS NOT NULL
            THEN (v_data->>'category_id')::uuid ELSE NULL END,
          nullif(v_data->>'author', ''),
          nullif(v_data->>'read_time', ''),
          coalesce(nullif(v_data->>'status', ''), 'draft'),
          coalesce((v_data->>'sort_order')::integer, 0),
          nullif(v_data->>'meta_title', ''),
          nullif(v_data->>'meta_description', ''),
          CASE WHEN v_data ? 'published_at' AND nullif(v_data->>'published_at', '') IS NOT NULL
            THEN (v_data->>'published_at')::timestamptz ELSE NULL END
        )
        RETURNING * INTO rec_articles;
        v_item := to_jsonb(rec_articles);
        p_id := rec_articles.id;
      ELSIF v_entity = 'faq' THEN
        v_status := coalesce(nullif(v_data->>'status', ''), 'draft');
        IF v_status = 'active' THEN
          v_status := 'published';
        END IF;
        INSERT INTO public.faq (
          question, answer, category, sort_order, status
        ) VALUES (
          coalesce(nullif(trim(v_data->>'question'), ''), 'Question'),
          coalesce(nullif(trim(v_data->>'answer'), ''), ''),
          nullif(v_data->>'category', ''),
          coalesce((v_data->>'sort_order')::integer, 0),
          v_status
        )
        RETURNING * INTO rec_faq;
        v_item := to_jsonb(rec_faq);
        p_id := rec_faq.id;
      ELSIF v_entity = 'categories' THEN
        IF coalesce(v_data->>'type', '') NOT IN ('product', 'article', 'news') THEN
          RAISE EXCEPTION 'INVALID_CATEGORY_TYPE' USING ERRCODE = '22023';
        END IF;
        INSERT INTO public.categories (
          type, slug, title, status, sort_order
        ) VALUES (
          v_data->>'type',
          nullif(trim(v_data->>'slug'), ''),
          coalesce(nullif(trim(v_data->>'title'), ''), 'Untitled'),
          coalesce(nullif(v_data->>'status', ''), 'draft'),
          coalesce((v_data->>'sort_order')::integer, 0)
        )
        RETURNING * INTO rec_categories;
        v_item := to_jsonb(rec_categories);
        p_id := rec_categories.id;
      END IF;
    EXCEPTION WHEN unique_violation THEN
      RAISE EXCEPTION 'SLUG_EXISTS' USING ERRCODE = '23505';
    END;

    IF to_regclass('public.audit_logs') IS NOT NULL THEN
      BEGIN
        INSERT INTO public.audit_logs (admin_actor_id, action, entity_type, entity_id, after_data)
        VALUES (v_admin_id, 'create', v_entity, p_id, v_item);
      EXCEPTION WHEN undefined_column OR not_null_violation THEN
        NULL;
      END;
    END IF;

    RETURN jsonb_build_object('item', v_item);
  END IF;

  IF v_action = 'update' THEN
    IF p_id IS NULL THEN
      RAISE EXCEPTION 'ID_REQUIRED' USING ERRCODE = '22023';
    END IF;

    BEGIN
      IF v_entity = 'pages' THEN
        UPDATE public.pages SET
          slug = CASE WHEN v_data ? 'slug' THEN nullif(trim(v_data->>'slug'), '') ELSE slug END,
          title = CASE WHEN v_data ? 'title' THEN coalesce(nullif(trim(v_data->>'title'), ''), title) ELSE title END,
          meta_title = CASE WHEN v_data ? 'meta_title' THEN nullif(v_data->>'meta_title', '') ELSE meta_title END,
          meta_description = CASE WHEN v_data ? 'meta_description' THEN nullif(v_data->>'meta_description', '') ELSE meta_description END,
          status = CASE WHEN v_data ? 'status' THEN coalesce(nullif(v_data->>'status', ''), status) ELSE status END,
          sort_order = CASE WHEN v_data ? 'sort_order' THEN coalesce((v_data->>'sort_order')::integer, sort_order) ELSE sort_order END
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_pages;
        IF rec_pages.id IS NULL THEN
          RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
        END IF;
        v_item := to_jsonb(rec_pages);
      ELSIF v_entity = 'page_blocks' THEN
        IF v_data ? 'block_type' THEN
          v_block_type := v_data->>'block_type';
          IF v_block_type NOT IN ('hero', 'text', 'image', 'cards', 'cta', 'faq', 'table', 'warning', 'list') THEN
            RAISE EXCEPTION 'INVALID_BLOCK_TYPE' USING ERRCODE = '22023';
          END IF;
        END IF;
        UPDATE public.page_blocks SET
          page_id = CASE WHEN v_data ? 'page_id' THEN (v_data->>'page_id')::uuid ELSE page_id END,
          block_type = CASE WHEN v_data ? 'block_type' THEN v_data->>'block_type' ELSE block_type END,
          title = CASE WHEN v_data ? 'title' THEN nullif(v_data->>'title', '') ELSE title END,
          body = CASE WHEN v_data ? 'body' THEN nullif(v_data->>'body', '') ELSE body END,
          payload = CASE WHEN v_data ? 'payload' THEN coalesce(v_data->'payload', payload) ELSE payload END,
          status = CASE WHEN v_data ? 'status' THEN coalesce(nullif(v_data->>'status', ''), status) ELSE status END,
          sort_order = CASE WHEN v_data ? 'sort_order' THEN coalesce((v_data->>'sort_order')::integer, sort_order) ELSE sort_order END,
          is_hidden = CASE WHEN v_data ? 'is_hidden' THEN coalesce((v_data->>'is_hidden')::boolean, is_hidden) ELSE is_hidden END
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_page_blocks;
        IF rec_page_blocks.id IS NULL THEN
          RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
        END IF;
        v_item := to_jsonb(rec_page_blocks);
      ELSIF v_entity = 'news' THEN
        UPDATE public.news SET
          slug = CASE WHEN v_data ? 'slug' THEN nullif(trim(v_data->>'slug'), '') ELSE slug END,
          title = CASE WHEN v_data ? 'title' THEN coalesce(nullif(trim(v_data->>'title'), ''), title) ELSE title END,
          lead = CASE WHEN v_data ? 'lead' THEN nullif(v_data->>'lead', '') ELSE lead END,
          excerpt = CASE WHEN v_data ? 'excerpt' THEN nullif(v_data->>'excerpt', '') ELSE excerpt END,
          content_blocks = CASE WHEN v_data ? 'content_blocks' THEN coalesce(v_data->'content_blocks', content_blocks) ELSE content_blocks END,
          toc = CASE WHEN v_data ? 'toc' THEN coalesce(v_data->'toc', toc) ELSE toc END,
          cta = CASE WHEN v_data ? 'cta' THEN coalesce(v_data->'cta', cta) ELSE cta END,
          facts = CASE WHEN v_data ? 'facts' THEN coalesce(v_data->'facts', facts) ELSE facts END,
          cover_url = CASE WHEN v_data ? 'cover_url' THEN nullif(v_data->>'cover_url', '') ELSE cover_url END,
          cover_media_id = CASE
            WHEN v_data ? 'cover_media_id' AND nullif(v_data->>'cover_media_id', '') IS NULL THEN NULL
            WHEN v_data ? 'cover_media_id' THEN (v_data->>'cover_media_id')::uuid
            ELSE cover_media_id
          END,
          category_id = CASE
            WHEN v_data ? 'category_id' AND nullif(v_data->>'category_id', '') IS NULL THEN NULL
            WHEN v_data ? 'category_id' THEN (v_data->>'category_id')::uuid
            ELSE category_id
          END,
          author = CASE WHEN v_data ? 'author' THEN nullif(v_data->>'author', '') ELSE author END,
          read_time = CASE WHEN v_data ? 'read_time' THEN nullif(v_data->>'read_time', '') ELSE read_time END,
          status = CASE WHEN v_data ? 'status' THEN coalesce(nullif(v_data->>'status', ''), status) ELSE status END,
          sort_order = CASE WHEN v_data ? 'sort_order' THEN coalesce((v_data->>'sort_order')::integer, sort_order) ELSE sort_order END,
          meta_title = CASE WHEN v_data ? 'meta_title' THEN nullif(v_data->>'meta_title', '') ELSE meta_title END,
          meta_description = CASE WHEN v_data ? 'meta_description' THEN nullif(v_data->>'meta_description', '') ELSE meta_description END,
          published_at = CASE
            WHEN v_data ? 'published_at' AND nullif(v_data->>'published_at', '') IS NULL THEN NULL
            WHEN v_data ? 'published_at' THEN (v_data->>'published_at')::timestamptz
            ELSE published_at
          END
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_news;
        IF rec_news.id IS NULL THEN
          RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
        END IF;
        v_item := to_jsonb(rec_news);
      ELSIF v_entity = 'articles' THEN
        UPDATE public.articles SET
          slug = CASE WHEN v_data ? 'slug' THEN nullif(trim(v_data->>'slug'), '') ELSE slug END,
          title = CASE WHEN v_data ? 'title' THEN coalesce(nullif(trim(v_data->>'title'), ''), title) ELSE title END,
          excerpt = CASE WHEN v_data ? 'excerpt' THEN nullif(v_data->>'excerpt', '') ELSE excerpt END,
          content_blocks = CASE WHEN v_data ? 'content_blocks' THEN coalesce(v_data->'content_blocks', content_blocks) ELSE content_blocks END,
          toc = CASE WHEN v_data ? 'toc' THEN coalesce(v_data->'toc', toc) ELSE toc END,
          cta = CASE WHEN v_data ? 'cta' THEN coalesce(v_data->'cta', cta) ELSE cta END,
          cover_url = CASE WHEN v_data ? 'cover_url' THEN nullif(v_data->>'cover_url', '') ELSE cover_url END,
          cover_media_id = CASE
            WHEN v_data ? 'cover_media_id' AND nullif(v_data->>'cover_media_id', '') IS NULL THEN NULL
            WHEN v_data ? 'cover_media_id' THEN (v_data->>'cover_media_id')::uuid
            ELSE cover_media_id
          END,
          category_id = CASE
            WHEN v_data ? 'category_id' AND nullif(v_data->>'category_id', '') IS NULL THEN NULL
            WHEN v_data ? 'category_id' THEN (v_data->>'category_id')::uuid
            ELSE category_id
          END,
          author = CASE WHEN v_data ? 'author' THEN nullif(v_data->>'author', '') ELSE author END,
          read_time = CASE WHEN v_data ? 'read_time' THEN nullif(v_data->>'read_time', '') ELSE read_time END,
          status = CASE WHEN v_data ? 'status' THEN coalesce(nullif(v_data->>'status', ''), status) ELSE status END,
          sort_order = CASE WHEN v_data ? 'sort_order' THEN coalesce((v_data->>'sort_order')::integer, sort_order) ELSE sort_order END,
          meta_title = CASE WHEN v_data ? 'meta_title' THEN nullif(v_data->>'meta_title', '') ELSE meta_title END,
          meta_description = CASE WHEN v_data ? 'meta_description' THEN nullif(v_data->>'meta_description', '') ELSE meta_description END,
          published_at = CASE
            WHEN v_data ? 'published_at' AND nullif(v_data->>'published_at', '') IS NULL THEN NULL
            WHEN v_data ? 'published_at' THEN (v_data->>'published_at')::timestamptz
            ELSE published_at
          END
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_articles;
        IF rec_articles.id IS NULL THEN
          RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
        END IF;
        v_item := to_jsonb(rec_articles);
      ELSIF v_entity = 'faq' THEN
        UPDATE public.faq SET
          question = CASE WHEN v_data ? 'question' THEN coalesce(nullif(trim(v_data->>'question'), ''), question) ELSE question END,
          answer = CASE WHEN v_data ? 'answer' THEN coalesce(nullif(v_data->>'answer', ''), answer) ELSE answer END,
          category = CASE WHEN v_data ? 'category' THEN nullif(v_data->>'category', '') ELSE category END,
          sort_order = CASE WHEN v_data ? 'sort_order' THEN coalesce((v_data->>'sort_order')::integer, sort_order) ELSE sort_order END,
          status = CASE
            WHEN v_data ? 'status' AND v_data->>'status' = 'active' THEN 'published'
            WHEN v_data ? 'status' THEN coalesce(nullif(v_data->>'status', ''), status)
            ELSE status
          END
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_faq;
        IF rec_faq.id IS NULL THEN
          RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
        END IF;
        v_item := to_jsonb(rec_faq);
      ELSIF v_entity = 'categories' THEN
        IF v_data ? 'type' AND coalesce(v_data->>'type', '') NOT IN ('product', 'article', 'news') THEN
          RAISE EXCEPTION 'INVALID_CATEGORY_TYPE' USING ERRCODE = '22023';
        END IF;
        UPDATE public.categories SET
          type = CASE WHEN v_data ? 'type' THEN v_data->>'type' ELSE type END,
          slug = CASE WHEN v_data ? 'slug' THEN nullif(trim(v_data->>'slug'), '') ELSE slug END,
          title = CASE WHEN v_data ? 'title' THEN coalesce(nullif(trim(v_data->>'title'), ''), title) ELSE title END,
          status = CASE WHEN v_data ? 'status' THEN coalesce(nullif(v_data->>'status', ''), status) ELSE status END,
          sort_order = CASE WHEN v_data ? 'sort_order' THEN coalesce((v_data->>'sort_order')::integer, sort_order) ELSE sort_order END
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_categories;
        IF rec_categories.id IS NULL THEN
          RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
        END IF;
        v_item := to_jsonb(rec_categories);
      END IF;
    EXCEPTION WHEN unique_violation THEN
      RAISE EXCEPTION 'SLUG_EXISTS' USING ERRCODE = '23505';
    END;

    IF to_regclass('public.audit_logs') IS NOT NULL THEN
      BEGIN
        INSERT INTO public.audit_logs (admin_actor_id, action, entity_type, entity_id, after_data)
        VALUES (v_admin_id, 'update', v_entity, p_id, v_item);
      EXCEPTION WHEN undefined_column OR not_null_violation THEN
        NULL;
      END;
    END IF;

    RETURN jsonb_build_object('item', v_item);
  END IF;

  IF v_action = 'delete' THEN
    IF p_id IS NULL THEN
      RAISE EXCEPTION 'ID_REQUIRED' USING ERRCODE = '22023';
    END IF;

    IF v_entity = 'pages' THEN
      UPDATE public.pages SET deleted_at = timezone('utc', now())
      WHERE id = p_id AND deleted_at IS NULL
      RETURNING * INTO rec_pages;
      IF rec_pages.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      v_item := to_jsonb(rec_pages);
    ELSIF v_entity = 'page_blocks' THEN
      UPDATE public.page_blocks SET deleted_at = timezone('utc', now())
      WHERE id = p_id AND deleted_at IS NULL
      RETURNING * INTO rec_page_blocks;
      IF rec_page_blocks.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      v_item := to_jsonb(rec_page_blocks);
    ELSIF v_entity = 'news' THEN
      UPDATE public.news SET deleted_at = timezone('utc', now())
      WHERE id = p_id AND deleted_at IS NULL
      RETURNING * INTO rec_news;
      IF rec_news.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      v_item := to_jsonb(rec_news);
    ELSIF v_entity = 'articles' THEN
      UPDATE public.articles SET deleted_at = timezone('utc', now())
      WHERE id = p_id AND deleted_at IS NULL
      RETURNING * INTO rec_articles;
      IF rec_articles.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      v_item := to_jsonb(rec_articles);
    ELSIF v_entity = 'faq' THEN
      UPDATE public.faq SET deleted_at = timezone('utc', now())
      WHERE id = p_id AND deleted_at IS NULL
      RETURNING * INTO rec_faq;
      IF rec_faq.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      v_item := to_jsonb(rec_faq);
    ELSIF v_entity = 'categories' THEN
      UPDATE public.categories SET deleted_at = timezone('utc', now())
      WHERE id = p_id AND deleted_at IS NULL
      RETURNING * INTO rec_categories;
      IF rec_categories.id IS NULL THEN
        RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
      END IF;
      v_item := to_jsonb(rec_categories);
    END IF;

    IF to_regclass('public.audit_logs') IS NOT NULL THEN
      BEGIN
        INSERT INTO public.audit_logs (admin_actor_id, action, entity_type, entity_id, after_data)
        VALUES (v_admin_id, 'delete', v_entity, p_id, v_item);
      EXCEPTION WHEN undefined_column OR not_null_violation THEN
        NULL;
      END;
    END IF;

    RETURN jsonb_build_object('ok', true);
  END IF;

  IF v_action IN ('publish', 'unpublish', 'archive') THEN
    IF p_id IS NULL THEN
      RAISE EXCEPTION 'ID_REQUIRED' USING ERRCODE = '22023';
    END IF;

    IF v_entity NOT IN ('pages', 'news', 'articles') AND NOT (v_action = 'archive' AND v_entity IN ('pages', 'news', 'articles', 'faq', 'categories', 'page_blocks')) THEN
      IF v_action <> 'archive' THEN
        RAISE EXCEPTION 'UNSUPPORTED_ACTION' USING ERRCODE = '22023';
      END IF;
    END IF;

    IF v_action = 'publish' THEN
      IF v_entity = 'pages' THEN
        UPDATE public.pages
        SET status = 'published', published_at = timezone('utc', now())
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_pages;
        IF rec_pages.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_pages);
      ELSIF v_entity = 'news' THEN
        UPDATE public.news
        SET status = 'published', published_at = timezone('utc', now())
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_news;
        IF rec_news.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_news);
      ELSIF v_entity = 'articles' THEN
        UPDATE public.articles
        SET status = 'published', published_at = timezone('utc', now())
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_articles;
        IF rec_articles.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_articles);
      ELSE
        RAISE EXCEPTION 'UNSUPPORTED_ACTION' USING ERRCODE = '22023';
      END IF;

      IF to_regclass('public.audit_logs') IS NOT NULL THEN
        BEGIN
          INSERT INTO public.audit_logs (admin_actor_id, action, entity_type, entity_id, after_data)
          VALUES (v_admin_id, 'publish', v_entity, p_id, v_item);
        EXCEPTION WHEN undefined_column OR not_null_violation THEN
          NULL;
        END;
      END IF;

      RETURN jsonb_build_object('item', v_item);
    END IF;

    IF v_action = 'unpublish' THEN
      IF v_entity = 'pages' THEN
        UPDATE public.pages SET status = 'draft'
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_pages;
        IF rec_pages.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_pages);
      ELSIF v_entity = 'news' THEN
        UPDATE public.news SET status = 'draft'
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_news;
        IF rec_news.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_news);
      ELSIF v_entity = 'articles' THEN
        UPDATE public.articles SET status = 'draft'
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_articles;
        IF rec_articles.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_articles);
      ELSE
        RAISE EXCEPTION 'UNSUPPORTED_ACTION' USING ERRCODE = '22023';
      END IF;
      RETURN jsonb_build_object('item', v_item);
    END IF;

    IF v_action = 'archive' THEN
      IF v_entity = 'pages' THEN
        UPDATE public.pages SET status = 'archived'
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_pages;
        IF rec_pages.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_pages);
      ELSIF v_entity = 'news' THEN
        UPDATE public.news SET status = 'archived'
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_news;
        IF rec_news.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_news);
      ELSIF v_entity = 'articles' THEN
        UPDATE public.articles SET status = 'archived'
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_articles;
        IF rec_articles.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_articles);
      ELSIF v_entity = 'faq' THEN
        UPDATE public.faq SET status = 'archived'
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_faq;
        IF rec_faq.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_faq);
      ELSIF v_entity = 'categories' THEN
        UPDATE public.categories SET status = 'archived'
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_categories;
        IF rec_categories.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_categories);
      ELSIF v_entity = 'page_blocks' THEN
        UPDATE public.page_blocks SET status = 'archived'
        WHERE id = p_id AND deleted_at IS NULL
        RETURNING * INTO rec_page_blocks;
        IF rec_page_blocks.id IS NULL THEN RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002'; END IF;
        v_item := to_jsonb(rec_page_blocks);
      END IF;
      RETURN jsonb_build_object('item', v_item);
    END IF;
  END IF;

  IF v_action = 'reorder' THEN
    IF v_entity NOT IN ('page_blocks', 'faq') THEN
      RAISE EXCEPTION 'UNSUPPORTED_ACTION' USING ERRCODE = '22023';
    END IF;
    IF jsonb_typeof(v_data->'items') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'ITEMS_REQUIRED' USING ERRCODE = '22023';
    END IF;

    FOR item_elem IN SELECT value FROM jsonb_array_elements(v_data->'items')
    LOOP
      IF v_entity = 'page_blocks' THEN
        UPDATE public.page_blocks
        SET sort_order = coalesce((item_elem->>'sort_order')::integer, sort_order)
        WHERE id = (item_elem->>'id')::uuid AND deleted_at IS NULL;
      ELSE
        UPDATE public.faq
        SET sort_order = coalesce((item_elem->>'sort_order')::integer, sort_order)
        WHERE id = (item_elem->>'id')::uuid AND deleted_at IS NULL;
      END IF;
    END LOOP;

    RETURN jsonb_build_object('ok', true);
  END IF;

  IF v_action IN ('hide_block', 'show_block') THEN
    IF v_entity <> 'page_blocks' THEN
      RAISE EXCEPTION 'UNSUPPORTED_ACTION' USING ERRCODE = '22023';
    END IF;
    IF p_id IS NULL THEN
      RAISE EXCEPTION 'ID_REQUIRED' USING ERRCODE = '22023';
    END IF;

    UPDATE public.page_blocks
    SET is_hidden = (v_action = 'hide_block')
    WHERE id = p_id AND deleted_at IS NULL
    RETURNING * INTO rec_page_blocks;

    IF rec_page_blocks.id IS NULL THEN
      RAISE EXCEPTION 'NOT_FOUND' USING ERRCODE = 'P0002';
    END IF;

    RETURN jsonb_build_object('item', to_jsonb(rec_page_blocks));
  END IF;

  RAISE EXCEPTION 'UNKNOWN_ACTION' USING ERRCODE = '22023';
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_cms_require(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_cms(text, text, text, uuid, jsonb) TO anon, authenticated;
