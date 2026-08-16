import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BONUS_CONFIG, formatPoints, pointsToRubles } from '../config/bonuses';
import { ALL_OFFERS } from '../data/offersRegistry';
import { useFavorites } from '../hooks/useFavorites';

const AccountOverview = () => {
  const { user, claimBonus } = useAuth();
  const { favorites } = useFavorites();
  if (!user) return null;

  const balance = user.bonusBalance || 0;
  const nextLevel = BONUS_CONFIG.nextLevelStep;
  const progress = Math.min(100, Math.round((balance % nextLevel) / nextLevel * 100));
  const toNext = nextLevel - (balance % nextLevel);
  const apps = user.applications || { total: 0, approved: 0, rejected: 0 };
  const approval = apps.total ? Math.round((apps.approved / apps.total) * 100) : 0;
  const recentBonuses = (user.bonusHistory || []).slice(0, 4);
  const favItems = ALL_OFFERS.filter((item) => favorites.includes(item.id)).slice(0, 3);
  const initials = (user.name || 'U').trim().charAt(0).toUpperCase();
  const tasks = Object.values(BONUS_CONFIG.actions).slice(0, 4);

  return (
    <>
      <section className="cabinet-hero">
        <div className="cabinet-panel">
          <div className="cabinet-welcome">
            <div className="cabinet-avatar">
              {user.avatar ? <img src={user.avatar} alt="" /> : initials}
            </div>
            <div>
              <h1 className="cabinet-welcome__title">Здравствуйте, {user.name || 'друг'}</h1>
              <div className="cabinet-welcome__meta">
                {user.email}
                {user.phone ? ` · ${user.phone}` : ''}
                {' · '}
                Аккаунт активен
              </div>
            </div>
          </div>
        </div>

        <div className="cabinet-panel cabinet-bonus">
          <h2>Мои бонусы</h2>
          <div className="cabinet-bonus__value">{formatPoints(balance)} баллов</div>
          <p className="cabinet-bonus__eq">≈ {formatPoints(pointsToRubles(balance))} ₽</p>
          <div className="cabinet-bonus__progress">
            <p>До следующего уровня: {formatPoints(toNext)} баллов</p>
            <div className="cabinet-bonus__bar" aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="cabinet-actions">
            <Link to="/account/bonuses" className="btn btn--primary">
              Получить бонусы
            </Link>
            <Link to="/account/history" className="btn btn--secondary">
              История
            </Link>
          </div>
        </div>
      </section>

      <section className="cabinet-grid cabinet-grid--3">
        <article className="cabinet-panel">
          <h2>Статистика заявок</h2>
          <div className="cabinet-grid cabinet-grid--3">
            <div className="cabinet-stat">
              <span>Заявок</span>
              <strong>{apps.total}</strong>
            </div>
            <div className="cabinet-stat">
              <span>Одобрено</span>
              <strong>{apps.approved}</strong>
            </div>
            <div className="cabinet-stat">
              <span>Отказов</span>
              <strong>{apps.rejected}</strong>
            </div>
          </div>
          <p style={{ marginTop: 12 }}>Процент одобрения внутри сервиса: {approval}%</p>
        </article>

        <article className="cabinet-panel">
          <h2>Быстрые действия</h2>
          <div className="cabinet-actions">
            <Link to="/consumer-loans" className="btn btn--primary btn--sm">Подобрать кредит</Link>
            <Link to="/cards" className="btn btn--secondary btn--sm">Сравнить карты</Link>
            <Link to="/account/favorites" className="btn btn--secondary btn--sm">Избранное</Link>
            <Link to="/account/referrals" className="btn btn--secondary btn--sm">Пригласить друга</Link>
          </div>
        </article>

        <article className="cabinet-panel">
          <h2>Рефералы</h2>
          <div className="cabinet-stat">
            <span>Приглашено друзей</span>
            <strong>{(user.referrals || []).length}</strong>
          </div>
          <p style={{ marginTop: 12 }}>Код: {user.referralCode}</p>
          <div className="cabinet-actions" style={{ marginTop: 12 }}>
            <Link to="/account/referrals" className="btn btn--secondary btn--sm">Подробнее</Link>
          </div>
        </article>
      </section>

      <section className="cabinet-grid">
        <article className="cabinet-panel">
          <h2>Мои кредиты</h2>
          {(user.loans || []).length ? (
            <div className="cabinet-list">
              {user.loans.slice(0, 2).map((loan) => (
                <div key={loan.id} className="cabinet-loan">
                  <div className="cabinet-loan__top">
                    <strong>{loan.bank}</strong>
                    <span className="cabinet-loan__status">{loan.status}</span>
                  </div>
                  <p>{loan.type}</p>
                  <div className="cabinet-loan__grid">
                    <div><span>Сумма</span><strong>{loan.sum}</strong></div>
                    <div><span>Ставка</span><strong>{loan.rate}</strong></div>
                    <div><span>Срок</span><strong>{loan.term}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cabinet-empty">
              <p>Здесь появятся ваши оформленные продукты.</p>
              <Link to="/loans" className="btn btn--primary btn--sm">Подобрать кредит</Link>
            </div>
          )}
        </article>

        <article className="cabinet-panel">
          <h2>Избранные предложения</h2>
          {favItems.length ? (
            <div className="cabinet-list">
              {favItems.map((item) => (
                <div key={item.id} className="cabinet-list__item">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.catalogLabel}</span>
                  </div>
                  <Link to={`/offer/${item.slug}`} className="btn btn--secondary btn--sm">Открыть</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="cabinet-empty">
              <p>Сохраняйте интересные предложения сердечком в каталогах.</p>
              <Link to="/loans" className="btn btn--primary btn--sm">К каталогу</Link>
            </div>
          )}
        </article>
      </section>

      <section className="cabinet-grid">
        <article className="cabinet-panel">
          <h2>Получайте больше бонусов</h2>
          <div className="cabinet-list">
            {tasks.map((action) => {
              const done =
                (Boolean(user.completedActions?.[action.id]) && action.id !== 'daily-login') ||
                (action.id === 'invite-friend' && (user.referrals || []).length > 0) ||
                (action.id === 'daily-login' && Boolean(user.lastLoginDate));
              const isInvite = action.id === 'invite-friend';
              const isDaily = action.id === 'daily-login';
              return (
                <div key={action.id} className={`cabinet-task${done ? ' is-done' : ''}`}>
                  <div>
                    <strong>{action.title}</strong>
                    <span> +{action.points} баллов</span>
                  </div>
                  {isInvite ? (
                    <Link to="/account/referrals" className="btn btn--secondary btn--sm">
                      {done ? 'Подробнее' : 'Пригласить'}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      disabled={done || isDaily}
                      onClick={() => claimBonus(action)}
                    >
                      {done || isDaily ? 'Выполнено' : 'Получить'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </article>

        <article className="cabinet-panel">
          <h2>История активности</h2>
          {recentBonuses.length ? (
            <div className="cabinet-list">
              {recentBonuses.map((item) => (
                <div key={item.id} className="cabinet-list__item">
                  <div>
                    <strong>{item.title}</strong>
                    <span>{new Date(item.dateISO).toLocaleString('ru-RU')}</span>
                  </div>
                  <div className="cabinet-list__points">+{item.points}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cabinet-empty">
              <p>Выполните первое действие и получите бонусы.</p>
            </div>
          )}
        </article>
      </section>
    </>
  );
};

export default AccountOverview;
