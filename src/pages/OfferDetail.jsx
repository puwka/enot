import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  const [offer, setOffer] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const content = useMemo(() => (offer ? buildOfferContent(offer) : null), [offer]);

  useEffect(() => {
    let cancelled = false;
    const decodedSlug = decodeURIComponent(slug || '');
    setOffer(null);
    setRelated([]);
    setLoading(true);

    fetchOfferBySlug(decodedSlug)
      .then(async (dbOffer) => {
        if (cancelled) return;
        setOffer(dbOffer);
        const categorySlug = dbOffer ? CATALOG_PATH_TO_CATEGORY_SLUG[dbOffer.catalogPath] : null;
        if (categorySlug) {
          const relatedItems = await fetchRelatedOffersByCategory(categorySlug, decodedSlug, 4).catch(() => []);
          if (!cancelled && relatedItems.length) setRelated(relatedItems);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        // API down → static fallback; 404 → product really gone
        if (err?.status === 404 || err?.code === 'NOT_FOUND') {
          setOffer(null);
          setRelated([]);
          return;
        }
        const fallback = getOfferBySlug(decodedSlug);
        setOffer(fallback);
        setRelated(fallback ? getRelatedOffers(fallback, 4) : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const [openFaq, setOpenFaq] = useState(0);

  if (loading) {
    return (
      <main className="offer">
        <div className="offer__container">
          <p className="offer-hero__lead">Загрузка предложения…</p>
        </div>
      </main>
    );
  }

  if (!offer || !content) {
    return (
      <main className="offer">
        <div className="offer__container">
          <p className="offer-hero__lead">Предложение не найдено или ещё не опубликовано.</p>
          <Link to="/loans" className="offer-btn offer-btn--primary">
            К каталогу
          </Link>
        </div>
      </main>
    );
  }

  const fav = isFavorite(offer);
  const freeformText = String(offer.conditions || offer.attributes?.conditions_text || '').trim();
  const isFreeformConditions = offer.catalogPath === '/settlement-accounts';
  const showConditions = content.showConditions && (isFreeformConditions ? Boolean(freeformText) : true);
  const showAdvantages = content.showAdvantages && content.advantages.length > 0;
  const showBottomMain = content.showBottomMainInfo && content.mainInfo.length > 0;

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
            {content.heroLead ? <p className="offer-hero__lead">{content.heroLead}</p> : null}
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
                onClick={() => toggleFavorite(offer)}
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

        <section className={`offer-grid${showConditions ? '' : ' offer-grid--single'}`}>
          <div className="offer-panel">
            <h2>Основная информация</h2>
            {content.main.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {showConditions ? (
            <div className="offer-panel">
              <h2>Условия</h2>
              {isFreeformConditions ? (
                <div className="offer-main-text">
                  {freeformText
                    .split(/\n+/)
                    .map((row) => row.trim())
                    .filter(Boolean)
                    .map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
              ) : (
                <ul className="offer-conditions">
                  {content.conditions.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </section>

        {showAdvantages ? (
          <section className="offer-panel">
            <h2>Преимущества</h2>
            <ul className="offer-benefits">
              {content.advantages.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {showBottomMain ? (
          <section className="offer-panel">
            <h2>Основная информация</h2>
            {content.mainInfo.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ) : null}

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
                  <span>{item.rate || item.benefit1 || item.spec || item.catalogLabel}</span>
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
      </div>
    </main>
  );
};

export default OfferDetail;
