CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER roles_set_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.roles (slug, name)
VALUES
  ('user', 'Пользователь'),
  ('admin', 'Администратор');

CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles (id),
  email text NOT NULL,
  password_hash text NOT NULL,
  name text,
  phone text,
  avatar_media_id uuid,
  referral_code text NOT NULL UNIQUE,
  referred_by uuid REFERENCES public.users (id) ON DELETE SET NULL,
  bonus_balance integer NOT NULL DEFAULT 0 CHECK (bonus_balance >= 0),
  notifications jsonb NOT NULL DEFAULT '{"email": true, "pushes": false}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz,
  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_referred_by_not_self CHECK (referred_by IS NULL OR referred_by <> id)
);

CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint CHECK (size_bytes IS NULL OR size_bytes >= 0),
  width integer CHECK (width IS NULL OR width > 0),
  height integer CHECK (height IS NULL OR height > 0),
  alt text,
  uploaded_by uuid REFERENCES public.users (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'ready' CHECK (status IN ('uploading', 'ready', 'failed', 'archived')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  deleted_at timestamptz,
  CONSTRAINT media_bucket_path_unique UNIQUE (bucket, path)
);

CREATE TRIGGER media_set_updated_at
BEFORE UPDATE ON public.media
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.users
  ADD CONSTRAINT users_avatar_media_id_fkey
  FOREIGN KEY (avatar_media_id) REFERENCES public.media (id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT false;
$$;

CREATE OR REPLACE FUNCTION public.protect_user_secure_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('app.allow_secure_update', true) = 'on' THEN
    RETURN NEW;
  END IF;
  IF NEW.role_id IS DISTINCT FROM OLD.role_id THEN
    RAISE EXCEPTION 'role change forbidden';
  END IF;
  IF NEW.bonus_balance IS DISTINCT FROM OLD.bonus_balance THEN
    RAISE EXCEPTION 'bonus balance change forbidden';
  END IF;
  IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
    RAISE EXCEPTION 'delete flag change forbidden';
  END IF;
  IF NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'referral code change forbidden';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_protect_secure_fields
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.protect_user_secure_fields();

CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX user_sessions_user_id_idx ON public.user_sessions (user_id);
CREATE INDEX user_sessions_expires_at_idx ON public.user_sessions (expires_at) WHERE revoked_at IS NULL;
