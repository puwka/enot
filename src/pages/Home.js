import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Calculator from '../components/Calculator';
import { useFavorites } from '../hooks/useFavorites';
import { getOfferByLink } from '../data/offersRegistry';
import HeartIcon from '../components/HeartIcon';
import heroMascot from '../img_main/image-edited-free (carve.photos).png';
import heroMascotMobile from '../images/enot__png.png';
import catLoansIcon from '../img_main/cat-loans.png';
import catDebitIcon from '../img_main/cat-debit.png';
import catCreditIcon from '../img_main/cat-credit.png';
import catEducationIcon from '../img_main/cat-education.svg';
import catServicesIcon from '../img_main/cat-services.svg';
import catShopsIcon from '../img_main/cat-shops.svg';
import { EDUCATION_ITEMS } from './EducationData';
import { SERVICES_ITEMS } from './Services';
import { SHOPS_ITEMS } from './Shops';
import { fetchCatalogProducts } from '../data/productsRuntimeApi';
import articleCredits from '../img_main/article-credits.png';
import articleCards from '../img_main/article-cards.png';
import articleSecurity from '../img_main/article-security.png';
import vtb from '../images/vtb.webp';
import alfa from '../images/alfa.webp';
import mts from '../images/mts.webp';
import tin from '../images/tbank.webp';
import fora from '../images/fora.webp';
import bars from '../images/bars.webp';
import rus from '../images/rus.webp';
import ural from '../images/ural.webp';
import halva from '../images/halva.webp';
import sov from '../images/sov.webp';
import ren from '../images/renesans.webp';
import atb from '../images/atb.webp';
import './Home.css';

