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
  const pageTitle = location.pathname === '/admin' ? 'Dashboard' : current?.label || 'Раздел';

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    nav.forEach((item) => {
      if (item.children) initial[item.key] = true;
    });
    return initial;
  });

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    setNotifyOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      nav.forEach((item) => {
        if (!item.children) return;
        if (next[item.key] === undefined) next[item.key] = true;
        const active = item.children.some(
          (child) => location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)
        );
        if (active) next[item.key] = true;
      });
      return next;
    });
  }, [location.pathname, nav]);

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

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
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

      <aside className="cms-sidebar" aria-label="Навигация CMS">
        <div className="cms-sidebar__top">
          <Link to="/admin" className="cms-brand" onClick={() => setSidebarOpen(false)}>
            <span className="cms-brand__mark">Е</span>
            <span className="cms-brand__text">
              <strong>ЕнотМани</strong>
              <span>Content Studio</span>
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
                  {item.label}
                </NavLink>
              );
            }

            const groupActive = item.children.some(
              (child) => location.pathname === child.path || location.pathname.startsWith(`${child.path}/`)
            );
            const expanded = Boolean(openGroups[item.key]);

            return (
              <div key={item.key} className={`cms-nav__group${groupActive ? ' is-active' : ''}${expanded ? ' is-open' : ''}`}>
                <button type="button" className="cms-nav__group-btn" onClick={() => toggleGroup(item.key)}>
                  <span>{item.label}</span>
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                    <path d="M5 7.5L10 12.5L15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
                {expanded ? (
                  <div className="cms-nav__children">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.key}
                        to={child.path}
                        className={({ isActive }) => `cms-nav__sublink${isActive ? ' is-active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ) : null}
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
            <div className="cms-search">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16.5 16.5L21 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск по разделам…"
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
          </div>

          <div className="cms-header__right">
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
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    d="M6 17h12l-1.2-1.8a6.4 6.4 0 0 1-1.1-3.7V9.5a3.7 3.7 0 1 0-7.4 0v1.9c0 1.3-.4 2.6-1.1 3.7L6 17Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path d="M10 18.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
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
                    Dashboard
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
          <div className="cms-pagehead">
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
            <h1 className="cms-pagehead__title">{pageTitle}</h1>
          </div>
          <div className="cms-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
