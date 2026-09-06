import { Router } from 'express';
import {
  fetchArticleBySlug,
  fetchArticlesList,
  fetchCalculatorConfig,
  fetchCatalogProducts,
  fetchFaqList,
  fetchNewsBySlug,
  fetchNewsList,
  fetchOfferBySlug,
  fetchRelatedArticles,
  fetchRelatedNews,
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

router.get('/news', async (_req, res) => {
  try {
    const items = await fetchNewsList();
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось загрузить новости.' });
  }
});

router.get('/news/:slug', async (req, res) => {
  try {
    const item = await fetchNewsBySlug(req.params.slug);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND' });
    const related = await fetchRelatedNews(item.slug, 3);
    return res.json({ item, related });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось загрузить новость.' });
  }
});

router.get('/articles', async (_req, res) => {
  try {
    const items = await fetchArticlesList();
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось загрузить статьи.' });
  }
});

router.get('/articles/:slug', async (req, res) => {
  try {
    const item = await fetchArticleBySlug(req.params.slug);
    if (!item) return res.status(404).json({ error: 'NOT_FOUND' });
    const related = await fetchRelatedArticles(item.slug, 3);
    return res.json({ item, related });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось загрузить статью.' });
  }
});

router.get('/faq', async (_req, res) => {
  try {
    const items = await fetchFaqList();
    res.json({ items });
  } catch {
    res.status(500).json({ error: 'REQUEST_FAILED', message: 'Не удалось загрузить FAQ.' });
  }
});

export default router;
