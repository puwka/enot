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
  uploaded_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
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

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles (id),
  email text,
  name text,
  phone text,
  avatar_media_id uuid REFERENCES public.media (id) ON DELETE SET NULL,
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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    JOIN public.roles r ON r.id = u.role_id
    WHERE u.id = auth.uid()
      AND u.deleted_at IS NULL
      AND u.status = 'active'
      AND r.slug = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role_id uuid;
  generated_code text;
BEGIN
  SELECT id INTO default_role_id FROM public.roles WHERE slug = 'user' LIMIT 1;
  IF default_role_id IS NULL THEN
    RAISE EXCEPTION 'default role user is missing';
  END IF;

  LOOP
    generated_code := 'ENOT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = generated_code);
  END LOOP;

  INSERT INTO public.users (id, role_id, email, name, referral_code)
  VALUES (
    NEW.id,
    default_role_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(COALESCE(NEW.email, 'user'), '@', 1)),
    generated_code
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.protect_user_secure_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    IF NEW.role_id IS DISTINCT FROM OLD.role_id THEN
      RAISE EXCEPTION 'role change forbidden';
    END IF;
    IF NEW.bonus_balance IS DISTINCT FROM OLD.bonus_balance THEN
      RAISE EXCEPTION 'bonus balance change forbidden';
    END IF;
    IF NEW.deleted_at IS DISTINCT FROM OLD.deleted_at THEN
      RAISE EXCEPTION 'delete flag change forbidden';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER users_protect_secure_fields
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.protect_user_secure_fields();
