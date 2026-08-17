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
