import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccountLoans = () => {
  const { user } = useAuth();
  if (!user) return null;
  const loans = user.loans || [];
  const apps = user.applications || { total: 0, approved: 0, rejected: 0 };
  const approval = apps.total ? Math.round((apps.approved / apps.total) * 100) : 0;

  return (
    <>
      <section className="cabinet-panel" style={{ marginBottom: 16 }}>
        <h2>Статистика заявок</h2>
        <div className="cabinet-grid cabinet-grid--3">
          <div className="cabinet-stat"><span>Заявок</span><strong>{apps.total}</strong></div>
          <div className="cabinet-stat"><span>Одобрено</span><strong>{apps.approved}</strong></div>
          <div className="cabinet-stat"><span>Отказов</span><strong>{apps.rejected}</strong></div>
        </div>
        <p style={{ marginTop: 12 }}>Процент одобрения внутри сервиса: {approval}%</p>
      </section>

      <section className="cabinet-panel">
        <h2>Мои кредиты</h2>
        {loans.length ? (
          <div className="cabinet-list" style={{ marginTop: 8 }}>
            {loans.map((loan) => (
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
          <div className="cabinet-empty" style={{ marginTop: 12 }}>
            <p>Здесь появятся ваши оформленные продукты.</p>
            <Link to="/consumer-loans" className="btn btn--primary btn--sm">Подобрать кредит</Link>
          </div>
        )}
      </section>
    </>
  );
};

export default AccountLoans;
