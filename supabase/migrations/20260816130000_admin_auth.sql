CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('SUPERADMIN', 'ADMIN', 'EDITOR')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz,
  CONSTRAINT admin_users_email_unique UNIQUE (email)
);

CREATE TRIGGER admin_users_set_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES public.admin_users (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX admin_users_role_status_idx
  ON public.admin_users (role, status)
  WHERE deleted_at IS NULL;

CREATE INDEX admin_sessions_admin_user_id_idx
  ON public.admin_sessions (admin_user_id);

CREATE INDEX admin_sessions_expires_at_idx
  ON public.admin_sessions (expires_at)
  WHERE revoked_at IS NULL;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_sessions FROM anon, authenticated;
GRANT ALL ON TABLE public.admin_users TO service_role;
GRANT ALL ON TABLE public.admin_sessions TO service_role;

DROP POLICY IF EXISTS roles_admin_all ON public.roles;
DROP POLICY IF EXISTS media_admin_all ON public.media;
DROP POLICY IF EXISTS media_insert_own ON public.media;
DROP POLICY IF EXISTS users_admin_all ON public.users;
DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS categories_admin_all ON public.categories;
DROP POLICY IF EXISTS banks_admin_all ON public.banks;
DROP POLICY IF EXISTS financial_products_admin_all ON public.financial_products;
DROP POLICY IF EXISTS articles_admin_all ON public.articles;
DROP POLICY IF EXISTS news_admin_all ON public.news;
DROP POLICY IF EXISTS faq_admin_all ON public.faq;
DROP POLICY IF EXISTS pages_admin_all ON public.pages;
DROP POLICY IF EXISTS page_blocks_admin_all ON public.page_blocks;
DROP POLICY IF EXISTS menus_admin_all ON public.menus;
DROP POLICY IF EXISTS site_settings_admin_all ON public.site_settings;
DROP POLICY IF EXISTS bonus_rules_admin_all ON public.bonus_rules;
DROP POLICY IF EXISTS bonus_transactions_admin_insert ON public.bonus_transactions;
DROP POLICY IF EXISTS bonus_transactions_admin_update ON public.bonus_transactions;
DROP POLICY IF EXISTS referrals_admin_all ON public.referrals;
DROP POLICY IF EXISTS audit_logs_select_admin ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_admin ON public.audit_logs;

CREATE POLICY media_insert_own
ON public.media
FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY users_select_own
ON public.users
FOR SELECT
TO authenticated
USING (id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON TABLE public.roles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.categories FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.banks FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.financial_products FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.articles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.news FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.faq FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.pages FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.page_blocks FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.menus FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.site_settings FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.bonus_rules FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.bonus_transactions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.referrals FROM anon, authenticated;
REVOKE ALL ON TABLE public.audit_logs FROM anon, authenticated;

INSERT INTO public.admin_users (email, password_hash, name, role, status)
VALUES
  (
    'superadmin@enotmani.local',
    'pbkdf2$100000$OibniD/d1YjC8/A+KigE+Q==$IAChh7d8Jt9I5CyvyyolYqnI7OcHA8eWuwRsFsZtS7M=',
    'Super Admin',
    'SUPERADMIN',
    'active'
  ),
  (
    'admin@enotmani.local',
    'pbkdf2$100000$799UnMxAagwrlzkugNYR0Q==$zATDL886i9ISGHNSJsrD6OMBALMsys3v0Ty8qjD33a0=',
    'Admin',
    'ADMIN',
    'active'
  ),
  (
    'editor@enotmani.local',
    'pbkdf2$100000$GSKknuOmY0f2V8eTNgT/Yg==$Gf/RHNMLq/Hl+jbQ+qzJFH99ZqCCAd+ykEVZCGkPjT8=',
    'Editor',
    'EDITOR',
    'active'
  );
