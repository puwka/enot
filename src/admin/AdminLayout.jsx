import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { getAllowedNav, getBreadcrumbs, findNavItem } from './permissions';
import './Admin.css';

const NOTIFICATIONS = [
  { id: 1, title: 'Новая регистрация', text: 'Пользователь ожидает подтверждения email', time: '2 мин' },
  { id: 2, title: 'Модерация контента', text: 'Черновик статьи готов к проверке', time: '1 ч' },
  { id: 3, title: 'Система', text: 'Резервное копирование выполнено', time: 'вчера' },
];

const Icon = ({ name }) => {
  const common = {
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.4',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (name === 'home') {
    return (
      <svg {...common}>
        <path d="M2.5 7.2 8 2.8l5.5 4.4V13a.8.8 0 0 1-.8.8H3.3A.8.8 0 0 1 2.5 13V7.2Z" />
      </svg>
    );
  }
  if (name === 'file') {
    return (
      <svg {...common}>
        <path d="M4 2.5h5.2L12.5 6v7.5H4V2.5Z" />
        <path d="M9.2 2.5V6H12.5" />
      </svg>
    );
  }
  if (name === 'news') {
    return (
      <svg {...common}>
        <path d="M3 3.2h10v9.6H3z" />
        <path d="M5.2 6.2h5.6M5.2 8.4h3.8" />
      </svg>
    );
  }
  if (name === 'article') {
    return (
      <svg {...common}>
        <path d="M4 3h8v10H4z" />
        <path d="M6 6h4M6 8.2h4M6 10.4h2.4" />
      </svg>
    );
  }
  if (name === 'tag') {
    return (
      <svg {...common}>
        <path d="M2.8 8.2 8.1 2.9h5.1v5.1L8 13.2 2.8 8.2Z" />
        <circle cx="11" cy="5" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === 'help') {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="5.2" />
        <path d="M6.4 6.4a1.6 1.6 0 1 1 2.2 1.5c-.5.3-.8.7-.8 1.3" />
        <path d="M8 11.2h.01" />
      </svg>
    );
  }
  if (name === 'card') {
    return (
      <svg {...common}>
        <rect x="2.4" y="4.2" width="11.2" height="7.6" rx="0.8" />
        <path d="M2.4 7h11.2" />
      </svg>
    );
  }
  if (name === 'bank') {
    return (
      <svg {...common}>
        <path d="M2.6 6.2 8 3.2l5.4 3" />
        <path d="M4 6.6v5.2M8 6.6v5.2M12 6.6v5.2M3 12.4h10" />
      </svg>
    );
  }
  if (name === 'calc') {
    return (
      <svg {...common}>
        <rect x="3.2" y="2.6" width="9.6" height="10.8" rx="0.8" />
        <path d="M5.4 5h5.2M5.4 8h1.2M7.4 8h1.2M9.4 8h1.2M5.4 10.4h1.2M7.4 10.4h1.2M9.4 10.4h1.2" />
      </svg>
    );
  }
  if (name === 'users') {
    return (
      <svg {...common}>
        <circle cx="6" cy="5.4" r="1.8" />
        <path d="M2.8 12c.3-2 1.6-3.1 3.2-3.1S8.9 10 9.2 12" />
        <circle cx="10.6" cy="5.8" r="1.4" />
        <path d="M11 8.9c1.4.2 2.4 1.2 2.6 3.1" />
      </svg>
    );
  }
  if (name === 'gift') {
    return (
      <svg {...common}>
        <path d="M3 7.2h10v6.2H3z" />
        <path d="M2.6 4.8h10.8v2.4H2.6z" />
        <path d="M8 4.8v8.6" />
      </svg>
    );
  }
  if (name === 'share') {
    return (
      <svg {...common}>
        <circle cx="4" cy="8" r="1.5" />
        <circle cx="11.4" cy="4.4" r="1.5" />
        <circle cx="11.4" cy="11.6" r="1.5" />
        <path d="M5.4 7.4 9.8 5.1M5.4 8.7l4.4 2.2" />
      </svg>
    );
  }
  if (name === 'image') {
    return (
      <svg {...common}>
        <rect x="2.6" y="3.4" width="10.8" height="9.2" rx="0.8" />
        <circle cx="6" cy="6.6" r="1" />
        <path d="M2.8 11.2 6.4 8.2l2.2 1.8 1.6-1.4 2.8 2.6" />
      </svg>
    );
  }
  if (name === 'settings') {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="2.1" />
        <path d="M8 2.8v1.4M8 11.8v1.4M2.8 8h1.4M11.8 8h1.4M4.3 4.3l1 1M10.7 10.7l1 1M11.7 4.3l-1 1M5.3 10.7l-1 1" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 3.2h8v9.6H4z" />
      <path d="M6 6.2h4M6 8.6h3" />
    </svg>
  );
};

const NAV_ICONS = {
  dashboard: 'home',
  pages: 'file',
  news: 'news',
  articles: 'article',
  categories: 'tag',
  faq: 'help',
  loans: 'card',
  'debit-cards': 'card',
  'credit-cards': 'card',
  calculators: 'calc',
  banks: 'bank',
  'users-list': 'users',
  applications: 'file',
  bonuses: 'gift',
  referrals: 'share',
  images: 'image',
  'settings-site': 'settings',
  'settings-header': 'settings',
  'settings-footer': 'settings',
  'settings-menu': 'settings',
  'settings-seo': 'settings',
  audit: 'file',
};

