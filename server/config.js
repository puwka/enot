import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  databaseHost: process.env.DATABASE_HOST || 'localhost',
  databasePort: Number(process.env.DATABASE_PORT || 5432),
  databaseName: process.env.DATABASE_NAME || '',
  databaseUser: process.env.DATABASE_USER || '',
  databasePassword: process.env.DATABASE_PASSWORD || '',
  databaseSsl: process.env.DATABASE_SSL === 'true',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  sessionDays: Number(process.env.SESSION_DAYS || 7),
};

export const getDatabaseConfig = () => {
  if (config.databaseUrl) {
    return {
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
    };
  }
  if (!config.databaseName || !config.databaseUser || config.databasePassword === undefined) {
    throw new Error('DATABASE_URL or DATABASE_* variables are required');
  }
  return {
    host: config.databaseHost,
    port: config.databasePort,
    database: config.databaseName,
    user: config.databaseUser,
    password: config.databasePassword,
    ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
  };
};
