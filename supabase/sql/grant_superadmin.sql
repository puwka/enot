INSERT INTO public.admin_users (email, password_hash, name, role, status)
VALUES (
  'ВАШ_EMAIL@example.com',
  'pbkdf2$100000$799UnMxAagwrlzkugNYR0Q==$zATDL886i9ISGHNSJsrD6OMBALMsys3v0Ty8qjD33a0=',
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
