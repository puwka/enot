import { useAuth } from '../context/AuthContext';

const AccountHistory = () => {
  const { user } = useAuth();
  if (!user) return null;
  const history = user.bonusHistory || [];

  return (
    <section className="cabinet-panel">
      <h2>История бонусов</h2>
      {history.length ? (
        <div className="cabinet-list" style={{ marginTop: 8 }}>
          {history.map((item) => (
            <div key={item.id} className="cabinet-list__item">
              <div>
                <strong>{item.title}</strong>
                <span>
                  {new Date(item.dateISO).toLocaleString('ru-RU')} · {item.status}
                </span>
              </div>
              <div className="cabinet-list__points">{item.points > 0 ? '+' : ''}{item.points}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="cabinet-empty" style={{ marginTop: 12 }}>
          <p>Пока нет начислений. Выполните первое действие в разделе «Бонусы».</p>
        </div>
      )}
    </section>
  );
};

export default AccountHistory;
