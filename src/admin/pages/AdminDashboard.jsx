import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/apiClient';
import { useAdminAuth } from '../AdminAuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const formatNumber = (value) =>
  new Intl.NumberFormat('ru-RU').format(Math.max(0, Number(value) || 0));

const SkeletonBlock = () => (
  <div className="cms-dash-skeleton" aria-hidden="true">
    <span />
    <span />
    <span />
  </div>
);

const EmptyList = ({ text }) => (
  <div className="cms-dash-empty">
    <p>{text}</p>
  </div>
);

const BarList = ({ items, emptyText }) => {
  if (!items?.length) return <EmptyList text={emptyText} />;
  const max = Math.max(...items.map((item) => Number(item.clicks) || 0), 1);
  return (
    <ul className="cms-bar-list">
      {items.map((item) => {
        const clicks = Number(item.clicks) || 0;
        const width = Math.max(4, Math.round((clicks / max) * 100));
        return (
          <li key={item.label}>
            <div className="cms-bar-list__meta">
              <strong>{item.label}</strong>
              <em>{formatNumber(clicks)}</em>
            </div>
            <div className="cms-bar-list__track" aria-hidden="true">
              <span style={{ width: `${width}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const AdminDashboard = () => {
  const { token } = useAdminAuth();
  const { settings } = useSiteSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await apiFetch('/site/admin/stats', { adminToken: token });
      setData(payload);
    } catch (err) {
      setData(null);
      if (err?.code === 'INVALID_SESSION') {
        setError('Сессия истекла. Войдите снова.');
      } else {
        setError('Не удалось загрузить статистику. Попробуйте обновить страницу.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="cms-dash">
        <SkeletonBlock />
        <SkeletonBlock />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cms-dash">
        <section className="cms-panel cms-panel--error">
          <h2>Не удалось загрузить данные</h2>
          <p className="cms-panel__lead">{error}</p>
          <button type="button" className="admin-btn admin-btn--primary" onClick={load}>
            Обновить
          </button>
        </section>
      </div>
    );
  }

  const catalog = data?.catalog || [];
  const clicks = data?.clicks || { totals: {}, byBank: [], byCategory: [] };
  const totals = clicks.totals || {};
  const productsTotal = catalog.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
  const featuredTotal = catalog.reduce((sum, row) => sum + (Number(row.featured) || 0), 0);
  const version = settings?.app?.version || '1.1.0';

  return (
    <div className="cms-dash">
      <div className="cms-dash-intro">
        <div>
          <h2>Обзор каталога и кликов</h2>
          <p>
            Сводка по опубликованным продуктам и переходам «Оформить». Версия продукта:{' '}
            <strong>v{version}</strong>
          </p>
        </div>
        <div className="cms-dash-intro__meta">
          <span>Клики за 30 дней</span>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={load}>
            Обновить
          </button>
          <Link className="admin-btn admin-btn--primary" to="/admin/settings/site">
            Настройки сайта
          </Link>
        </div>
      </div>

      <div className="cms-kpi">
        <article className="cms-kpi__item">
          <span>Продукты в каталоге</span>
          <strong>{formatNumber(productsTotal)}</strong>
          <em>{formatNumber(featuredTotal)} в «Лучших»</em>
        </article>
        <article className="cms-kpi__item">
          <span>Клики сегодня</span>
          <strong>{formatNumber(totals.clicks_today)}</strong>
          <em>{formatNumber(totals.clicks_week)} за неделю</em>
        </article>
        <article className="cms-kpi__item">
          <span>Клики всего</span>
          <strong>{formatNumber(totals.total_clicks)}</strong>
          <em>по кнопкам оформления</em>
        </article>
        <article className="cms-kpi__item">
          <span>Категорий</span>
          <strong>{formatNumber(catalog.length)}</strong>
          <em>с активными продуктами</em>
        </article>
      </div>

      <section>
        <div className="cms-dash-section__head">
          <h2>Продукты по категориям</h2>
        </div>
        {catalog.length ? (
          <div className="cms-dash-table">
            <div className="cms-dash-table__head">
              <span>Категория</span>
              <span>Всего</span>
              <span>Лучшие</span>
            </div>
            {catalog.map((row) => (
              <div className="cms-dash-table__row" key={row.slug}>
                <strong>{row.title || row.slug}</strong>
                <em>{formatNumber(row.total)}</em>
                <em>{formatNumber(row.featured)}</em>
              </div>
            ))}
          </div>
        ) : (
          <EmptyList text="В каталоге пока нет опубликованных продуктов." />
        )}
      </section>

      <div className="cms-dash__split">
        <section>
          <div className="cms-dash-section__head">
            <h2>Клики по банкам</h2>
          </div>
          <BarList items={clicks.byBank} emptyText="Кликов по банкам пока нет." />
        </section>
        <section>
          <div className="cms-dash-section__head">
            <h2>Клики по категориям</h2>
          </div>
          <BarList items={clicks.byCategory} emptyText="Кликов по категориям пока нет." />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
