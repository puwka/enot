import { useEffect, useState } from 'react';
import { fetchCatalogProducts } from '../data/productsRuntimeApi';

const itemKey = (item) => String(item?.slug || item?.link || item?.id || item?.title || item?.bank || item?.nameis || '');

/** Merge CMS products over static catalog: CMS first, then unique static leftovers. */
export const mergeCatalogItems = (staticItems = [], cmsItems = []) => {
  if (!cmsItems.length) return staticItems;
  const seen = new Set(cmsItems.map(itemKey).filter(Boolean));
  const extras = staticItems.filter((item) => {
    const key = itemKey(item);
    return key && !seen.has(key);
  });
  return [...cmsItems, ...extras];
};

export const useCatalogProducts = (categorySlug, staticItems) => {
  const [items, setItems] = useState(staticItems);

  useEffect(() => {
    setItems(staticItems);
  }, [staticItems]);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchCatalogProducts(categorySlug)
        .then((rows) => {
          if (cancelled) return;
          setItems(mergeCatalogItems(staticItems, rows));
        })
        .catch(() => {});
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(load, { timeout: 1500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const timerId = window.setTimeout(load, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [categorySlug, staticItems]);

  return items;
};

export default useCatalogProducts;
