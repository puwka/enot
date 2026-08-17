import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cmsArchive, cmsCreate, cmsDelete, cmsList, cmsPublish, cmsUnpublish } from '../cms/cmsApi';
import {
  getSiteArticles,
  getSiteNews,
  mergeContentItems,
  toCmsPayloadFromSite,
} from '../cms/siteContent';
import { ConfirmDialog, CmsAlert, CmsLoading, StatusBadge } from '../cms/CmsUi';
import '../cms/Cms.css';

const CmsContentList = ({ entity, title, createPath, editPath }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    const siteItems = entity === 'news' ? getSiteNews() : getSiteArticles();
    setLoading(true);
    setError('');
    try {
      const data = await cmsList(entity);
      setItems(mergeContentItems(data?.items || [], siteItems));
    } catch {
      setItems(siteItems);
      setError('');
    } finally {
      setLoading(false);
    }
  }, [entity]);

  useEffect(() => {
    load();
  }, [load]);

  const importSite = async () => {
    const siteItems = entity === 'news' ? getSiteNews() : getSiteArticles();
    setImporting(true);
    setError('');
    setMessage('');
    try {
      const data = await cmsList(entity);
      const existing = new Set((data?.items || []).map((item) => item.slug));
      let created = 0;
      for (const item of siteItems) {
        if (existing.has(item.slug)) continue;
        await cmsCreate(entity, toCmsPayloadFromSite(item));
        created += 1;
      }
      setMessage(created ? `Импортировано в CMS: ${created}` : 'Все записи сайта уже есть в CMS.');
      await load();
    } catch (err) {
      setError(
        err?.code === 'CMS_NOT_INSTALLED'
          ? 'Сначала выполните supabase/sql/bootstrap_cms_crud.sql'
          : 'Не удалось импортировать в CMS.'
      );
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-panel">
      <div className="cms-toolbar">
        <div className="cms-toolbar__left">
          <strong>{title}</strong>
          <span className="cms-muted">{items.length}</span>
        </div>
        <div className="cms-toolbar__right">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={importSite} disabled={importing}>
            {importing ? 'Импорт…' : 'Импорт с сайта'}
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => navigate(createPath)}>
            Создать
          </button>
        </div>
      </div>
      <CmsAlert>{error}</CmsAlert>
      <CmsAlert type="ok">{message}</CmsAlert>
      {!items.length ? (
        <div className="cms-dash-empty">
          <p>Записей пока нет.</p>
        </div>
      ) : (
        <table className="cms-table">
          <thead>
            <tr>
              <th>Заголовок</th>
              <th>Slug</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isSite = item.source === 'site' || String(item.id).startsWith('site-');
              const editTo = isSite ? `${editPath}/site/${encodeURIComponent(item.slug)}` : `${editPath}/${item.id}`;
              return (
                <tr key={item.id}>
                  <td>
                    <Link to={editTo}>{item.title}</Link>
                  </td>
                  <td>{item.slug}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <div className="cms-table__actions">
                      <button type="button" className="admin-btn admin-btn--ghost" onClick={() => navigate(editTo)}>
                        Изменить
                      </button>
                      {!isSite && item.status !== 'published' ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          onClick={() => cmsPublish(entity, item.id).then(load)}
                        >
                          Publish
                        </button>
                      ) : null}
                      {!isSite && item.status === 'published' ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          onClick={() => cmsUnpublish(entity, item.id).then(load)}
                        >
                          Draft
                        </button>
                      ) : null}
                      {!isSite ? (
                        <>
                          <button
                            type="button"
                            className="admin-btn admin-btn--ghost"
                            onClick={() => cmsArchive(entity, item.id).then(load)}
                          >
                            Archive
                          </button>
                          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setDeleteId(item.id)}>
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
        title="Удалить запись?"
        text="Запись будет удалена из редакции."
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          await cmsDelete(entity, deleteId);
          setDeleteId(null);
          await load();
        }}
      />
    </div>
  );
};

export default CmsContentList;
