import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getArticleBySlug, getRelatedArticles } from '../data/articles';
import { fetchArticleBySlug } from '../data/articlesRuntimeApi';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { slug } = useParams();
  const staticArticle = useMemo(() => getArticleBySlug(slug), [slug]);
  const [article, setArticle] = useState(staticArticle);
  const [loading, setLoading] = useState(!staticArticle);
  const [tocOpen, setTocOpen] = useState(false);
  const related = useMemo(() => getRelatedArticles(article, 3), [article]);

  useEffect(() => {
    let active = true;
    setLoading(!staticArticle);
    fetchArticleBySlug(slug).then((cmsArticle) => {
      if (!active) return;
      if (cmsArticle) setArticle(cmsArticle);
      else if (staticArticle) setArticle(staticArticle);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [slug, staticArticle]);

  if (loading) {
    return (
      <main className="article">
        <div className="article__container">
          <p>Загрузка…</p>
        </div>
      </main>
    );
  }

  if (!article) {
    return <Navigate to="/Education" replace />;
  }

  const blocks = Array.isArray(article.blocks) ? article.blocks : [];
  const toc = Array.isArray(article.toc) ? article.toc : [];

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
            {article.date ? <time dateTime={article.dateISO}>{article.date}</time> : null}
            {article.readTime ? <span>{article.readTime} чтения</span> : null}
          </div>
        </header>

        <div className="article-layout">
          {toc.length ? (
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
                  {toc.map((item) => (
                    <li key={item.id || item.title}>
                      <a href={`#${item.id}`}>{item.title}</a>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          ) : null}

          <div className="article-content">
            {article.cover ? (
              <figure className="article-cover">
                <img src={article.cover} alt="" />
              </figure>
            ) : null}
            {blocks.length ? (
              blocks.map((block, index) => {
                if (block.type === 'h2') {
                  return (
                    <h2 key={`${block.id || 'h2'}-${index}`} id={block.id}>
                      {block.text}
                    </h2>
                  );
                }
                if (block.type === 'h3') return <h3 key={`h3-${index}`}>{block.text}</h3>;
                if (block.type === 'p') return <p key={`p-${index}`}>{block.text}</p>;
                if (block.type === 'ul') {
                  return (
                    <ul key={`ul-${index}`}>
                      {(block.items || []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === 'ol') {
                  return (
                    <ol key={`ol-${index}`}>
                      {(block.items || []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  );
                }
                if (block.type === 'quote') {
                  return (
                    <blockquote key={`q-${index}`}>{block.text}</blockquote>
                  );
                }
                return null;
              })
            ) : (
              <p>{article.excerpt}</p>
            )}
          </div>
        </div>

        {related.length ? (
          <section className="article-related">
            <h2>Читайте также</h2>
            <div className="article-related__grid">
              {related.map((item) => (
                <Link key={item.slug} to={`/article/${item.slug}`} className="article-related__card">
                  <strong>{item.title}</strong>
                  <span>{item.category}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
};

export default ArticleDetail;
