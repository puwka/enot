import pg from 'pg';
import { getDatabaseConfig } from './config.js';

const { Pool } = pg;

export const pool = new Pool(getDatabaseConfig());

export const query = (text, params) => pool.query(text, params);

export const withClient = async (fn) => {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
};
