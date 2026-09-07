import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Calculator from '../components/Calculator';
import { useFavorites } from '../hooks/useFavorites';
import HeartIcon from '../components/HeartIcon';
import heroMascot from '../img_main/image-edited-free (carve.photos).png';
import heroMascotMobile from '../images/enot__png.png';
import catLoansIcon from '../img_main/cat-loans.png';
import catDebitIcon from '../img_main/cat-debit.png';
import catCreditIcon from '../img_main/cat-credit.png';
import catEducationIcon from '../img_main/cat-education.svg';
import catServicesIcon from '../img_main/cat-services.svg';
import catShopsIcon from '../img_main/cat-shops.svg';
import { fetchCatalogProducts } from '../data/productsRuntimeApi';
import articleCredits from '../img_main/article-credits.png';
import articleCards from '../img_main/article-cards.png';
import articleSecurity from '../img_main/article-security.png';
import './Home.css';

const OFFER_TABS = {
  loans: {
    label: 'Микрозаймы',
    allTo: '/loans',
    category: 'loans',
  },
  consumer: {
    label: 'Потреб. кредиты',
    allTo: '/consumer-loans',
    category: 'consumer-loans',
  },
  collateral: {
    label: 'Под залог',
    allTo: '/collateral-loans',
    category: 'collateral-loans',
  },
  cards: {
    label: 'Дебетовые карты',
    allTo: '/cards',
    category: 'debit-cards',
  },
  credit: {
    label: 'Кредитные карты',
    allTo: '/auto-loans',
    category: 'credit-cards',
  },
  settlement: {
    label: 'Расчётные счета',
    allTo: '/settlement-accounts',
    category: 'settlement-accounts',
  },
  education: {
    label: 'Обучение',
    allTo: '/obuchenie',
    category: 'obuchenie',
  },
  services: {
    label: 'Сервисы',
    allTo: '/services',
    category: 'services',
  },
  shops: {
    label: 'Магазины',
    allTo: '/shops',
    category: 'shops',
  },
  jobs: {
    label: 'Вакансии',
    allTo: '/Job',
    category: 'jobs',
  },
};

const OFFER_TAB_KEYS = [
  'loans',
  'consumer',
  'collateral',
  'cards',
  'credit',
  'settlement',
  'education',
  'services',
  'shops',
  'jobs',
];

const mapCmsToHomeItem = (row) => ({
  bank: row.bank || row.title,
  type: row.spec || row.catalogLabel || '',
  image: row.image,
  rate: row.rate || row.benefit1 || '—',
  sum: row.sum || row.benefit2 || '—',
  term: row.term || row.benefit3 || '—',
  payment: row.payment || '—',
  link: row.link,
  slug: row.slug,
  id: row.id || row.slug,
  catalogPath: row.catalogPath,
  catalogLabel: row.catalogLabel,
  title: row.title,
});

