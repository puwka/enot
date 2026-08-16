import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Cabinet.css';

const NAV = [
  { to: '/account', label: 'Обзор', end: true },
  { to: '/account/loans', label: 'Мои кредиты' },
  { to: '/account/favorites', label: 'Избранное' },
  { to: '/account/bonuses', label: 'Бонусы' },
  { to: '/account/history', label: 'История' },
  { to: '/account/referrals', label: 'Рекомендации' },
  { to: '/account/settings', label: 'Настройки' },
];

const CabinetLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const current = NAV.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  return (
    <main className="cabinet">
      <div className="cabinet__container">
        <label className="visually-hidden" htmlFor="cabinet-nav-mobile">
          Раздел кабинета
        </label>
        <select
          id="cabinet-nav-mobile"
          className="cabinet-nav__mobile"
          value={current?.to || '/account'}
          onChange={(event) => navigate(event.target.value)}
        >
          {NAV.map((item) => (
            <option key={item.to} value={item.to}>
              {item.label}
            </option>
          ))}
        </select>

        <div className="cabinet__layout">
          <aside className="cabinet-nav" aria-label="Навигация кабинета">
            <ul className="cabinet-nav__list">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={Boolean(item.end)}
                    className={({ isActive }) => `cabinet-nav__link${isActive ? ' is-active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </aside>
          <div className="cabinet__content">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
};

export default CabinetLayout;
