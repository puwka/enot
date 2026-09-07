import { useEffect, useState } from 'react';
import { fetchCatalogProducts } from '../data/productsRuntimeApi';

/**
 * Prefer CMS catalog exclusively when API responds.
 * Static hardcoded items are only a fallback if the API is unavailable.
 */
export const mergeCatalogItems = (staticItems = [], cmsItems = [], { apiOk = false } = {}) => {
  if (apiOk) return cmsItems;
  if (!cmsItems.length) return staticItems;
  return cmsItems;
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
          setItems(mergeCatalogItems(staticItems, rows, { apiOk: true }));
        })
        .catch(() => {
          if (cancelled) return;
          setItems(staticItems);
        });
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
