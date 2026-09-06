import { Link } from 'react-router-dom';
import { useFavoriteOffers } from '../hooks/useFavoriteOffers';

const AccountFavorites = () => {
  const { items, loading, toggleFavorite } = useFavoriteOffers();

  return (
    <section className="cabinet-panel">
      <h2>Избранные предложения</h2>
      {loading ? (
        <div className="cabinet-empty" style={{ marginTop: 12 }}>
          <p>Загрузка…</p>
        </div>
      ) : items.length ? (
        <div className="cabinet-list" style={{ marginTop: 8 }}>
          {items.map((item) => {
            const offerSlug = item.slug || item.key;
            return (
            <div key={item.key || offerSlug} className="cabinet-list__item">
              <div>
                <strong>{item.title}</strong>
                <span>{item.catalogLabel}</span>
              </div>
              <div className="cabinet-actions">
                <Link to={`/offer/${encodeURIComponent(offerSlug)}`} className="btn btn--primary btn--sm">Подробнее</Link>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => toggleFavorite(item)}>
                  Убрать
                </button>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="cabinet-empty" style={{ marginTop: 12 }}>
          <p>Сохраняйте интересные предложения в каталогах.</p>
          <Link to="/loans" className="btn btn--primary btn--sm">К кредитам</Link>
        </div>
      )}
    </section>
  );
};

export default AccountFavorites;
