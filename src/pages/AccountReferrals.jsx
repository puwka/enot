import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BONUS_CONFIG } from '../config/bonuses';
import tgIcon from '../images/telega.png';
import vkIcon from '../images/vkontakte.png';

const AccountReferrals = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const link = useMemo(() => {
    if (!user) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://enotmani.ru';
    return `${origin}/register?ref=${user.referralCode}`;
  }, [user]);

  if (!user) return null;

  const invited = (user.referrals || []).length;
  const earned = invited * BONUS_CONFIG.actions.inviteFriend.points;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <section className="cabinet-panel" style={{ marginBottom: 16 }}>
        <h2>Пригласите друга</h2>
        <p style={{ marginBottom: 14 }}>
          Поделитесь ссылкой. За приглашение начисляется {BONUS_CONFIG.actions.inviteFriend.points} баллов.
        </p>
        <div className="cabinet-grid">
          <div className="cabinet-stat"><span>Приглашено друзей</span><strong>{invited}</strong></div>
          <div className="cabinet-stat"><span>Получено бонусов</span><strong>{earned}</strong></div>
        </div>
        <label className="field" style={{ marginTop: 16 }}>
          <span className="field__label">Реферальный код</span>
          <input className="input" readOnly value={user.referralCode} />
        </label>
        <label className="field" style={{ marginTop: 12 }}>
          <span className="field__label">Реферальная ссылка</span>
          <div className="cabinet-copy">
            <input className="input" readOnly value={link} />
            <button type="button" className="btn btn--primary" onClick={copy}>
              {copied ? 'Скопировано' : 'Скопировать ссылку'}
            </button>
          </div>
        </label>
      </section>

      <section className="cabinet-panel">
        <h2>Поделиться</h2>
        <div className="cabinet-actions">
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Сравнивай финансы на ЕнотМани')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary"
          >
            <img src={tgIcon} alt="" width="16" height="16" />
            Telegram
          </a>
          <a
            href={`https://vk.com/share.php?url=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary"
          >
            <img src={vkIcon} alt="" width="16" height="16" />
            VK
          </a>
        </div>
        {!invited ? (
          <div className="cabinet-empty" style={{ marginTop: 16 }}>
            <p>Пригласите друга и получите бонус.</p>
          </div>
        ) : null}
      </section>
    </>
  );
};

export default AccountReferrals;
