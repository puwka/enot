import { useCallback, useEffect, useState } from 'react';
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
            <span>{item.action}{item.meta ? ` · ${item.meta}` : ''}{item.entity ? ` · ${item.entity}` : ''}</span>
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
        <section className="cms-panel">
          <SkeletonBlock />
        </section>
        <div className="cms-dash__grid cms-dash__grid--3">
          <article className="cms-stat"><SkeletonBlock /></article>
          <article className="cms-stat"><SkeletonBlock /></article>
          <article className="cms-stat"><SkeletonBlock /></article>
        </div>
        <div className="cms-dash__split">
          <section className="cms-panel"><SkeletonBlock /></section>
          <section className="cms-panel"><SkeletonBlock /></section>
        </div>
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

  return (
    <div className="cms-dash">
      <section className="cms-panel">
        <div className="cms-dash-section__head">
          <h2>Пользователи</h2>
        </div>
        <div className="cms-dash__grid cms-dash__grid--3">
          <article className="cms-stat">
            <span>Всего</span>
            <strong>{formatNumber(users.total)}</strong>
          </article>
          <article className="cms-stat">
            <span>Новых сегодня</span>
            <strong>{formatNumber(users.today)}</strong>
          </article>
          <article className="cms-stat">
            <span>Новых за неделю</span>
            <strong>{formatNumber(users.week)}</strong>
          </article>
        </div>
      </section>

      <div className="cms-dash__split">
        <section className="cms-panel">
          <div className="cms-dash-section__head">
            <h2>Контент</h2>
          </div>
          <div className="cms-dash__grid cms-dash__grid--3">
            <article className="cms-stat cms-stat--compact">
              <span>Новости</span>
              <strong>{formatNumber(content.news)}</strong>
            </article>
            <article className="cms-stat cms-stat--compact">
              <span>Статьи</span>
              <strong>{formatNumber(content.articles)}</strong>
            </article>
            <article className="cms-stat cms-stat--compact">
              <span>Страницы</span>
              <strong>{formatNumber(content.pages)}</strong>
            </article>
          </div>
        </section>

        <section className="cms-panel">
          <div className="cms-dash-section__head">
            <h2>Продукты</h2>
          </div>
          <div className="cms-dash__grid cms-dash__grid--2">
            <article className="cms-stat cms-stat--compact">
              <span>Активные</span>
              <strong>{formatNumber(products.active)}</strong>
            </article>
            <article className="cms-stat cms-stat--compact">
              <span>Неактивные</span>
              <strong>{formatNumber(products.inactive)}</strong>
            </article>
          </div>
        </section>
      </div>

      <section className="cms-panel">
        <div className="cms-dash-section__head">
          <h2>Бонусы</h2>
        </div>
        <div className="cms-dash__grid cms-dash__grid--3">
          <article className="cms-stat">
            <span>Общий оборот</span>
            <strong>{formatNumber(bonuses.turnover)}</strong>
          </article>
          <article className="cms-stat">
            <span>Начислено</span>
            <strong>{formatNumber(bonuses.credited)}</strong>
          </article>
          <article className="cms-stat">
            <span>Списано</span>
            <strong>{formatNumber(bonuses.debited)}</strong>
          </article>
        </div>
      </section>

      <div className="cms-dash__split">
        <section className="cms-panel">
          <div className="cms-dash-section__head">
            <h2>Активность пользователей</h2>
          </div>
          <ActivityList items={userActivity} emptyText="Пока нет действий пользователей." />
        </section>
        <section className="cms-panel">
          <div className="cms-dash-section__head">
            <h2>Активность администраторов</h2>
          </div>
          <ActivityList items={adminActivity} emptyText="Пока нет действий администраторов." />
        </section>
      </div>

      <section className="cms-panel">
        <div className="cms-dash-section__head">
          <h2>Последние изменения</h2>
        </div>
        {recentChanges.length ? (
          <div className="cms-dash-table">
            <div className="cms-dash-table__head">
              <span>Кто</span>
              <span>Что изменил</span>
              <span>Когда</span>
            </div>
            {recentChanges.map((item) => (
              <div key={item.id} className="cms-dash-table__row">
                <strong>{item.actor}</strong>
                <span>{item.action}{item.entity ? ` · ${item.entity}` : ''}</span>
                <em>{formatDateTime(item.at)}</em>
              </div>
            ))}
          </div>
        ) : (
          <EmptyList text="Изменений пока нет." />
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
