import { useEffect, useState } from 'react';
import { fetchCatalogProducts } from '../data/productsRuntimeApi';

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
          if (!cancelled && rows.length) setItems(rows);
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
  }, [categorySlug]);

  return items;
};
