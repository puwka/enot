INSERT INTO public.admin_users (email, password_hash, name, role, status)
VALUES (
  'YOUR_EMAIL@example.com',
  crypt('YOUR_SECURE_PASSWORD', gen_salt('bf')),
  'Администратор',
  'SUPERADMIN',
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
