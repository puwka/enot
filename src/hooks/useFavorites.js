import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'enotmani-favorites';

const readFavorites = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => readFavorites());

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setFavorites(readFavorites());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persist = useCallback((next) => {
    setFavorites(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('enotmani-favorites'));
  }, []);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    window.addEventListener('enotmani-favorites', sync);
    return () => window.removeEventListener('enotmani-favorites', sync);
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (id) => {
      if (!id) return;
      persist(
        favorites.includes(id)
          ? favorites.filter((item) => item !== id)
          : [...favorites, id]
      );
    },
    [favorites, persist]
  );

  return { favorites, isFavorite, toggleFavorite, count: favorites.length };
};

export default useFavorites;
