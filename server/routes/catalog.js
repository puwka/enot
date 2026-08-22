import { Router } from 'express';
import {
  fetchCalculatorConfig,
  fetchCatalogProducts,
  fetchOfferBySlug,
  fetchRelatedOffers,
  getCategoryId,
} from '../services/catalog.js';

const router = Router();

router.get('/products', async (req, res) => {
  try {
    const category = String(req.query.category || '');
    const items = await fetchCatalogProducts(category);
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось загрузить продукты.' });
  }
});

router.get('/products/:slug', async (req, res) => {
  try {
    const item = await fetchOfferBySlug(req.params.slug);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND' });
    const related = item.categoryId
      ? await fetchRelatedOffers(item.categoryId, item.slug, 4)
      : [];
    return res.json({ item, related });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось загрузить продукт.' });
  }
});

router.get('/calculator/:key', async (req, res) => {
  try {
    const config = await fetchCalculatorConfig(req.params.key || 'loan');
    res.json({ config });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось загрузить калькулятор.' });
  }
});

router.get('/category-id/:slug', async (req, res) => {
  try {
    const id = await getCategoryId(req.params.slug);
    res.json({ id });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED' });
  }
});

export default router;
