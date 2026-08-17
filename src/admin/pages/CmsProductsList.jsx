import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSiteProducts, PRODUCT_SECTIONS } from '../cms/siteContent';
import { StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const CmsProductsList = ({ sectionKey }) => {
  const navigate = useNavigate();
  const section = PRODUCT_SECTIONS[sectionKey];
  const [query, setQuery] = useState('');

  const items = useMemo(() => {
    const list = getSiteProducts(sectionKey);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.catalog_label || '').toLowerCase().includes(q)
    );
  }, [sectionKey, query]);

  if (!section) {
    return (
      <section className="cms-panel">
        <div className="cms-empty">Раздел продуктов не найден.</div>
      </section>
    );
  }

  return (
    <div className="cms-panel">
      <div className="cms-toolbar">
        <div className="cms-toolbar__left">
          <strong>{section.title}</strong>
          <span className="cms-muted">{items.length} предложений</span>
        </div>
        <div className="cms-toolbar__right">
          <input
            className="cms-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск…"
            style={{ minWidth: 180 }}
          />
        </div>
      </div>
      <p className="cms-panel__lead" style={{ marginTop: 0 }}>
        Каталог с публичного сайта. Откройте карточку, чтобы посмотреть все поля и блоки условий.
      </p>
      {!items.length ? (
        <div className="cms-dash-empty">
          <p>В этом разделе пока нет предложений.</p>
        </div>
      ) : (
        <table className="cms-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Каталог</th>
              <th>Ставка / выгода</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`${section.listPath}/${item.slug}`}>{item.title}</Link>
                </td>
                <td>{item.catalog_label}</td>
                <td>{item.rate_label || item.benefit_1 || '—'}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => navigate(`${section.listPath}/${item.slug}`)}
                  >
                    Открыть
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CmsProductsList;
