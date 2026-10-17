import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/apiClient';
import { useAdminAuth } from '../AdminAuthContext';
import { CmsAlert, CmsLoading } from '../cms/CmsUi';
import '../cms/Cms.css';

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '—';
  }
};

const CmsAuditPage = () => {
  const { token } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/site/admin/audit?limit=150', { adminToken: token });
      setItems(data?.items || []);
    } catch {
      setError('Не удалось загрузить журнал действий.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-panel">
      <div className="cms-toolbar">
        <div className="cms-toolbar__left">
          <strong>Журнал действий</strong>
          <span className="cms-muted">{items.length}</span>
        </div>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={load}>
          Обновить
        </button>
      </div>
      <CmsAlert>{error}</CmsAlert>
      {!items.length ? (
        <div className="cms-dash-empty">
          <p>Пока нет записей. Действия в CMS появятся здесь автоматически.</p>
        </div>
      ) : (
        <table className="cms-table">
          <thead>
            <tr>
              <th>Когда</th>
              <th>Кто</th>
              <th>Действие</th>
              <th>Сущность</th>
              <th>Детали</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{formatDateTime(item.at)}</td>
                <td>{item.actor}</td>
                <td>{item.action}</td>
                <td>{item.entity || '—'}</td>
                <td>{item.meta || item.entityId || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CmsAuditPage;
