import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Router } from 'express';
import { fileURLToPath } from 'url';
import { adminAuthorize } from '../services/admin.js';

const router = Router();
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const uploadsDir = path.join(rootDir, 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '') || '.png';
    const base = path
      .basename(file.originalname || 'image', path.extname(file.originalname || ''))
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'image';
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    return cb(null, true);
  },
});

const getToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.toLowerCase().startsWith('bearer ')) return header.slice(7).trim();
  return req.headers['x-admin-token'] || '';
};

router.post('/', async (req, res) => {
  try {
    await adminAuthorize(getToken(req), 'products');
  } catch (error) {
    const message = String(error?.message || '');
    if (/INVALID_SESSION/i.test(message)) {
      return res.status(401).json({ error: 'INVALID_SESSION' });
    }
    if (/FORBIDDEN/i.test(message)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    return res.status(500).json({ error: 'REQUEST_FAILED' });
  }

  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ error: 'INVALID_FILE_TYPE', message: 'Допустимы JPG, PNG, WEBP, GIF, SVG.' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'FILE_TOO_LARGE', message: 'Максимальный размер файла — 5 МБ.' });
      }
      return res.status(400).json({ error: 'UPLOAD_FAILED', message: err.message || 'Не удалось загрузить файл.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'FILE_REQUIRED', message: 'Выберите файл изображения.' });
    }

    return res.json({
      ok: true,
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      mime: req.file.mimetype,
      size: req.file.size,
    });
  });
});

export default router;
export { uploadsDir };
