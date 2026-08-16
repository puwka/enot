import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getArticleBySlug, getRelatedArticles } from '../data/articles';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { slug } = useParams();
  const article = getArticleBySlug(slug);
  const related = useMemo(() => getRelatedArticles(article, 3), [article]);
  const [tocOpen, setTocOpen] = useState(false);

  if (!article) {
    return <Navigate to="/Education" replace />;
  }

  return (
    <main className="article">
      <div className="article__container">
        <nav className="article-crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <Link to="/Education">Статьи</Link>
          <span aria-hidden="true">/</span>
          <span>{article.title}</span>
        </nav>

        <header className="article-hero">
          <span className="article-hero__tag">{article.category}</span>
          <h1 className="article-hero__title">{article.title}</h1>
          <p className="article-hero__excerpt">{article.excerpt}</p>
          <div className="article-hero__meta">
            <time dateTime={article.dateISO}>{article.date}</time>
            <span>{article.readTime} чтения</span>
          </div>
        </header>

        <div className="article-layout">
          <aside className="article-toc">
            <button
              type="button"
              className="article-toc__toggle"
              aria-expanded={tocOpen}
              onClick={() => setTocOpen((value) => !value)}
            >
              Содержание
              <span aria-hidden="true">{tocOpen ? '−' : '+'}</span>
            </button>
            <div className={`article-toc__panel${tocOpen ? ' is-open' : ''}`}>
              <p className="article-toc__label">Содержание</p>
              <ol>
                {article.toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.title}</a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="article-content">
            <figure className="article-cover">
              <img src={article.cover} alt="" />
            </figure>

            {article.blocks.map((block, index) => {
              if (block.type === 'h2') {
                return (
                  <h2 key={`${block.id}-${index}`} id={block.id}>
                    {block.text}
                  </h2>
                );
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
              if (block.type === 'image') {
                return (
                  <figure key={`img-${index}`} className="article-figure">
                    <img src={block.src} alt={block.alt || ''} />
                  </figure>
                );
              }
              return null;
            })}

            <section className="article-note">
              <h2>Важно знать</h2>
              <p>
                Материал носит справочный характер и не является индивидуальной рекомендацией.
                Перед оформлением продукта уточняйте актуальные условия на сайте банка или компании.
              </p>
              <Link to={article.cta.to} className="article-btn">
                {article.cta.label}
              </Link>
            </section>
          </div>
        </div>

        {related.length ? (
          <section className="article-related">
            <div className="article-related__head">
              <h2>Связанные статьи</h2>
              <Link to="/Education">Все статьи</Link>
            </div>
            <div className="article-related__grid">
              {related.map((item) => (
                <Link key={item.slug} to={`/article/${item.slug}`} className="article-related__card">
                  <span className="article-related__cover">
                    <img src={item.cover} alt="" />
                  </span>
                  <span className="article-related__tag">{item.category}</span>
                  <strong>{item.title}</strong>
                  <span className="article-related__meta">
                    <time dateTime={item.dateISO}>{item.date}</time>
                    <span>{item.readTime}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="article-cta">
          <div>
            <h2>{article.cta.text}</h2>
          </div>
          <Link to={article.cta.to} className="article-btn">
            {article.cta.label}
          </Link>
        </section>
      </div>
    </main>
  );
};

export default ArticleDetail;
