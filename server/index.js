import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { pool } from './db.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import adminRoutes from './routes/admin.js';

const app = express();
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(rootDir, 'build');

app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin }));
app.use(express.json({ limit: '2mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/admin', adminRoutes);

if (config.nodeEnv === 'production') {
  app.use((req, res, next) => {
    if (req.path === '/sw.js') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    next();
  });
  app.use(express.static(buildDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(buildDir, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: 'REQUEST_FAILED', message: err?.message || 'Internal error' });
});

const start = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection: OK');
  } catch {
    console.error('Не удалось подключиться к базе данных.');
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`API server listening on http://localhost:${config.port}`);
  });
};

start();
