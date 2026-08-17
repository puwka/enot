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

CREATE TABLE IF NOT EXISTS public.admin_users (
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

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_set_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES public.admin_users (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS admin_users_role_status_idx
  ON public.admin_users (role, status)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS admin_sessions_admin_user_id_idx
  ON public.admin_sessions (admin_user_id);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx
  ON public.admin_sessions (expires_at)
  WHERE revoked_at IS NULL;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
REVOKE ALL ON TABLE public.admin_sessions FROM anon, authenticated;
GRANT ALL ON TABLE public.admin_users TO service_role;
GRANT ALL ON TABLE public.admin_sessions TO service_role;

CREATE OR REPLACE FUNCTION public.admin_public_user(p_admin public.admin_users)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'id', p_admin.id,
    'email', p_admin.email,
    'name', p_admin.name,
    'role', p_admin.role,
    'status', p_admin.status,
    'lastLoginAt', p_admin.last_login_at
  );
$$;

CREATE OR REPLACE FUNCTION public.admin_hash_token(p_token text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT encode(digest(p_token, 'sha256'), 'hex');
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

  RETURN jsonb_build_object(
    'token', raw_token,
    'expiresAt', expires_at,
    'admin', public.admin_public_user(admin_row)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_logout(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  UPDATE public.admin_sessions
  SET revoked_at = timezone('utc', now())
  WHERE token_hash = public.admin_hash_token(p_token)
    AND revoked_at IS NULL;

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_session(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  session_row public.admin_sessions%ROWTYPE;
  admin_row public.admin_users%ROWTYPE;
BEGIN
  SELECT *
  INTO session_row
  FROM public.admin_sessions
  WHERE token_hash = public.admin_hash_token(p_token)
    AND revoked_at IS NULL
    AND expires_at > timezone('utc', now())
  LIMIT 1;

  IF session_row.id IS NULL THEN
    RAISE EXCEPTION 'INVALID_SESSION' USING ERRCODE = '28000';
  END IF;

  SELECT *
  INTO admin_row
  FROM public.admin_users
  WHERE id = session_row.admin_user_id
    AND deleted_at IS NULL
    AND status = 'active'
  LIMIT 1;

  IF admin_row.id IS NULL THEN
    RAISE EXCEPTION 'INVALID_SESSION' USING ERRCODE = '28000';
  END IF;

  RETURN jsonb_build_object(
    'admin', public.admin_public_user(admin_row),
    'expiresAt', session_row.expires_at
  );
END;
$$;

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

GRANT EXECUTE ON FUNCTION public.admin_login(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_logout(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_authorize(text, text) TO anon, authenticated;

INSERT INTO public.admin_users (email, password_hash, name, role, status)
VALUES
  (
    'superadmin@enotmani.local',
    crypt('SuperAdmin123!', gen_salt('bf')),
    'Super Admin',
    'SUPERADMIN',
    'active'
  ),
  (
    'admin@enotmani.local',
    crypt('Admin123!', gen_salt('bf')),
    'Admin',
    'ADMIN',
    'active'
  ),
  (
    'editor@enotmani.local',
    crypt('Editor123!', gen_salt('bf')),
    'Editor',
    'EDITOR',
    'active'
  )
ON CONFLICT (email) DO UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  status = 'active',
  deleted_at = NULL,
  updated_at = timezone('utc', now());
