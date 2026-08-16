import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BONUS_CONFIG, formatPoints, pointsToRubles } from '../config/bonuses';
import tgIcon from '../images/telega.png';
import vkIcon from '../images/vkontakte.png';

const AccountBonuses = () => {
  const { user, claimBonus } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const balance = user.bonusBalance || 0;
  const actions = Object.values(BONUS_CONFIG.actions);

  return (
    <>
      <section className="cabinet-panel cabinet-bonus" style={{ marginBottom: 16 }}>
        <h2>Мои бонусы</h2>
        <div className="cabinet-bonus__value">{formatPoints(balance)} баллов</div>
        <p className="cabinet-bonus__eq">≈ {formatPoints(pointsToRubles(balance))} ₽</p>
        <p>Баллы начисляются за активность. Позже их можно будет конвертировать и выводить.</p>
      </section>

      <section className="cabinet-panel" style={{ marginBottom: 16 }}>
        <h2>Задания</h2>
        <div className="cabinet-list">
          {actions.map((action) => {
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
                  <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate('/account/referrals')}>
                    {done ? 'Подробнее' : 'Пригласить'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
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
      </section>

      <section className="cabinet-panel">
        <h2>Получайте бонусы за активность</h2>
        <p style={{ marginBottom: 14 }}>Делитесь сервисом и возвращайтесь за ежедневным бонусом.</p>
        <div className="cabinet-actions">
          <a href="https://t.me/enot_mani" target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">
            <img src={tgIcon} alt="" width="16" height="16" />
            Telegram
          </a>
          <a href="https://vk.com/skupka_59_perm" target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">
            <img src={vkIcon} alt="" width="16" height="16" />
            VK
          </a>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => claimBonus(BONUS_CONFIG.actions.socialShare)}
          >
            Засчитать репост +{BONUS_CONFIG.actions.socialShare.points}
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => {
              claimBonus(BONUS_CONFIG.actions.readMaterial);
              navigate('/Education');
            }}
          >
            Изучить материал
          </button>
        </div>
      </section>
    </>
  );
};

export default AccountBonuses;