const Home = () => {
  const [activeTab, setActiveTab] = useState('loans');
  const [cmsTabItems, setCmsTabItems] = useState({});
  const [tabsReady, setTabsReady] = useState({});
  const { isFavorite, toggleFavorite } = useFavorites();
  const baseTab = OFFER_TABS[activeTab];
  const current = {
    ...baseTab,
    items: tabsReady[activeTab] ? cmsTabItems[activeTab] || [] : [],
  };

  const favoritePayload = (item) => ({
    title: item.title || item.bank,
    image: item.image,
    link: item.link,
    rate: item.rate,
    sum: item.sum,
    term: item.term,
    catalogPath: item.catalogPath || current.allTo,
    catalogLabel: item.catalogLabel || current.label,
    slug: item.slug || undefined,
    id: item.id || item.slug || item.link,
  });

  useEffect(() => {
    let cancelled = false;
    OFFER_TAB_KEYS.forEach((tabKey) => {
      const categorySlug = OFFER_TABS[tabKey].category;
      fetchCatalogProducts(categorySlug, { featured: true })
        .then((rows) => {
          if (cancelled || !Array.isArray(rows)) return;
          setCmsTabItems((prev) => ({
            ...prev,
            [tabKey]: rows.slice(0, 8).map(mapCmsToHomeItem),
          }));
          setTabsReady((prev) => ({ ...prev, [tabKey]: true }));
        })
        .catch(() => {
          if (cancelled) return;
          setCmsTabItems((prev) => ({ ...prev, [tabKey]: [] }));
          setTabsReady((prev) => ({ ...prev, [tabKey]: true }));
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll('.home-reveal');
    if (!nodes.length) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -40px 0px' }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="home">
      <section className="home-hero">
        <div className="container home-hero__layout">
          <div className="home-hero__copy">
            <h1 className="home-hero__title">
              Сравнивайте финансы
              <br />
              и выбирайте уверенно
            </h1>
            <p className="home-hero__lead">
              Актуальные предложения банков по кредитам, дебетовым и кредитным картам в одном месте.
            </p>
            <div className="home-hero__cta">
              <Link to="/loans" className="home-btn home-btn--primary">
                Подобрать кредит
              </Link>
              <Link to="/cards" className="home-btn home-btn--secondary">
                Смотреть карты
              </Link>
            </div>
            <ul className="home-hero__perks">
              <li>
                <span className="home-hero__perk-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12 3l7 3v5c0 5-3.2 8.6-7 10-3.8-1.4-7-5-7-10V6l7-3z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Только проверенные предложения
              </li>
              <li>
                <span className="home-hero__perk-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 8v4l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                Без скрытых условий и комиссий
              </li>
              <li>
                <span className="home-hero__perk-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M4 12h16M12 4v16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                Обновляем данные ежедневно
              </li>
            </ul>
          </div>

          <div className="home-hero__stage">
            <div className="home-hero__visual">
              <picture className="home-hero__mascot-wrap">
                <source media="(max-width: 768px)" srcSet={heroMascotMobile} />
                <img
                  src={heroMascot}
                  alt=""
                  className="home-hero__mascot"
                  aria-hidden="true"
                />
              </picture>
              <div className="home-hero__calc">
                <Calculator
                  title="Калькулятор кредита"
                  showPurpose
                  showRangeLabels
                  ctaTo="/loans"
                  ctaLabel="Показать предложения"
                  footnote="Расчёт предварительный"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-block home-reveal">
        <div className="container">
          <h2 className="home-block__title">Популярные категории</h2>
          <div className="home-cats">
            <Link to="/loans" className="home-cat" style={{ '--reveal-delay': '60ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catLoansIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Микрозаймы</strong>
                <span>Быстрые займы на карту от МФО</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/consumer-loans" className="home-cat" style={{ '--reveal-delay': '100ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catLoansIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Потребительские кредиты</strong>
                <span>Сравните ставки и условия лучших банков</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/collateral-loans" className="home-cat" style={{ '--reveal-delay': '120ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catLoansIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Кредиты под залог</strong>
                <span>Под залог ПТС, авто и недвижимости</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/cards" className="home-cat" style={{ '--reveal-delay': '140ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catDebitIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Дебетовые карты</strong>
                <span>Кэшбэк, проценты на остаток и бесплатное обслуживание</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/auto-loans" className="home-cat" style={{ '--reveal-delay': '220ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catCreditIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Кредитные карты</strong>
                <span>Льготный период и выгодные условия</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/settlement-accounts" className="home-cat" style={{ '--reveal-delay': '260ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catDebitIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Расчётные счета</strong>
                <span>РКО и счета для бизнеса</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/obuchenie" className="home-cat" style={{ '--reveal-delay': '300ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catEducationIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Обучение</strong>
                <span>Курсы, переподготовка и онлайн-школы</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/services" className="home-cat" style={{ '--reveal-delay': '380ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catServicesIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Сервисы</strong>
                <span>Доставка, подработка и бытовые услуги</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/shops" className="home-cat" style={{ '--reveal-delay': '460ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catShopsIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Магазины</strong>
                <span>Кешбэк и выгода при покупках у партнёров</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
            <Link to="/Job" className="home-cat" style={{ '--reveal-delay': '520ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catServicesIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Вакансии</strong>
                <span>Работа и подработка у партнёров</span>
              </span>
              <span className="home-cat__chevron" aria-hidden="true">›</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="home-block home-block--offers home-reveal">
        <div className="container">
          <div className="home-block__head">
            <h2 className="home-block__title">Лучшие предложения</h2>
            <Link to={current.allTo} className="home-block__more">
              Смотреть все
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          <div className="home-tabs" role="tablist">
            {OFFER_TAB_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                className={`home-tabs__item${activeTab === key ? ' is-active' : ''}`}
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
              >
                {OFFER_TABS[key].label}
              </button>
            ))}
          </div>

          {!current.items.length ? (
            <div className="home-offers-empty">
              {tabsReady[activeTab]
                ? 'Пока нет продуктов с галочкой «Показывать в Лучших предложениях». Откройте продукт в админке, включите галочку, статус «Опубликовано» и «Показывать на сайте», затем сохраните.'
                : 'Загрузка предложений…'}
            </div>
          ) : null}

          <div className="home-table-wrap" key={activeTab} hidden={!current.items.length}>
            <table className="home-table">
              <thead>
                <tr>
                  <th>Банк</th>
                  <th>Ставка от</th>
                  <th>Сумма</th>
                  <th>Срок</th>
                  <th>Ежемесячный платёж</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {current.items.map((item, index) => {
                  const payload = favoritePayload(item);
                  const fav = isFavorite(payload);
                  const detailTo = item.slug ? `/offer/${encodeURIComponent(item.slug)}` : null;
                  return (
                  <tr
                    key={`${activeTab}-${item.slug || item.bank}-${index}`}
                    className="home-table__row-anim"
                    style={{ '--row-delay': `${index * 55}ms` }}
                  >
                    <td>
                      <div className="home-table__bank">
                        <span className="home-table__num">{index + 1}</span>
                        {item.image ? <img src={item.image} alt="" /> : null}
                        <div>
                          <strong>{item.bank}</strong>
                          <span>{item.type}</span>
                        </div>
                      </div>
                    </td>
                    <td><strong>{item.rate}</strong></td>
                    <td><strong>{item.sum}</strong></td>
                    <td><strong>{item.term}</strong></td>
                    <td><strong>{item.payment}</strong></td>
                    <td>
                      <div className="home-table__actions">
                        {detailTo ? (
                          <Link to={detailTo} className="home-btn home-btn--primary home-btn--sm">
                            Подробнее
                          </Link>
                        ) : (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="home-btn home-btn--primary home-btn--sm">
                            Подробнее
                          </a>
                        )}
                        <button
                          type="button"
                          className={`home-fav${fav ? ' is-active' : ''}`}
                          aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
                          aria-pressed={fav}
                          onClick={() => toggleFavorite(payload)}
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

          <div className="home-offer-mobile" key={`m-${activeTab}`} hidden={!current.items.length}>
            {current.items.map((item, index) => {
              const detailTo = item.slug ? `/offer/${encodeURIComponent(item.slug)}` : null;
              return (
              <article
                key={`m-${activeTab}-${item.slug || item.bank}-${index}`}
                className="home-offer-mobile__card home-table__row-anim"
                style={{ '--row-delay': `${index * 55}ms` }}
              >
                <div className="home-table__bank">
                  <span className="home-table__num">{index + 1}</span>
                  {item.image ? <img src={item.image} alt="" /> : null}
                  <div>
                    <strong>{item.bank}</strong>
                    <span>{item.type}</span>
                  </div>
                </div>
                <div className="home-offer-mobile__grid">
                  <div><span>Ставка от</span><strong>{item.rate}</strong></div>
                  <div><span>Сумма</span><strong>{item.sum}</strong></div>
                  <div><span>Срок</span><strong>{item.term}</strong></div>
                  <div><span>Ежемесячный платёж</span><strong>{item.payment}</strong></div>
                </div>
                {detailTo ? (
                  <Link to={detailTo} className="home-btn home-btn--primary home-btn--block">
                    Подробнее
                  </Link>
                ) : (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="home-btn home-btn--primary home-btn--block">
                    Подробнее
                  </a>
                )}
              </article>
              );
            })}
          </div>

          <p className="home-table__note">
            В блоке показываются только продукты с галочкой «Показывать в Лучших предложениях на главной» в админке.
          </p>
        </div>
      </section>

      <section className="home-block home-reveal">
        <div className="container">
          <div className="home-block__head">
            <h2 className="home-block__title">Учитесь и принимайте финансовые решения</h2>
            <Link to="/news" className="home-block__more">
              Все новости
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <div className="home-posts">
            <article className="home-post home-reveal" style={{ '--reveal-delay': '80ms' }}>
              <div className="home-post__cover">
                <img src={articleCredits} alt="" />
              </div>
              <div className="home-post__body">
                <span className="home-post__tag">Рынок</span>
                <h3>Банки обновили условия по кредитам: что важно знать в августе</h3>
                <div className="home-post__meta">
                  <Link to="/news/usloviya-kreditov-avgust-2026">
                    Читать
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
            <article className="home-post home-reveal" style={{ '--reveal-delay': '160ms' }}>
              <div className="home-post__cover">
                <img src={articleCards} alt="" />
              </div>
              <div className="home-post__body">
                <span className="home-post__tag">Карты</span>
                <h3>Новые категории кэшбэка: какие карты выгоднее в повседневных тратах</h3>
                <div className="home-post__meta">
                  <Link to="/news/keshbek-karty-novye-kategorii">
                    Читать
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
            <article className="home-post home-reveal" style={{ '--reveal-delay': '240ms' }}>
              <div className="home-post__cover">
                <img src={articleSecurity} alt="" />
              </div>
              <div className="home-post__body">
                <span className="home-post__tag">Безопасность</span>
                <h3>Мошенники усиливают схемы: простые правила защиты счетов летом</h3>
                <div className="home-post__meta">
                  <Link to="/news/bezopasnost-platezhey-leto-2026">
                    Читать
                    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="home-block home-block--info home-reveal">
        <div className="container">
          <div className="home-info">
            <span className="home-info__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path d="M12 3l10 18H2L12 3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M12 10v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="17" r="1" fill="currentColor" />
              </svg>
            </span>
            <div className="home-info__content">
              <h3 className="home-info__title">Важно знать</h3>
              <p className="home-info__text">
                Информация на сайте носит справочный характер и не является публичной офертой.
                Условия, ставки и тарифы банков могут измениться.
                Перед оформлением продукта уточняйте актуальные условия на сайте банка.
              </p>
            </div>
            <Link to="/faq" className="home-btn home-btn--ghost">Подробнее</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
