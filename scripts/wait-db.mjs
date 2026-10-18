import pg from 'pg';

const cfg =
  process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim()
    ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT || 5432),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    };

const client = new pg.Client(cfg);
try {
  await client.connect();
  await client.query('SELECT 1');
  await client.end();
  process.exit(0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
