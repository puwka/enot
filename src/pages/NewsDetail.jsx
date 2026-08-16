import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getNewsBySlug, getRelatedNews } from '../data/news';
import vkIcon from '../images/vkontakte.png';
import tgIcon from '../images/telega.png';
import maxIcon from '../images/max.png';
import './Home.css';
import './NewsDetail.css';

const SHARE_LINKS = [
  {
    id: 'tg',
    label: 'Telegram',
    src: tgIcon,
    href: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    id: 'vk',
    label: 'ВКонтакте',
    src: vkIcon,
    href: (url) => `https://vk.com/share.php?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'max',
    label: 'MAX',
    src: maxIcon,
    href: () => 'https://max.ru/join/ABBu3RDHXvg7o3V7RB0i0JE1rxw2ZYTbkEzYAliHJo4',
  },
];

const NewsDetail = () => {
  const { slug } = useParams();
  const news = getNewsBySlug(slug);
  const related = useMemo(() => getRelatedNews(news, 3), [news]);
  const [tocOpen, setTocOpen] = useState(false);

  if (!news) {
    return <Navigate to="/news" replace />;
  }

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://enotmani.ru/news/${news.slug}`;

  return (
    <main className="news">
      <div className="news__container">
        <nav className="news-crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <Link to="/news">Новости</Link>
          <span aria-hidden="true">/</span>
          <span>{news.title}</span>
        </nav>

        <header className="news-head">
          <div className="news-head__meta">
            <span className="news-head__tag">{news.category}</span>
            <time dateTime={news.dateISO}>{news.date}</time>
            <span>{news.readTime} чтения</span>
          </div>
          <h1 className="news-head__title">{news.title}</h1>
          <p className="news-head__lead">{news.lead}</p>
        </header>

        <figure className="news-hero">
          <img src={news.cover} alt="" />
        </figure>

        <div className="news-layout">
          <article className="news-body">
            {news.blocks.map((block, index) => {
              if (block.type === 'h2') {
                return (
                  <h2 key={`${block.id}-${index}`} id={block.id}>
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'h3') {
                return <h3 key={`h3-${index}`}>{block.text}</h3>;
              }
              if (block.type === 'p') {
                return <p key={`p-${index}`}>{block.text}</p>;
              }
              if (block.type === 'ul') {
                return (
                  <ul key={`ul-${index}`}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                );
              }
              if (block.type === 'ol') {
                return (
                  <ol key={`ol-${index}`}>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                );
              }
              if (block.type === 'quote') {
                return (
                  <blockquote key={`q-${index}`} className="news-quote">
                    {block.text}
                  </blockquote>
                );
              }
              if (block.type === 'warning') {
                return (
                  <aside key={`w-${index}`} className="news-alert">
                    <strong>{block.title}</strong>
                    <p>{block.text}</p>
                  </aside>
                );
              }
              if (block.type === 'facts') {
                return (
                  <div key={`f-${index}`} className="news-facts">
                    {block.items.map((item) => (
                      <article key={item.title} className="news-facts__item">
                        <strong>{item.title}</strong>
                        <p>{item.text}</p>
                      </article>
                    ))}
                  </div>
                );
              }
              return null;
            })}

            <section className="news-note">
              <h2>Важно знать</h2>
              <p>
                Материал подготовлен сервисом ЕнотМани и носит справочный характер.
                Перед оформлением продукта уточняйте актуальные условия на сайте банка.
              </p>
            </section>
          </article>

          <aside className="news-side">
            <div className="news-side__sticky">
              <div className="news-toc">
                <button
                  type="button"
                  className="news-toc__toggle"
                  aria-expanded={tocOpen}
                  onClick={() => setTocOpen((value) => !value)}
                >
                  Содержание
                  <span aria-hidden="true">{tocOpen ? '−' : '+'}</span>
                </button>
                <div className={`news-toc__panel${tocOpen ? ' is-open' : ''}`}>
                  <p className="news-toc__label">Содержание</p>
                  <ol>
                    {news.toc.map((item, index) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`}>
                          <span>{index + 1}.</span>
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="news-side-card">
                <p className="news-side-card__label">Ключевые факты</p>
                <ul>
                  {news.facts.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="news-share">
                <p className="news-share__label">Поделиться</p>
                <div className="news-share__list">
                  {SHARE_LINKS.map((item) => (
                    <a
                      key={item.id}
                      href={item.href(pageUrl, news.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="news-share__btn"
                      aria-label={item.label}
                    >
                      <img src={item.src} alt="" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {related.length ? (
          <section className="news-related">
            <div className="news-related__head">
              <h2>Читайте также</h2>
              <Link to="/news" className="news-related__more">
                Все новости
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
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
            <div className="news-related__grid">
              {related.map((item) => (
                <article key={item.slug} className="home-post">
                  <Link to={`/news/${item.slug}`} className="home-post__cover">
                    <img src={item.cover} alt="" />
                  </Link>
                  <div className="home-post__body">
                    <span className="home-post__tag">{item.category}</span>
                    <h3>
                      <Link to={`/news/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <div className="home-post__meta">
                      <time dateTime={item.dateISO}>{item.date}</time>
                      <span>{item.readTime}</span>
                      <Link to={`/news/${item.slug}`}>
                        Читать
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
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="news-cta">
          <div>
            <h2>{news.cta.text}</h2>
          </div>
          <Link to={news.cta.to} className="btn btn--primary">
            {news.cta.label}
          </Link>
        </section>
      </div>
    </main>
  );
};

export default NewsDetail;
