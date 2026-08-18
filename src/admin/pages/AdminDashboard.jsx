import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminDashboard } from '../adminApi';

const formatNumber = (value) =>
  new Intl.NumberFormat('ru-RU').format(Math.max(0, Number(value) || 0));

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '—';
  }
};

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

const ActivityList = ({ items, emptyText }) => {
  if (!items?.length) return <EmptyList text={emptyText} />;
  return (
    <ul className="cms-dash-list">
      {items.map((item) => (
        <li key={item.id}>
          <div>
            <strong>{item.actor}</strong>
            <span>
              {item.action}
              {item.meta ? ` · ${item.meta}` : ''}
              {item.entity ? ` · ${item.entity}` : ''}
            </span>
          </div>
          <em>{formatDateTime(item.at)}</em>
        </li>
      ))}
    </ul>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await adminDashboard();
      setData(payload);
    } catch (err) {
      setData(null);
      if (err?.code === 'INVALID_SESSION') {
        setError('Сессия истекла. Войдите снова.');
      } else if (err?.code === 'ADMIN_CONFIG_MISSING') {
        setError('Supabase не настроен.');
      } else {
        setError('Не удалось загрузить данные. Попробуйте обновить страницу.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

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

  const users = data?.users || { total: 0, today: 0, week: 0 };
  const content = data?.content || { news: 0, articles: 0, pages: 0 };
  const products = data?.products || { active: 0, inactive: 0 };
  const bonuses = data?.bonuses || { turnover: 0, credited: 0, debited: 0 };
  const userActivity = data?.userActivity || [];
  const adminActivity = data?.adminActivity || [];
  const recentChanges = data?.recentChanges || [];
  const productsTotal = (Number(products.active) || 0) + (Number(products.inactive) || 0);

  return (
    <div className="cms-dash">
      <div className="cms-dash-intro">
        <div>
          <h2>Обзор за сегодня</h2>
          <p>Сводка по пользователям, контенту и продуктам. Отсюда обычно начинают рабочий день.</p>
        </div>
        <div className="cms-dash-intro__meta">
          <span>Текущий месяц</span>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={load}>
            Обновить
          </button>
          <Link className="admin-btn admin-btn--primary" to="/admin/pages">
            К страницам
          </Link>
        </div>
      </div>

      <div className="cms-kpi">
        <article className="cms-kpi__item">
          <span>Пользователи</span>
          <strong>{formatNumber(users.total)}</strong>
          <em>+{formatNumber(users.week)} за неделю</em>
        </article>
        <article className="cms-kpi__item">
          <span>Новости</span>
          <strong>{formatNumber(content.news)}</strong>
          <em>
            {formatNumber(content.articles)} статей · {formatNumber(content.pages)} страниц
          </em>
        </article>
        <article className="cms-kpi__item">
          <span>Продукты</span>
          <strong>{formatNumber(productsTotal)}</strong>
          <em>{formatNumber(products.active)} активных</em>
        </article>
        <article className="cms-kpi__item">
          <span>Бонусы</span>
          <strong>{formatNumber(bonuses.turnover)}</strong>
          <em>{formatNumber(bonuses.credited)} начислено за период</em>
        </article>
      </div>

      <section>
        <div className="cms-dash-section__head">
          <h2>Последние изменения</h2>
        </div>
        {recentChanges.length ? (
          <ul className="cms-dash-list">
            {recentChanges.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.actor}</strong>
                  <span>
                    {item.action}
                    {item.entity ? ` «${item.entity}»` : ''}
                  </span>
                </div>
                <em>{formatDateTime(item.at)}</em>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyList text="Изменений пока нет." />
        )}
      </section>

      <div className="cms-dash__split">
        <section>
          <div className="cms-dash-section__head">
            <h2>Активность пользователей</h2>
          </div>
          <ActivityList items={userActivity} emptyText="Пока нет действий пользователей." />
        </section>
        <section>
          <div className="cms-dash-section__head">
            <h2>Активность администраторов</h2>
          </div>
          <ActivityList items={adminActivity} emptyText="Пока нет действий администраторов." />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
