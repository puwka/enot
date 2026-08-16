import { Link } from 'react-router-dom';
import { ALL_OFFERS } from '../data/offersRegistry';
import { useFavorites } from '../hooks/useFavorites';

const AccountFavorites = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const items = ALL_OFFERS.filter((item) => favorites.includes(item.id));

  return (
    <section className="cabinet-panel">
      <h2>Избранные предложения</h2>
      {items.length ? (
        <div className="cabinet-list" style={{ marginTop: 8 }}>
          {items.map((item) => (
            <div key={item.id} className="cabinet-list__item">
              <div>
                <strong>{item.title}</strong>
                <span>{item.catalogLabel}</span>
              </div>
              <div className="cabinet-actions">
                <Link to={`/offer/${item.slug}`} className="btn btn--primary btn--sm">Подробнее</Link>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => toggleFavorite(item.id)}>
                  Убрать
                </button>
              </div>
            </div>
          ))}
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
