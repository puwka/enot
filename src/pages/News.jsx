import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NEWS } from '../data/news';
import { fetchNewsList, mergeNewsItems } from '../data/newsRuntimeApi';
import './NewsDetail.css';
import './Home.css';

const News = () => {
  const [items, setItems] = useState(NEWS);

  useEffect(() => {
    let active = true;
    fetchNewsList().then((cmsItems) => {
      if (!active || !cmsItems.length) return;
      setItems(mergeNewsItems(NEWS, cmsItems));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="news">
      <div className="news__container">
        <nav className="news-crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <span>Новости</span>
        </nav>

        <header className="news-head">
          <h1 className="news-head__title">Новости</h1>
          <p className="news-head__lead">
            Актуальные материалы о кредитах, картах и финансовой безопасности — в стиле сервиса ЕнотМани.
          </p>
        </header>

        <div className="news-related__grid news-list-grid">
          {items.map((item) => (
            <article key={item.slug} className="home-post">
              <Link to={`/news/${item.slug}`} className="home-post__cover">
                <img src={item.cover} alt="" />
              </Link>
              <div className="home-post__body">
                <span className="home-post__tag">{item.category}</span>
                <h3>
                  <Link to={`/news/${item.slug}`}>{item.title}</Link>
                </h3>
                <p className="news-list-excerpt">{item.lead}</p>
                <div className="home-post__meta">
                  {item.date ? <time dateTime={item.dateISO}>{item.date}</time> : null}
                  {item.readTime ? <span>{item.readTime}</span> : null}
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

        <section className="news-cta">
          <div>
            <h2>Сравните предложения банков</h2>
          </div>
          <Link to="/loans" className="btn btn--primary">
            К кредитам
          </Link>
        </section>
      </div>
    </main>
  );
};

export default News;
