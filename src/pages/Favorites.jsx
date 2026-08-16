import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ALL_OFFERS } from '../data/offersRegistry';
import { useFavorites } from '../hooks/useFavorites';
import HeartIcon from '../components/HeartIcon';
import './ContentPage.css';

const Favorites = () => {
  const { favorites, toggleFavorite, count } = useFavorites();

  const items = useMemo(
    () => ALL_OFFERS.filter((offer) => favorites.includes(offer.id)),
    [favorites]
  );

  return (
    <main className="content-page">
      <div className="content-page__container content-page__container--wide">
        <nav className="content-crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <span>Избранное</span>
        </nav>

        <header className="content-page__header">
          <h1 className="content-page__title">Избранное</h1>
          <p className="content-page__lead">
            Сохранённые предложения: {count}. Список хранится в вашем браузере.
          </p>
        </header>

        {items.length ? (
          <div className="fav-list">
            {items.map((item) => (
              <article key={item.id} className="fav-item">
                <span className="fav-item__logo">
                  <img src={item.image} alt="" />
                </span>
                <div className="fav-item__meta">
                  <strong>{item.title}</strong>
                  <span>
                    {item.catalogLabel}
                    {item.rate ? ` · ${item.rate}` : ''}
                    {item.benefit1 ? ` · ${item.benefit1}` : ''}
                    {item.spec ? ` · ${item.spec}` : ''}
                  </span>
                </div>
                <div className="fav-item__actions">
                  <Link to={`/offer/${item.slug}`} className="btn btn--primary btn--sm">
                    Подробнее
                  </Link>
                  <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={() => toggleFavorite(item.id)}
                    aria-label="Убрать из избранного"
                  >
                    <HeartIcon filled size={18} />
                    Убрать
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="content-empty">
            <p>Пока нет сохранённых предложений. Добавьте их из каталогов через значок сердца.</p>
            <Link to="/loans" className="btn btn--primary">
              Перейти к кредитам
            </Link>
          </div>
        )}

        <section className="content-banner">
          <div>
            <h2>Продолжите сравнение</h2>
            <p>Откройте каталог и сохраните ещё несколько подходящих вариантов.</p>
          </div>
          <div className="content-banner__actions">
            <Link to="/cards" className="btn btn--primary">
              Дебетовые карты
            </Link>
            <Link to="/consumer-loans" className="btn btn--secondary">
              Кредиты
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Favorites;
