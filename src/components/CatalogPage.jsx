import { useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { enrichOffers } from '../utils/offers';
import HeartIcon from './HeartIcon';
import './CatalogPage.css';

export const PRODUCT_CATEGORIES = [
  { to: '/loans', label: 'Займы' },
  { to: '/consumer-loans', label: 'Потребительские' },
  { to: '/auto-loans', label: 'Кредитные карты' },
  { to: '/cards', label: 'Дебетовые карты' },
  { to: '/collateral-loans', label: 'Под залог' },
];

export const INFO_CATEGORIES = [
  { to: '/Education', label: 'Статьи' },
  { to: '/obuchenie', label: 'Обучение' },
  { to: '/services', label: 'Сервисы' },
  { to: '/shops', label: 'Магазины' },
  { to: '/Job', label: 'Вакансии' },
  { to: '/guide', label: 'Справочник' },
];

const SORT_OPTIONS = {
  loan: [
    { value: 'default', label: 'По умолчанию' },
    { value: 'name-asc', label: 'По названию А–Я' },
    { value: 'name-desc', label: 'По названию Я–А' },
    { value: 'sum-desc', label: 'По сумме' },
  ],
  debit: [
    { value: 'default', label: 'По умолчанию' },
    { value: 'name-asc', label: 'По названию А–Я' },
    { value: 'name-desc', label: 'По названию Я–А' },
  ],
  job: [
    { value: 'default', label: 'По умолчанию' },
    { value: 'name-asc', label: 'По названию А–Я' },
    { value: 'spec-asc', label: 'По направлению' },
  ],
  education: [
    { value: 'default', label: 'По умолчанию' },
    { value: 'name-asc', label: 'По направлению А–Я' },
    { value: 'name-desc', label: 'По направлению Я–А' },
  ],
  service: [
    { value: 'default', label: 'По умолчанию' },
    { value: 'name-asc', label: 'По названию А–Я' },
    { value: 'spec-asc', label: 'По направлению' },
  ],
  shop: [
    { value: 'default', label: 'По умолчанию' },
    { value: 'name-asc', label: 'По названию А–Я' },
    { value: 'name-desc', label: 'По названию Я–А' },
  ],
};

const COLUMNS = {
  loan: [
    { key: 'title', label: 'Компания' },
    { key: 'rate', label: 'Ставка' },
    { key: 'sum', label: 'Сумма' },
    { key: 'term', label: 'Срок' },
  ],
  debit: [
    { key: 'title', label: 'Карта' },
    { key: 'benefit1', label: 'Преимущество' },
    { key: 'benefit2', label: 'Условие' },
    { key: 'benefit3', label: 'Сервис' },
  ],
  job: [
    { key: 'title', label: 'Вакансия' },
    { key: 'spec', label: 'Направление' },
  ],
  education: [
    { key: 'title', label: 'Направление' },
  ],
  service: [
    { key: 'title', label: 'Сервис' },
    { key: 'spec', label: 'Категория' },
  ],
  shop: [
    { key: 'title', label: 'Предложение' },
    { key: 'benefit1', label: 'Выгода' },
    { key: 'benefit2', label: 'Условие' },
    { key: 'benefit3', label: 'Сервис' },
  ],
};

const CatalogPage = ({
  title,
  description,
  variant = 'loan',
  items = [],
  categories = PRODUCT_CATEGORIES,
  ctaLabel = 'Подробнее',
  catalogPath = '/',
  catalogLabel = title,
  catalogPrefix = 'offer',
}) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const { isFavorite, toggleFavorite, count } = useFavorites();

  const columns = COLUMNS[variant] || COLUMNS.loan;
  const sortOptions = SORT_OPTIONS[variant] || SORT_OPTIONS.loan;

  const normalized = useMemo(
    () =>
      enrichOffers(items, {
        catalogPath,
        catalogLabel,
        variant,
        prefix: catalogPrefix,
        ctaLabel,
      }),
    [items, catalogPath, catalogLabel, variant, catalogPrefix, ctaLabel]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = normalized.filter((item) => {
      if (onlyFavorites && !isFavorite(item.id)) return false;
      if (!q) return true;
      const hay = [
        item.title,
        item.rate,
        item.sum,
        item.term,
        item.spec,
        item.benefit1,
        item.benefit2,
        item.benefit3,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

    const copy = [...list];
    if (sort === 'name-asc') {
      copy.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    } else if (sort === 'name-desc') {
      copy.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
    } else if (sort === 'spec-asc') {
      copy.sort((a, b) => a.spec.localeCompare(b.spec, 'ru'));
    } else if (sort === 'sum-desc') {
      copy.sort((a, b) => String(b.sum).localeCompare(String(a.sum), 'ru'));
    }
    return copy;
  }, [normalized, query, sort, onlyFavorites, isFavorite]);

  const renderCell = (item, key) => {
    if (key === 'title') {
      return (
        <div className="catalog-offer">
          <span className="catalog-offer__logo">
            <img src={item.image} alt="" />
          </span>
          <div className="catalog-offer__meta">
            <strong>{item.title}</strong>
          </div>
        </div>
      );
    }
    if (key === 'rate') return <span className="catalog-value catalog-value--accent">{item.rate}</span>;
    if (key === 'sum') return <span className="catalog-value catalog-value--strong">{item.sum}</span>;
    if (key === 'term') return <span className="catalog-value">{item.term}</span>;
    if (key === 'benefit1') return <span className="catalog-value catalog-value--accent">{item.benefit1}</span>;
    if (key === 'benefit2') return <span className="catalog-value">{item.benefit2}</span>;
    if (key === 'benefit3') return <span className="catalog-value">{item.benefit3}</span>;
    if (key === 'spec') return <span className="catalog-value catalog-value--accent">{item.spec}</span>;
    return null;
  };

  const renderMobileFacts = (item) => {
    if (variant === 'loan') {
      return (
        <>
          <div><span>Ставка</span><strong>{item.rate}</strong></div>
          <div><span>Сумма</span><strong>{item.sum}</strong></div>
          <div><span>Срок</span><strong>{item.term}</strong></div>
        </>
      );
    }
    if (variant === 'debit') {
      return (
        <>
          <div><span>Преимущество</span><strong>{item.benefit1}</strong></div>
          <div><span>Условие</span><strong>{item.benefit2}</strong></div>
          <div><span>Сервис</span><strong>{item.benefit3}</strong></div>
        </>
      );
    }
    if (variant === 'job' || variant === 'service') {
      return (
        <div><span>Направление</span><strong>{item.spec}</strong></div>
      );
    }
    if (variant === 'shop') {
      return (
        <>
          <div><span>Выгода</span><strong>{item.benefit1}</strong></div>
          <div><span>Условие</span><strong>{item.benefit2}</strong></div>
          <div><span>Сервис</span><strong>{item.benefit3}</strong></div>
        </>
      );
    }
    return null;
  };

  return (
    <main className="catalog">
      <div className="catalog__container">
        <header className="catalog__header">
          <div className="catalog__intro">
            <h1 className="catalog__title">{title}</h1>
            {description ? <p className="catalog__desc">{description}</p> : null}
          </div>
          <div className="catalog__stats">
            <span className="catalog__stat">
              Найдено: <strong>{filtered.length}</strong>
            </span>
            <span className="catalog__stat">
              В избранном: <strong>{count}</strong>
            </span>
          </div>
        </header>

        {categories?.length ? (
          <nav className="catalog__cats" aria-label="Категории">
            {categories.map((cat) => (
              <NavLink
                key={cat.to}
                to={cat.to}
                className={({ isActive }) =>
                  `catalog__cat${isActive ? ' is-active' : ''}`
                }
              >
                {cat.label}
              </NavLink>
            ))}
          </nav>
        ) : null}

        <div className="catalog__toolbar">
          <label className="catalog__search">
            <span className="catalog__sr">Поиск</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16.5 16.5L21 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию и условиям"
            />
          </label>

          <label className="catalog__sort">
            <span>Сортировка</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className={`catalog__fav-filter${onlyFavorites ? ' is-active' : ''}`}
            onClick={() => setOnlyFavorites((value) => !value)}
            aria-pressed={onlyFavorites}
          >
            <HeartIcon filled={onlyFavorites} size={18} />
            Только избранное
          </button>
        </div>

        <div className="catalog__table-wrap">
          <table className="catalog-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                <th className="catalog-table__actions-h">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const fav = isFavorite(item.id);
                return (
                  <tr key={item.id} className={fav ? 'is-fav' : undefined}>
                    {columns.map((column) => (
                      <td key={column.key}>{renderCell(item, column.key)}</td>
                    ))}
                    <td>
                      <div className="catalog-actions">
                        <Link to={`/offer/${item.slug}`} className="catalog-btn">
                          Подробнее
                        </Link>
                        <button
                          type="button"
                          className={`catalog-fav${fav ? ' is-active' : ''}`}
                          aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
                          aria-pressed={fav}
                          onClick={() => toggleFavorite(item.id)}
                        >
                          <HeartIcon filled={fav} size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="catalog-cards">
          {filtered.map((item) => {
            const fav = isFavorite(item.id);
            return (
              <article key={item.id} className={`catalog-card${fav ? ' is-fav' : ''}`}>
                <div className="catalog-card__top">
                  <div className="catalog-offer">
                    <span className="catalog-offer__logo">
                      <img src={item.image} alt="" />
                    </span>
                    <div className="catalog-offer__meta">
                      <strong>{item.title}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`catalog-fav${fav ? ' is-active' : ''}`}
                    aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
                    aria-pressed={fav}
                    onClick={() => toggleFavorite(item.id)}
                  >
                    <HeartIcon filled={fav} size={18} />
                  </button>
                </div>
                <div className="catalog-card__grid">{renderMobileFacts(item)}</div>
                <Link to={`/offer/${item.slug}`} className="catalog-btn catalog-btn--block">
                  Подробнее
                </Link>
              </article>
            );
          })}
        </div>

        {!filtered.length ? (
          <div className="catalog__empty">
            Ничего не найдено. Измените фильтры или поисковый запрос.
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default CatalogPage;