const OFFER_TABS = {
  consumer: {
    label: 'Потребительские кредиты',
    allTo: '/consumer-loans',
    items: [
      { bank: 'Русский Стандарт', type: 'Кредит наличными', image: rus, rate: 'До 65%', sum: '30 000 – 3 млн ₽', term: 'До 60 мес.', payment: 'от 8 900 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6459&p=10695&erid=2W5zFH1t71s' },
      { bank: 'Совкомбанк', type: 'Кредит наличными', image: sov, rate: 'До 30%', sum: '30 000 – 5 млн ₽', term: 'До 5 лет', payment: 'от 7 200 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5199&p=10695&erid=2W5zFGFFjxt' },
      { bank: 'Ренессанс Банк', type: 'Кредит наличными', image: ren, rate: 'До 40%', sum: '30 000 – 2 млн ₽', term: 'До 84 мес.', payment: 'от 6 450 ₽', link: 'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6138&p=10695&erid=2W5zFJeimse' },
      { bank: 'АТБ', type: 'Кредит наличными', image: atb, rate: 'До 39%', sum: '30 000 – 5 млн ₽', term: 'До 84 мес.', payment: 'от 6 800 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=2583&p=10695&erid=LjN8KGDaw' },
      { bank: 'Т-Банк', type: 'Рефинансирование', image: tin, rate: 'До 40%', sum: '50 000 – 5 млн ₽', term: 'До 5 лет', payment: 'от 9 100 ₽', link: 'https://my.saleads.pro/s/gf6yt?erid=2VtzqvB9uxS' },
    ],
  },
  cards: {
    label: 'Дебетовые карты',
    allTo: '/cards',
    items: [
      { bank: 'ВТБ', type: 'Дебетовая карта', image: vtb, rate: 'Кешбэк до 3 000 ₽', sum: 'Бесплатная доставка', term: 'Бесплатно', payment: '—', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7332&p=10695&erid=2W5zFJuUpi5' },
      { bank: 'Альфа-Банк', type: 'Апельсиновая карта', image: alfa, rate: 'Кешбэк до 7%', sum: 'Баллы до 100%', term: 'Бесплатно', payment: '—', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7049&p=10695&erid=2W5zFHrdQPS' },
      { bank: 'МТС Деньги', type: 'Дебетовая карта', image: mts, rate: 'До 10 000 ₽', sum: '5% супермаркеты', term: '30% на связь', payment: '—', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6766&p=10695&erid=2W5zFFy4MBv' },
      { bank: 'Фора-Банк', type: 'Все включено', image: fora, rate: 'До 10 000 ₽', sum: 'До 40% в магазинах', term: 'Бесплатно', payment: '—', link: 'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6236&p=10695&erid=LjN8KXfdi' },
      { bank: 'Т-Банк', type: 'Drive', image: tin, rate: 'До 10% АЗС', sum: 'До 5% авто', term: '1% прочее', payment: '—', link: 'https://my.saleads.pro/s/dcJ8k?erid=2Vtzqvk9Tcz' },
    ],
  },
  credit: {
    label: 'Кредитные карты',
    allTo: '/auto-loans',
    items: [
      { bank: 'АК Барс', type: '115 дней', image: bars, rate: 'До 115 дней без %', sum: '10 000 – 1 млн ₽', term: 'До 5 лет', payment: 'от 3 500 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6474&p=10695&erid=2W5zFHxn2e4' },
      { bank: 'Русский Стандарт', type: 'Кредитная карта', image: rus, rate: 'До 59%', sum: '30 000 – 1 млн ₽', term: 'До 5 лет', payment: 'от 4 200 ₽', link: 'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6460&p=10695&erid=2W5zFH3N6JD' },
      { bank: 'Уралсиб', type: 'Кредитная карта', image: ural, rate: 'От 34,9%', sum: '10 000 – 5 млн ₽', term: 'До 5 лет', payment: 'от 5 100 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5567&p=10695&erid=2W5zFJjKetp' },
      { bank: 'Халва', type: 'Рассрочка', image: halva, rate: 'До 15%', sum: '10 000 – 100 000 ₽', term: 'До 7 лет', payment: 'от 2 800 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=2413&p=10695&erid=LjN8KTAzF' },
      { bank: 'Т-Банк', type: 'Drive', image: tin, rate: 'До 62%', sum: '15 000 – 1 млн ₽', term: '5 лет', payment: 'от 4 900 ₽', link: 'https://my.saleads.pro/s/ounml?erid=2VtzqvRynmt' },
    ],
  },
  education: {
    label: 'Обучение',
    allTo: '/obuchenie',
    items: EDUCATION_ITEMS.slice(0, 5).map((item) => ({
      bank: item.naprav,
      type: 'Курс',
      image: item.image,
      rate: 'Онлайн',
      sum: 'Запись на сайте',
      term: 'Гибкий график',
      payment: '—',
      link: item.link,
    })),
  },
  services: {
    label: 'Сервисы',
    allTo: '/services',
    items: SERVICES_ITEMS.slice(0, 5).map((item) => ({
      bank: item.nameis,
      type: item.spec,
      image: item.image,
      rate: 'Подработка',
      sum: 'Гибкий график',
      term: 'Онлайн-заявка',
      payment: '—',
      link: item.link,
    })),
  },
  shops: {
    label: 'Магазины',
    allTo: '/shops',
    items: SHOPS_ITEMS.slice(0, 5).map((item) => ({
      bank: item.bank,
      type: 'Кешбэк',
      image: item.image,
      rate: item.opis,
      sum: item.opis1,
      term: item.opis2,
      payment: '—',
      link: item.link,
    })),
  },
};

const Home = () => {
  const [activeTab, setActiveTab] = useState('consumer');
  const { isFavorite, toggleFavorite } = useFavorites();
  const current = OFFER_TABS[activeTab];

  useEffect(() => {
    const prefetch = () => {
      ['loans', 'debit-cards', 'credit-cards'].forEach((slug) => {
        fetchCatalogProducts(slug).catch(() => {});
      });
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(prefetch, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = window.setTimeout(prefetch, 400);
    return () => window.clearTimeout(timerId);
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
            <Link to="/consumer-loans" className="home-cat" style={{ '--reveal-delay': '60ms' }}>
              <span className="home-cat__icon" aria-hidden="true">
                <img src={catLoansIcon} alt="" />
              </span>
              <span className="home-cat__text">
                <strong>Потребительские кредиты</strong>
                <span>Сравните ставки и условия лучших банков</span>
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
            {['consumer', 'cards', 'credit', 'education', 'services', 'shops'].map((key) => (
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

          <div className="home-table-wrap" key={activeTab}>
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
                  const matched = getOfferByLink(item.link);
                  const favId = matched?.id || item.link;
                  const fav = isFavorite(favId);
                  return (
                  <tr
                    key={`${activeTab}-${item.bank}-${index}`}
                    className="home-table__row-anim"
                    style={{ '--row-delay': `${index * 55}ms` }}
                  >
                    <td>
                      <div className="home-table__bank">
                        <span className="home-table__num">{index + 1}</span>
                        <img src={item.image} alt="" />
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
                        {matched ? (
                          <Link to={`/offer/${matched.slug}`} className="home-btn home-btn--primary home-btn--sm">
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
                          onClick={() => toggleFavorite(favId)}
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

          <div className="home-offer-mobile" key={`m-${activeTab}`}>
            {current.items.map((item, index) => (
              <article
                key={`m-${activeTab}-${item.bank}-${index}`}
                className="home-offer-mobile__card home-table__row-anim"
                style={{ '--row-delay': `${index * 55}ms` }}
              >
                <div className="home-table__bank">
                  <span className="home-table__num">{index + 1}</span>
                  <img src={item.image} alt="" />
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
                {(() => {
                  const matched = getOfferByLink(item.link);
                  return matched ? (
                    <Link to={`/offer/${matched.slug}`} className="home-btn home-btn--primary home-btn--block">
                      Подробнее
                    </Link>
                  ) : (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="home-btn home-btn--primary home-btn--block">
                      Подробнее
                    </a>
                  );
                })()}
              </article>
            ))}
          </div>

          <p className="home-table__note">
            Рейтинг составлен на основе ставок и условий банков на 31.07.2026.
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
