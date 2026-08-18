import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cmsList, cmsDelete, cmsPublish, cmsUnpublish, cmsArchive } from '../cms/cmsApi';
import { PRODUCT_SECTIONS } from '../cms/productSections';
import { getSiteProducts, mergeProductItems } from '../cms/siteContent';
import { CmsAlert, CmsLoading, ConfirmDialog, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const CmsProductsList = ({ sectionKey }) => {
  const navigate = useNavigate();
  const section = PRODUCT_SECTIONS[sectionKey];
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    if (!section) return;
    setLoading(true);
    setError('');
    const siteItems = getSiteProducts(sectionKey);
    try {
      const data = await cmsList('products');
      const cmsItems = (data?.items || []).filter((item) =>
        (section.categorySlugs || [section.categorySlug]).includes(item.category_slug)
      );
      setItems(mergeProductItems(cmsItems, siteItems));
    } catch {
      setItems(siteItems);
      setError('');
    } finally {
      setLoading(false);
    }
  }, [section, sectionKey]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        String(item.title || '').toLowerCase().includes(q) ||
        String(item.slug || '').toLowerCase().includes(q) ||
        String(item.bank_name || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  if (!section) {
    return (
      <section className="cms-panel">
        <div className="cms-empty">Раздел продуктов не найден.</div>
      </section>
    );
  }

  const onDelete = async () => {
    try {
      await cmsDelete('products', deleteId);
      setDeleteId(null);
      await load();
    } catch {
      setError('Не удалось удалить продукт.');
      setDeleteId(null);
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-panel">
      <div className="cms-toolbar">
        <div className="cms-toolbar__left">
          <strong>{section.title}</strong>
          <span className="cms-muted">{filtered.length} предложений</span>
        </div>
        <div className="cms-toolbar__right">
          <input
            className="cms-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск…"
            style={{ minWidth: 180 }}
          />
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => navigate(`${section.listPath}/new`)}
          >
            Добавить
          </button>
        </div>
      </div>
      <CmsAlert>{error}</CmsAlert>
      {!filtered.length ? (
        <div className="cms-dash-empty">
          <p>В этом разделе пока нет предложений.</p>
        </div>
      ) : (
        <table className="cms-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Банк</th>
              <th>Тип</th>
              <th>Ставка</th>
              <th>Active</th>
              <th>Featured</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isSite = item.source === 'site' || String(item.id).startsWith('site-');
              const editId = encodeURIComponent(item.id);
              return (
              <tr key={item.id}>
                <td>
                  <Link to={`${section.listPath}/${editId}`}>{item.title}</Link>
                </td>
                <td>{item.bank_name || '—'}</td>
                <td>{item.product_type || item.catalog_label || '—'}</td>
                <td>{item.apr_rate != null ? `${item.apr_rate}%` : item.rate_label || '—'}</td>
                <td>{item.active ? 'Да' : 'Нет'}</td>
                <td>{item.featured ? 'Да' : 'Нет'}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>
                  <div className="cms-table__actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      onClick={() => navigate(`${section.listPath}/${editId}`)}
                    >
                      Открыть
                    </button>
                    {!isSite && item.status !== 'published' ? (
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => cmsPublish('products', item.id).then(load)}>
                        Опубликовать
                      </button>
                    ) : null}
                    {!isSite && item.status === 'published' ? (
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => cmsUnpublish('products', item.id).then(load)}>
                        Снять
                      </button>
                    ) : null}
                    {!isSite ? (
                      <>
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => cmsArchive('products', item.id).then(load)}>
                          В архив
                        </button>
                        <button type="button" className="admin-btn admin-btn--danger" onClick={() => setDeleteId(item.id)}>
                          Удалить
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Удалить продукт?"
        text="Продукт будет скрыт из CMS."
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </div>
  );
};

export default CmsProductsList;
