import { Link } from 'react-router-dom';
import { NEWS } from '../data/news';
import './NewsDetail.css';
import './Home.css';

const News = () => (
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
        {NEWS.map((item) => (
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

export default News;
