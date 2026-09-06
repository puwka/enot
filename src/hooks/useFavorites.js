import { useCallback, useEffect, useState } from 'react';
import {
  getFavoriteKey,
  readFavoriteSnapshots,
  toFavoriteSnapshot,
  writeFavoriteSnapshots,
  STORAGE_KEY,
  LEGACY_STORAGE_KEY,
} from '../utils/favoriteKey';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => readFavoriteSnapshots());

  const sync = useCallback(() => {
    setFavorites(readFavoriteSnapshots());
  }, []);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === LEGACY_STORAGE_KEY) {
        sync();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('enotmani-favorites', sync);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('enotmani-favorites', sync);
    };
  }, [sync]);

  const persist = useCallback((next) => {
    const saved = writeFavoriteSnapshots(next);
    setFavorites(saved);
    window.dispatchEvent(new Event('enotmani-favorites'));
  }, []);

  const isFavorite = useCallback(
    (itemOrKey) => {
      const key = getFavoriteKey(itemOrKey);
      return key ? favorites.some((item) => item.key === key) : false;
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (itemOrKey) => {
      const snapshot = toFavoriteSnapshot(itemOrKey);
      if (!snapshot?.key) return;

      const exists = favorites.some((item) => item.key === snapshot.key);
      if (exists) {
        persist(favorites.filter((item) => item.key !== snapshot.key));
      } else {
        persist([...favorites, snapshot]);
      }
    },
    [favorites, persist]
  );

  return {
    favorites,
    favoriteKeys: favorites.map((item) => item.key),
    isFavorite,
    toggleFavorite,
    count: favorites.length,
  };
};

export default useFavorites;
