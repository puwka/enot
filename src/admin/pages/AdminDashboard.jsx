import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../lib/apiClient';
import { getAdminToken } from '../adminApi';
import { useAdminAuth } from '../AdminAuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const CHART_COLORS = [
  '#12b5a2',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
  '#ec4899',
  '#64748b',
  '#0d9b8a',
  '#2563eb',
  '#d97706',
];

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

const DonutChart = ({ items, totalLabel = 'всего' }) => {
  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const radius = 54;
  const stroke = 18;
  const circ = 2 * Math.PI * radius;

  let offset = 0;
  const segments = items.map((item, index) => {
    const value = Number(item.value) || 0;
    const len = total > 0 ? (value / total) * circ : 0;
    const seg = {
      ...item,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
      dash: `${len} ${circ - len}`,
      offset,
      pct: total > 0 ? Math.round((value / total) * 100) : 0,
    };
    offset -= len;
    return seg;
  });

  return (
    <div className="cms-donut">
      <div className="cms-donut__visual">
        <svg viewBox="0 0 140 140" width="160" height="160" aria-hidden="true">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
          {segments.map((seg) =>
            seg.value > 0 ? (
              <circle
                key={seg.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={stroke}
                strokeDasharray={seg.dash}
                strokeDashoffset={seg.offset}
                strokeLinecap="butt"
                transform="rotate(-90 70 70)"
              />
            ) : null
          )}
        </svg>
        <div className="cms-donut__center">
          <strong>{formatNumber(total)}</strong>
          <span>{totalLabel}</span>
        </div>
      </div>
      <ul className="cms-donut__legend">
        {segments.map((seg) => (
          <li key={seg.label}>
            <span className="cms-donut__swatch" style={{ background: seg.color }} />
            <span className="cms-donut__name">{seg.label}</span>
            <em>
              {formatNumber(seg.value)} · {seg.pct}%
            </em>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BarList = ({ items, emptyText, valueKey = 'clicks' }) => {
  if (!items?.length) return <EmptyList text={emptyText} />;
  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);
  return (
    <ul className="cms-bar-list">
      {items.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const width = Math.max(4, Math.round((value / max) * 100));
        const color = CHART_COLORS[index % CHART_COLORS.length];
        return (
          <li key={item.label}>
            <div className="cms-bar-list__meta">
              <strong>{item.label}</strong>
              <em>{formatNumber(value)}</em>
            </div>
            <div className="cms-bar-list__track" aria-hidden="true">
              <span style={{ width: `${width}%`, background: color }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const AdminDashboard = () => {
  const { token, loading: authLoading } = useAdminAuth();
  const { settings } = useSiteSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const adminToken = token || getAdminToken();
    if (!adminToken) {
      setData(null);
      setError('Сессия истекла. Войдите снова.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = await apiFetch('/site/admin/stats', { adminToken });
      setData(payload);
    } catch (err) {
      setData(null);
      if (err?.code === 'INVALID_SESSION') {
        setError('Сессия истекла. Войдите снова.');
      } else if (err?.code === 'FORBIDDEN') {
        setError(err?.message || 'Нет прав. Выполните npm run db:migrate на сервере.');
      } else {
        setError('Не удалось загрузить статистику. Проверьте API и миграции.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  const catalog = data?.catalog || [];
  const clicks = data?.clicks || { totals: {}, byBank: [], byCategory: [] };
  const totals = clicks.totals || {};

  const catalogSlices = useMemo(
    () =>
      catalog
        .map((row) => ({
          label: row.title || row.slug,
          value: Number(row.total) || 0,
          slug: row.slug,
        }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value),
    [catalog]
  );

  const clickCategorySlices = useMemo(
    () =>
      (clicks.byCategory || []).map((row) => ({
        label: row.label,
        value: Number(row.clicks) || 0,
      })),
    [clicks.byCategory]
  );

  const productsTotal = catalogSlices.reduce((sum, row) => sum + row.value, 0);
  const featuredTotal = catalog.reduce((sum, row) => sum + (Number(row.featured) || 0), 0);
  const version = settings?.app?.version || '1.1.0';

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

  return (
    <div className="cms-dash">
      <div className="cms-dash-intro">
        <div>
          <h2>Дашборд статистики</h2>
          <p>
            Сколько продуктов в каждой категории и сколько кликов по банкам. Версия:{' '}
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
          <span>Продуктов на сайте</span>
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
          <em>по кнопкам «Оформить»</em>
        </article>
        <article className="cms-kpi__item">
          <span>Категорий</span>
          <strong>{formatNumber(catalogSlices.length)}</strong>
          <em>с опубликованными продуктами</em>
        </article>
      </div>

      <div className="cms-dash__split">
        <section>
          <div className="cms-dash-section__head">
            <h2>Продукты по категориям</h2>
          </div>
          {catalogSlices.length ? (
            <DonutChart items={catalogSlices} totalLabel="продуктов" />
          ) : (
            <EmptyList text="Пока нет опубликованных продуктов." />
          )}
        </section>
        <section>
          <div className="cms-dash-section__head">
            <h2>Клики по категориям</h2>
          </div>
          {clickCategorySlices.length ? (
            <DonutChart items={clickCategorySlices} totalLabel="кликов" />
          ) : (
            <EmptyList text="Кликов по категориям пока нет — появятся после нажатий «Оформить»." />
          )}
        </section>
      </div>

      <div className="cms-dash__split">
        <section>
          <div className="cms-dash-section__head">
            <h2>Клики по банкам</h2>
          </div>
          <BarList items={clicks.byBank} emptyText="Кликов по банкам пока нет." />
        </section>
        <section>
          <div className="cms-dash-section__head">
            <h2>Количество по разделам</h2>
          </div>
          <BarList
            items={catalogSlices.map((row) => ({ label: row.label, clicks: row.value }))}
            emptyText="Нет данных по разделам."
          />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
