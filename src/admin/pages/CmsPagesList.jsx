import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cmsDelete, cmsList, cmsPublish, cmsUnpublish, cmsArchive } from '../cms/cmsApi';
import { getSitePages, mergePageItems } from '../cms/siteContent';
import { ConfirmDialog, CmsAlert, CmsLoading } from '../cms/CmsUi';
import '../cms/Cms.css';

const CmsPagesList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const sitePages = getSitePages();
    try {
      const data = await cmsList('pages');
      setItems(mergePageItems(data?.items || [], sitePages));
    } catch (err) {
      setItems(sitePages);
      if (err?.code === 'INVALID_SESSION') {
        setError('Сессия истекла. Войдите снова.');
      } else if (err?.code === 'CMS_NOT_INSTALLED') {
        setError('');
      } else {
        setError('');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async () => {
    try {
      await cmsDelete('pages', deleteId);
      setDeleteId(null);
      await load();
    } catch {
      setError('Не удалось удалить страницу.');
      setDeleteId(null);
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-panel">
      <div className="cms-toolbar">
        <div className="cms-toolbar__left">
          <strong>Страницы сайта</strong>
          <span className="cms-muted">{items.length}</span>
        </div>
        <div className="cms-toolbar__right">
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => navigate('/admin/pages/new')}>
            Создать страницу
          </button>
        </div>
      </div>
      <CmsAlert>{error}</CmsAlert>
      {!items.length ? (
        <div className="cms-dash-empty">
          <p>Страниц пока нет. Создайте первую.</p>
        </div>
      ) : (
        <table className="cms-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Slug</th>
              <th>Блоки</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isSite = item.source === 'site' || String(item.id).startsWith('site-');
              const editTo = isSite ? `/admin/pages/site/${encodeURIComponent(item.slug)}` : `/admin/pages/${item.id}`;
              const blockCount = Array.isArray(item.blocks)
                ? item.blocks.length
                : getSitePages().find((page) => page.slug === item.slug)?.blocks?.length || 0;
              return (
                <tr key={item.id}>
                  <td>
                    <Link to={editTo}>{item.title}</Link>
                  </td>
                  <td>/{item.slug === 'home' ? '' : item.slug}</td>
                  <td>{blockCount}</td>
                  <td>
                    <div className="cms-table__actions">
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate(editTo)}>
                        Блоки
                      </button>
                      {!isSite && item.status !== 'published' ? (
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => cmsPublish('pages', item.id).then(load)}>
                          Опубликовать
                        </button>
                      ) : null}
                      {!isSite && item.status === 'published' ? (
                        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => cmsUnpublish('pages', item.id).then(load)}>
                          Снять
                        </button>
                      ) : null}
                      {!isSite ? (
                        <>
                          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => cmsArchive('pages', item.id).then(load)}>
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
        title="Удалить страницу?"
        text="Страница будет скрыта из CMS. Действие можно считать необратимым для редакции."
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
      />
    </div>
  );
};

export default CmsPagesList;
