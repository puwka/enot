import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getSiteProductBySlug, PRODUCT_SECTIONS } from '../cms/siteContent';
import { StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const CmsProductEdit = ({ sectionKey }) => {
  const { id: slug } = useParams();
  const navigate = useNavigate();
  const section = PRODUCT_SECTIONS[sectionKey];
  const item = useMemo(() => getSiteProductBySlug(slug), [slug]);

  if (!section) {
    return (
      <section className="cms-panel">
        <div className="cms-empty">Раздел не найден.</div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="cms-panel">
        <p>Продукт не найден.</p>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate(section.listPath)}>
          Назад к списку
        </button>
      </section>
    );
  }

  const blocks = [
    { label: 'Ставка / условие', value: item.rate_label },
    { label: 'Срок', value: item.term_label },
    { label: 'Сумма / лимит', value: item.amount_label },
    { label: 'Преимущество 1', value: item.benefit_1 },
    { label: 'Преимущество 2', value: item.benefit_2 },
    { label: 'Преимущество 3', value: item.benefit_3 },
    { label: 'Доп. спецификация', value: item.spec },
  ].filter((row) => row.value);

  return (
    <div className="cms-dash">
      <section className="cms-panel">
        <div className="cms-toolbar">
          <div className="cms-toolbar__left">
            <StatusBadge status={item.status} />
            <strong>{item.title}</strong>
          </div>
          <div className="cms-toolbar__right">
            <Link className="admin-btn admin-btn--ghost" to={section.listPath}>
              К списку
            </Link>
            {item.partner_url ? (
              <a className="admin-btn admin-btn--primary" href={item.partner_url} target="_blank" rel="noreferrer">
                Партнёрская ссылка
              </a>
            ) : null}
          </div>
        </div>

        <div className="cms-form">
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Название</span>
              <input value={item.title} readOnly />
            </label>
            <label className="cms-field">
              <span>Slug</span>
              <input value={item.slug} readOnly />
            </label>
          </div>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Каталог</span>
              <input value={item.catalog_label || ''} readOnly />
            </label>
            <label className="cms-field">
              <span>Путь каталога</span>
              <input value={item.catalog_path || ''} readOnly />
            </label>
          </div>
          <label className="cms-field">
            <span>Партнёрский URL</span>
            <input value={item.partner_url || ''} readOnly />
          </label>
          {item.image_url ? (
            <div className="cms-field">
              <span>Изображение</span>
              <div style={{ marginTop: 8 }}>
                <img src={item.image_url} alt="" style={{ maxWidth: 180, borderRadius: 12 }} />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="cms-panel">
        <h2 style={{ marginTop: 0, fontSize: 17 }}>Блоки условий</h2>
        <p className="cms-panel__lead">Ключевые поля предложения, как на сайте.</p>
        <div className="cms-blocks" style={{ marginTop: 14 }}>
          {blocks.map((block) => (
            <div key={block.label} className="cms-block">
              <div className="cms-block__head">
                <span className="cms-block__title">{block.label}</span>
              </div>
              <p style={{ margin: 0 }}>{block.value}</p>
            </div>
          ))}
          {!blocks.length ? <div className="cms-dash-empty">Дополнительные блоки не заданы.</div> : null}
        </div>
      </section>
    </div>
  );
};

export default CmsProductEdit;
