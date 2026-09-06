import { useFavorites } from './useFavorites';

/** Favorites already store full snapshots — no API resolve needed. */
export const useFavoriteOffers = () => {
  const { favorites, toggleFavorite, count, isFavorite, favoriteKeys } = useFavorites();

  return {
    items: favorites.map((item) => ({
      ...item,
      id: item.key,
      slug: item.slug || item.key,
    })),
    loading: false,
    toggleFavorite,
    count,
    isFavorite,
    favorites: favoriteKeys,
  };
};

export default useFavoriteOffers;
