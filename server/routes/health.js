import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    const { rows } = await pool.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name = ANY($1::text[])`,
      [['users', 'financial_products', 'admin_users', 'news', 'articles']]
    );
    res.json({
      ok: true,
      database: true,
      tablesFound: rows.map((row) => row.table_name),
      message: 'Подключение к базе данных установлено.',
    });
  } catch {
    res.status(503).json({
      ok: false,
      database: false,
      message: 'Не удалось подключиться к базе данных.',
    });
  }
});

export default router;
