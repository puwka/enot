import { createHash, randomBytes } from 'crypto';

const password = process.argv[2];

if (!password) {
  console.log('Использование: node scripts/gen-admin-hashes.mjs YOUR_PASSWORD');
  console.log('');
  console.log('Сгенерирует SQL для grant_superadmin.sql.');
  console.log('Пароль будет передан в crypt() — используйте только в SQL Editor Supabase/PostgreSQL.');
  process.exit(1);
}

const escaped = password.replace(/'/g, "''");

console.log(`INSERT INTO public.admin_users (email, password_hash, name, role, status)
VALUES (
  'YOUR_EMAIL@example.com',
  crypt('${escaped}', gen_salt('bf')),
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
  updated_at = timezone('utc', now());`);

console.log('');
console.log('Замените YOUR_EMAIL@example.com на свой email и выполните SQL в Supabase SQL Editor.');
