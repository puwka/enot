import pg from 'pg';
import {
  getDatabaseConfig,
  getMigrationsDir,
  getSeedDir,
  listSqlFiles,
  readSqlFile,
} from './db-config.mjs';

const { Client } = pg;

const REQUIRED_TABLES = [
  'users',
  'categories',
  'financial_products',
  'articles',
  'news',
  'faq',
  'admin_users',
  'admin_sessions',
  'bonus_rules',
  'bonus_transactions',
  'referrals',
  'calculator_configs',
];

const REQUIRED_FUNCTIONS = [
  'admin_login',
  'admin_cms',
  'admin_products_cms',
  'claim_bonus_action',
];

const connect = async () => {
  const client = new Client(getDatabaseConfig());
  await client.connect();
  return client;
};

const ensureMigrationTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      id serial PRIMARY KEY,
      filename text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT timezone('utc', now())
    );
  `);
};

const getAppliedMigrations = async (client) => {
  const { rows } = await client.query('SELECT filename FROM public.schema_migrations ORDER BY filename');
  return new Set(rows.map((row) => row.filename));
};

const applySqlFiles = async (client, dir, files, track = true) => {
  const applied = track ? await getAppliedMigrations(client) : new Set();

  for (const filename of files) {
    if (track && applied.has(filename)) {
      console.log(`skip ${filename}`);
      continue;
    }

    const sql = readSqlFile(dir, filename);
    console.log(`apply ${filename}`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      if (track) {
        await client.query('INSERT INTO public.schema_migrations (filename) VALUES ($1)', [filename]);
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`${filename}: ${error.message}`);
    }
  }
};

const migrate = async () => {
  const client = await connect();
  try {
    await ensureMigrationTable(client);
    const files = listSqlFiles(getMigrationsDir());
    await applySqlFiles(client, getMigrationsDir(), files, true);
    console.log('Миграции выполнены.');
  } finally {
    await client.end();
  }
};

const seed = async () => {
  const client = await connect();
  try {
    const files = listSqlFiles(getSeedDir());
    if (!files.length) {
      console.log('Файлы seed не найдены.');
      return;
    }
    await applySqlFiles(client, getSeedDir(), files, false);
    console.log('Seed-данные загружены.');
  } finally {
    await client.end();
  }
};

const check = async () => {
  const client = await connect();
  try {
    await client.query('SELECT 1');
    console.log('Подключение к базе данных: OK');

    const missingTables = [];
    for (const table of REQUIRED_TABLES) {
      const { rows } = await client.query('SELECT to_regclass($1) AS name', [`public.${table}`]);
      if (!rows[0]?.name) missingTables.push(table);
    }

    if (missingTables.length) {
      console.error('Отсутствуют таблицы:', missingTables.join(', '));
      process.exitCode = 1;
      return;
    }
    console.log('Обязательные таблицы: OK');

    const missingFunctions = [];
    for (const fn of REQUIRED_FUNCTIONS) {
      const { rows } = await client.query(
        `SELECT 1
         FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public' AND p.proname = $1
         LIMIT 1`,
        [fn]
      );
      if (!rows.length) missingFunctions.push(fn);
    }

    if (missingFunctions.length) {
      console.error('Отсутствуют функции:', missingFunctions.join(', '));
      process.exitCode = 1;
      return;
    }
    console.log('Обязательные функции: OK');
  } catch (error) {
    console.error('Не удалось подключиться к базе данных.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

const command = process.argv[2];

try {
  if (command === 'migrate') {
    await migrate();
  } else if (command === 'seed') {
    await seed();
  } else if (command === 'check') {
    await check();
  } else {
    console.log('Использование: node scripts/db.mjs <migrate|seed|check>');
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
