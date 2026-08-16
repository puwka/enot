import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ARTICLES, ARTICLE_CATEGORIES } from '../data/articles';
import { EDUCATION_ITEMS, EDUCATION_CATALOG } from './EducationData';
import { enrichOffers } from '../utils/offers';
import './Articles.css';

const SORT_OPTIONS = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'old', label: 'Сначала старые' },
  { value: 'read', label: 'По времени чтения' },
];

const parseReadMinutes = (value = '') => {
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const Articles = () => {
  const [category, setCategory] = useState('Все');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('new');
  const [showCourses, setShowCourses] = useState(true);

  const courseCards = useMemo(
    () =>
      enrichOffers(EDUCATION_ITEMS, {
        catalogPath: EDUCATION_CATALOG.path,
        catalogLabel: EDUCATION_CATALOG.label,
        variant: EDUCATION_CATALOG.variant,
        prefix: EDUCATION_CATALOG.prefix,
        ctaLabel: EDUCATION_CATALOG.ctaLabel,
      }).map((item, index) => ({
        kind: 'course',
        slug: item.slug,
        title: item.title,
        category: 'Курсы',
        date: '01.06.2026',
        dateISO: '2026-06-01',
        readTime: 'Обзор',
        cover: item.image,
        excerpt: 'Направление обучения — подробности и запись на странице предложения.',
        to: `/offer/${item.slug}`,
        order: index,
      })),
    []
  );

  const articleCards = useMemo(
    () =>
      ARTICLES.map((item) => ({
        kind: 'article',
        slug: item.slug,
        title: item.title,
        category: item.category,
        date: item.date,
        dateISO: item.dateISO,
        readTime: item.readTime,
        cover: item.cover,
        excerpt: item.excerpt,
        to: `/article/${item.slug}`,
      })),
    []
  );

  const categories = useMemo(() => {
    const base = ARTICLE_CATEGORIES.filter((item) => item !== 'Все');
    return ['Все', ...base, 'Курсы'];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...articleCards];
    if (showCourses) list = [...list, ...courseCards];

    list = list.filter((item) => {
      if (category !== 'Все' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      if (sort === 'read') {
        return parseReadMinutes(a.readTime) - parseReadMinutes(b.readTime);
      }
      const da = new Date(a.dateISO).getTime();
      const db = new Date(b.dateISO).getTime();
      return sort === 'old' ? da - db : db - da;
    });

    return list;
  }, [articleCards, courseCards, category, query, sort, showCourses]);

  return (
    <main className="articles">
      <div className="articles__container">
        <header className="articles__header">
          <div>
            <h1 className="articles__title">Статьи и обучение</h1>
            <p className="articles__lead">
              Полезные материалы о кредитах, картах и безопасности — а также направления обучения.
            </p>
          </div>
          <Link to="/consumer-loans" className="articles-btn">
            Подобрать кредит
          </Link>
        </header>

        <div className="articles__cats" role="tablist" aria-label="Категории">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={category === item}
              className={`articles__cat${category === item ? ' is-active' : ''}`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="articles__filters">
          <label className="articles__search">
            <span className="visually-hidden">Поиск</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по статьям и курсам"
            />
          </label>
          <label className="articles__sort">
            <span>Сортировка</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="articles__toggle">
            <input
              type="checkbox"
              checked={showCourses}
              onChange={(event) => setShowCourses(event.target.checked)}
            />
            Показывать курсы
          </label>
        </div>

        <div className="articles__grid">
          {filtered.map((item) => (
            <article key={`${item.kind}-${item.slug}`} className="articles-card">
              <Link to={item.to} className="articles-card__cover">
                <img src={item.cover} alt="" />
              </Link>
              <div className="articles-card__body">
                <span className="articles-card__tag">{item.category}</span>
                <h2>
                  <Link to={item.to}>{item.title}</Link>
                </h2>
                <p>{item.excerpt}</p>
                <div className="articles-card__meta">
                  <time dateTime={item.dateISO}>{item.date}</time>
                  <span>{item.readTime}</span>
                </div>
                <Link to={item.to} className="articles-card__cta">
                  {item.kind === 'course' ? 'Подробнее' : 'Читать'}
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        {!filtered.length ? (
          <div className="articles__empty">Ничего не найдено. Измените фильтры или запрос.</div>
        ) : null}

        <section className="articles-banner">
          <div>
            <h2>Сравните предложения банков</h2>
            <p>Кредиты, дебетовые и кредитные карты — условия в одном месте.</p>
          </div>
          <div className="articles-banner__actions">
            <Link to="/loans" className="articles-btn">
              К кредитам
            </Link>
            <Link to="/cards" className="articles-btn articles-btn--ghost">
              К картам
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Articles;
