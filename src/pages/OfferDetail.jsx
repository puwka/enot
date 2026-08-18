import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getOfferBySlug, getRelatedOffers } from '../data/offersRegistry';
import {
  CATALOG_PATH_TO_CATEGORY_SLUG,
  fetchOfferBySlug,
  fetchRelatedOffersByCategory,
} from '../data/productsRuntimeApi';
import { buildOfferContent } from '../utils/offers';
import { useFavorites } from '../hooks/useFavorites';
import HeartIcon from '../components/HeartIcon';
import './OfferDetail.css';

const OfferDetail = () => {
  const { slug } = useParams();
  const [runtimeOffer, setRuntimeOffer] = useState(undefined);
  const [runtimeRelated, setRuntimeRelated] = useState([]);
  const offer = runtimeOffer === undefined ? getOfferBySlug(slug) : runtimeOffer || getOfferBySlug(slug);
  const relatedFallback = useMemo(() => getRelatedOffers(offer, 4), [offer]);
  const related = runtimeRelated.length ? runtimeRelated : relatedFallback;
  const content = useMemo(() => (offer ? buildOfferContent(offer) : null), [offer]);
  useEffect(() => {
    let cancelled = false;
    const staticOffer = getOfferBySlug(slug);
    const categorySlug = staticOffer ? CATALOG_PATH_TO_CATEGORY_SLUG[staticOffer.catalogPath] : null;
    const relatedPromise = categorySlug
      ? fetchRelatedOffersByCategory(categorySlug, slug, 4).catch(() => [])
      : Promise.resolve([]);

    Promise.all([fetchOfferBySlug(slug), relatedPromise])
      .then(([dbOffer, related]) => {
        if (cancelled) return;
        setRuntimeOffer(dbOffer);
        if (related.length) setRuntimeRelated(related);
      })
      .catch(() => {
        if (!cancelled) {
          setRuntimeOffer(null);
          setRuntimeRelated([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const [openFaq, setOpenFaq] = useState(0);

  if (!offer || !content) {
    return <Navigate to="/loans" replace />;
  }

  const fav = isFavorite(offer.id);

  return (
    <main className="offer">
      <div className="offer__container">
        <nav className="offer-crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <Link to={offer.catalogPath}>{offer.catalogLabel}</Link>
          <span aria-hidden="true">/</span>
          <span>{offer.title}</span>
        </nav>

        <section className="offer-hero">
          <div className="offer-hero__text">
            <p className="offer-hero__eyebrow">{content.heroEyebrow}</p>
            <h1 className="offer-hero__title">{offer.title}</h1>
            <p className="offer-hero__lead">{content.heroLead}</p>
            <div className="offer-hero__actions">
              <a
                href={offer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="offer-btn offer-btn--primary"
              >
                {offer.ctaLabel}
              </a>
              <button
                type="button"
                className={`offer-btn offer-btn--ghost${fav ? ' is-active' : ''}`}
                onClick={() => toggleFavorite(offer.id)}
                aria-pressed={fav}
              >
                <HeartIcon filled={fav} size={18} />
                {fav ? 'В избранном' : 'В избранное'}
              </button>
            </div>
          </div>
          <div className="offer-hero__logo">
            <img src={offer.image} alt="" />
          </div>
        </section>

        <section className="offer-specs" aria-label="Ключевые характеристики">
          {content.specs.map((spec) => (
            <article key={spec.label} className="offer-spec">
              <span>{spec.label}</span>
              <strong>{spec.value}</strong>
            </article>
          ))}
        </section>

        <section className="offer-grid">
          <div className="offer-panel">
            <h2>Основная информация</h2>
            {content.main.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="offer-panel">
            <h2>Условия</h2>
            <ul className="offer-conditions">
              {content.conditions.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="offer-panel">
          <h2>Преимущества</h2>
          <ul className="offer-benefits">
            {content.advantages.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {related.length ? (
          <section className="offer-related">
            <div className="offer-related__head">
              <h2>Связанные предложения</h2>
              <Link to={offer.catalogPath}>Все в разделе</Link>
            </div>
            <div className="offer-related__grid">
              {related.map((item) => (
                <Link key={item.slug} to={`/offer/${item.slug}`} className="offer-related__card">
                  <span className="offer-related__logo">
                    <img src={item.image} alt="" />
                  </span>
                  <strong>{item.title}</strong>
                  <span>
                    {item.rate || item.benefit1 || item.spec || item.catalogLabel}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="offer-panel offer-faq">
          <h2>FAQ</h2>
          <div className="offer-faq__list">
            {content.faq.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.q} className={`offer-faq__item${open ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="offer-faq__q"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? -1 : index)}
                  >
                    {item.q}
                    <span aria-hidden="true">{open ? '−' : '+'}</span>
                  </button>
                  {open ? <p className="offer-faq__a">{item.a}</p> : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="offer-extras">
          {content.extras.map((block) => (
            <article key={block.title} className="offer-panel">
              <h2>{block.title}</h2>
              <p>{block.text}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default OfferDetail;