const AdminLayout = () => {
  const { admin, logout, role } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notifyRef = useRef(null);

  const nav = useMemo(() => getAllowedNav(role), [role]);
  const breadcrumbs = useMemo(() => getBreadcrumbs(location.pathname), [location.pathname]);
  const current = useMemo(() => findNavItem(location.pathname), [location.pathname]);
  const pageTitle = location.pathname === '/admin' ? 'Обзор' : current?.label || 'Раздел';

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    setNotifyOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target)) {
        setNotifyOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const onLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return nav
      .flatMap((item) => (item.children ? item.children : [item]))
      .filter((item) => item.label.toLowerCase().includes(q) || item.path.toLowerCase().includes(q))
      .slice(0, 8);
  }, [nav, search]);

  const initials = (admin?.name || 'A').trim().charAt(0).toUpperCase();

  return (
    <div className={`cms-shell${sidebarOpen ? ' is-sidebar-open' : ''}`}>
      <div className="cms-sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden={!sidebarOpen} />

      <aside className="cms-sidebar" aria-label="Навигация">
        <div className="cms-sidebar__top">
          <Link to="/admin" className="cms-brand" onClick={() => setSidebarOpen(false)}>
            <span className="cms-brand__text">
              <strong>ЕнотМани</strong>
              <span>Admin</span>
            </span>
          </Link>
          <button
            type="button"
            className="cms-icon-btn cms-sidebar__close"
            aria-label="Закрыть меню"
            onClick={() => setSidebarOpen(false)}
          >
            <span />
            <span />
          </button>
        </div>

        <nav className="cms-nav">
          {nav.map((item) => {
            if (!item.children) {
              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={Boolean(item.end)}
                  className={({ isActive }) => `cms-nav__link${isActive ? ' is-active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="cms-nav__icon">
                    <Icon name={NAV_ICONS[item.key] || 'file'} />
                  </span>
                  {item.label}
                </NavLink>
              );
            }

            return (
              <div key={item.key} className="cms-nav__section">
                <span className="cms-nav__label">{item.label}</span>
                {item.children.map((child) => (
                  <NavLink
                    key={child.key}
                    to={child.path}
                    className={({ isActive }) => `cms-nav__sublink${isActive ? ' is-active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="cms-nav__icon">
                      <Icon name={NAV_ICONS[child.key] || 'file'} />
                    </span>
                    {child.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="cms-main">
        <header className="cms-header">
          <div className="cms-header__left">
            <button
              type="button"
              className="cms-icon-btn cms-header__menu"
              aria-label="Открыть меню"
              onClick={() => setSidebarOpen(true)}
            >
              <span />
              <span />
              <span />
            </button>
            <div className="cms-header__title-wrap">
              <nav className="cms-breadcrumbs" aria-label="Хлебные крошки">
                {breadcrumbs.map((crumb, index) => {
                  const last = index === breadcrumbs.length - 1;
                  return (
                    <span key={`${crumb.path}-${crumb.label}`} className="cms-breadcrumbs__item">
                      {index > 0 ? <span className="cms-breadcrumbs__sep">/</span> : null}
                      {last ? (
                        <span aria-current="page">{crumb.label}</span>
                      ) : (
                        <Link to={crumb.path}>{crumb.label}</Link>
                      )}
                    </span>
                  );
                })}
              </nav>
              <h1 className="cms-header__title">{pageTitle}</h1>
            </div>
          </div>

          <div className="cms-header__right">
            <div className="cms-search">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16.5 16.5L21 21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск разделов"
                aria-label="Поиск по разделам"
              />
              {searchResults.length ? (
                <div className="cms-search__results">
                  {searchResults.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        navigate(item.path);
                        setSearch('');
                      }}
                    >
                      <strong>{item.label}</strong>
                      <span>{item.path}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="cms-header__slot" ref={notifyRef}>
              <button
                type="button"
                className={`cms-icon-btn${notifyOpen ? ' is-active' : ''}`}
                aria-label="Уведомления"
                aria-expanded={notifyOpen}
                onClick={() => {
                  setNotifyOpen((open) => !open);
                  setUserMenuOpen(false);
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    d="M6 17h12l-1.2-1.8a6.4 6.4 0 0 1-1.1-3.7V9.5a3.7 3.7 0 1 0-7.4 0v1.9c0 1.3-.4 2.6-1.1 3.7L6 17Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M10 18.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="cms-badge">3</span>
              </button>
              {notifyOpen ? (
                <div className="cms-dropdown cms-dropdown--notify">
                  <div className="cms-dropdown__head">Уведомления</div>
                  <ul>
                    {NOTIFICATIONS.map((item) => (
                      <li key={item.id}>
                        <strong>{item.title}</strong>
                        <span>{item.text}</span>
                        <em>{item.time}</em>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="cms-header__slot" ref={userMenuRef}>
              <button
                type="button"
                className={`cms-user-btn${userMenuOpen ? ' is-open' : ''}`}
                aria-expanded={userMenuOpen}
                onClick={() => {
                  setUserMenuOpen((open) => !open);
                  setNotifyOpen(false);
                }}
              >
                <span className="cms-user-btn__avatar">{initials}</span>
                <span className="cms-user-btn__meta">
                  <strong>{admin?.name}</strong>
                  <span>{admin?.role}</span>
                </span>
              </button>
              {userMenuOpen ? (
                <div className="cms-dropdown cms-dropdown--user">
                  <div className="cms-dropdown__head">
                    <strong>{admin?.name}</strong>
                    <span>{admin?.email}</span>
                  </div>
                  <button type="button" onClick={() => navigate('/admin')}>
                    Обзор
                  </button>
                  <button type="button" onClick={onLogout}>
                    Выйти
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="cms-body">
          <div className="cms-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
