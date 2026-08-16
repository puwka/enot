import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../images/logo.png';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';
import HeartIcon from '../components/HeartIcon';
import './Header.css';

const NAV_ITEMS = [
  { to: '/loans', label: 'Кредиты' },
  { to: '/cards', label: 'Дебетовые карты' },
  { to: '/auto-loans', label: 'Кредитные карты' },
  { to: '/Education', label: 'Статьи' },
  { to: '/news', label: 'Новости' },
  { to: '/guide', label: 'Справочник' },
];

const SEARCH_INDEX = [
  {
    to: '/',
    title: 'Главная',
    description: 'Сравнение кредитов и карт, калькулятор',
    keywords: ['главная', 'енотмани', 'калькулятор', 'сравнение'],
    group: 'Разделы',
  },
  {
    to: '/loans',
    title: 'Кредиты и займы',
    description: 'Подобрать кредит или займ на карту',
    keywords: ['кредит', 'кредиты', 'займ', 'займы', 'наличные', 'подобрать'],
    group: 'Продукты',
  },
  {
    to: '/consumer-loans',
    title: 'Потребительские кредиты',
    description: 'Ставки и условия банков по кредитам',
    keywords: ['потребительский', 'потребительские', 'наличными', 'рефинансирование'],
    group: 'Продукты',
  },
  {
    to: '/cards',
    title: 'Дебетовые карты',
    description: 'Кэшбэк, бесплатное обслуживание',
    keywords: ['дебетовая', 'дебетовые', 'карта', 'карты', 'кэшбэк', 'кешбэк'],
    group: 'Продукты',
  },
  {
    to: '/auto-loans',
    title: 'Кредитные карты',
    description: 'Лимит и льготный период',
    keywords: ['кредитная', 'кредитные', 'льготный', 'лимит', 'рассрочка'],
    group: 'Продукты',
  },
  {
    to: '/Education',
    title: 'Статьи',
    description: 'Финансовые советы и обучающие материалы',
    keywords: ['статьи', 'статья', 'обучение', 'советы', 'безопасность', 'ставка', 'кэшбэк', 'кешбэк'],
    group: 'Информация',
  },
  {
    to: '/news',
    title: 'Новости',
    description: 'Актуальные материалы о кредитах и картах',
    keywords: ['новости', 'новость', 'рынок', 'обновления'],
    group: 'Информация',
  },
  {
    to: '/news/usloviya-kreditov-avgust-2026',
    title: 'Условия по кредитам в августе',
    description: 'Что изменили банки и как сравнить предложения',
    keywords: ['август', 'ставки', 'кредиты', 'новости'],
    group: 'Новости',
  },
  {
    to: '/article/kak-snizit-stavku-po-kreditu',
    title: 'Как снизить ставку по кредиту',
    description: 'Рабочие способы получить более выгодные условия',
    keywords: ['ставка', 'снизить', 'кредит', 'рефинансирование'],
    group: 'Статьи',
  },
  {
    to: '/article/keshbek-kak-poluchat-maksimum',
    title: 'Кэшбэк: как получать максимум',
    description: 'Как выбрать карту под повседневные траты',
    keywords: ['кэшбэк', 'кешбэк', 'карта', 'выгода'],
    group: 'Статьи',
  },
  {
    to: '/article/finansovaya-bezopasnost',
    title: 'Финансовая безопасность',
    description: 'Простые правила защиты счетов и карт',
    keywords: ['безопасность', 'мошенники', 'защита'],
    group: 'Статьи',
  },
  {
    to: '/guide',
    title: 'Справочник',
    description: 'Навигация по разделам и базовые термины',
    keywords: ['справочник', 'информация', 'условия', 'термины'],
    group: 'Информация',
  },
  {
    to: '/faq',
    title: 'Вопросы и ответы',
    description: 'Как работает сервис и оформление заявок',
    keywords: ['faq', 'вопросы', 'ответы', 'помощь'],
    group: 'Информация',
  },
  {
    to: '/favorites',
    title: 'Избранное',
    description: 'Сохранённые предложения',
    keywords: ['избранное', 'сохранить', 'сердечко'],
    group: 'Информация',
  },
  {
    to: '/account',
    title: 'Личный кабинет',
    description: 'Бонусы, история и настройки профиля',
    keywords: ['кабинет', 'аккаунт', 'профиль', 'бонусы', 'вход'],
    group: 'Аккаунт',
  },
  {
    to: '/login',
    title: 'Вход',
    description: 'Авторизация в личный кабинет',
    keywords: ['вход', 'логин', 'авторизация'],
    group: 'Аккаунт',
  },
  {
    to: '/register',
    title: 'Регистрация',
    description: 'Создать аккаунт ЕнотМани',
    keywords: ['регистрация', 'аккаунт', 'создать'],
    group: 'Аккаунт',
  },
  {
    to: '/Job',
    title: 'Вакансии',
    description: 'Актуальные вакансии компаний',
    keywords: ['вакансии', 'работа', 'карьера'],
    group: 'Информация',
  },
];

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/ё/g, 'е')
    .trim();

const scoreItem = (item, query) => {
  const q = normalize(query);
  if (!q) return 0;

  const title = normalize(item.title);
  const description = normalize(item.description);
  const keywords = item.keywords.map(normalize);

  if (title === q) return 100;
  if (title.startsWith(q)) return 90;
  if (title.includes(q)) return 75;
  if (keywords.some((word) => word === q || word.startsWith(q))) return 70;
  if (keywords.some((word) => word.includes(q))) return 55;
  if (description.includes(q)) return 40;
  return 0;
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = useRef(null);
  const searchPanelRef = useRef(null);
  const searchId = useId();
  const { count: favoritesCount } = useFavorites();
  const { isAuthenticated, user, logout } = useAuth();

  const results = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) {
      return SEARCH_INDEX.slice(0, 6);
    }

    return SEARCH_INDEX
      .map((item) => ({ item, score: scoreItem(item, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [searchQuery]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setSearchQuery('');
    setActiveIndex(0);
  }, [location.pathname]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery, isSearchOpen]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isSearchOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    if (!isMenuOpen && !isSearchOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
          setSearchQuery('');
        } else {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen, isSearchOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setActiveIndex(0);
  };

  const openSearch = () => {
    setIsMenuOpen(false);
    setIsSearchOpen(true);
  };

  const goToResult = (to) => {
    navigate(to);
    closeSearch();
  };

  const handleSearchKeyDown = (event) => {
    if (!results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const target = results[activeIndex];
      if (target) goToResult(target.to);
    }
  };

  return (
    <header className={`site-header${isMenuOpen ? ' is-menu-open' : ''}`}>
      <div className="site-header__bar">
        <div className="site-header__inner container">
          <Link to="/" className="site-header__brand" onClick={closeMenu}>
            <img src={logoImage} alt="ЕнотМани" className="site-header__logo" />
            <span className="site-header__brand-name">ЕнотМани</span>
          </Link>

          <nav className="site-header__nav" aria-label="Основная навигация">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `site-header__link${isActive ? ' is-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="site-header__actions">
            <button
              type="button"
              className="site-header__action"
              aria-label={`Избранное${favoritesCount ? `, ${favoritesCount}` : ''}`}
              title="Избранное"
              onClick={() => navigate('/favorites')}
            >
              <HeartIcon filled={Boolean(favoritesCount)} size={20} />
              <span className="site-header__action-label">Избранное</span>
              {favoritesCount > 0 ? (
                <span className="site-header__badge">{favoritesCount}</span>
              ) : null}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                className="site-header__action site-header__action--account"
                title="Личный кабинет"
                onClick={() => navigate('/account')}
              >
                <span className="site-header__account-avatar" aria-hidden="true">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" />
                  ) : (
                    (user?.name || 'Е').trim().charAt(0).toUpperCase()
                  )}
                </span>
                <span className="site-header__action-label">Кабинет</span>
              </button>
            ) : (
              <button
                type="button"
                className="site-header__action site-header__action--account"
                title="Войти"
                onClick={() => navigate('/login')}
              >
                <span className="site-header__action-label">Войти</span>
              </button>
            )}

            <button
              type="button"
              className={`site-header__action site-header__action--icon${isSearchOpen ? ' is-active' : ''}`}
              aria-label="Поиск"
              aria-expanded={isSearchOpen}
              aria-controls={searchId}
              title="Поиск"
              onClick={openSearch}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16.5 16.5L21 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              className={`site-header__burger${isMenuOpen ? ' is-open' : ''}`}
              aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      {isSearchOpen ? (
        <div
          className="site-search"
          id={searchId}
          role="dialog"
          aria-modal="true"
          aria-label="Поиск по сайту"
        >
          <button
            type="button"
            className="site-search__backdrop"
            aria-label="Закрыть поиск"
            onClick={closeSearch}
          />
          <div className="site-search__panel" ref={searchPanelRef}>
            <div className="site-search__field">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16.5 16.5L21 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                ref={searchInputRef}
                type="search"
                className="site-search__input"
                placeholder="Кредиты, карты, статьи…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="Поиск по сайту"
                aria-autocomplete="list"
                aria-controls={`${searchId}-list`}
                autoComplete="off"
              />
              {searchQuery ? (
                <button
                  type="button"
                  className="site-search__clear"
                  aria-label="Очистить"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              ) : (
                <kbd className="site-search__hint">Esc</kbd>
              )}
            </div>

            <div className="site-search__body">
              <p className="site-search__caption">
                {searchQuery.trim() ? 'Результаты' : 'Популярные разделы'}
              </p>

              {results.length ? (
                <ul className="site-search__list" id={`${searchId}-list`} role="listbox">
                  {results.map((item, index) => (
                    <li key={item.to} role="option" aria-selected={index === activeIndex}>
                      <button
                        type="button"
                        className={`site-search__item${index === activeIndex ? ' is-active' : ''}`}
                        onClick={() => goToResult(item.to)}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <span className="site-search__item-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="site-search__item-text">
                          <strong>{item.title}</strong>
                          <span>{item.description}</span>
                        </span>
                        <span className="site-search__item-group">{item.group}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="site-search__empty">
                  Ничего не найдено по запросу «{searchQuery.trim()}»
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className={`site-header__drawer${isMenuOpen ? ' is-open' : ''}`} aria-hidden={!isMenuOpen}>
        <div className="site-header__drawer-backdrop" onClick={closeMenu} />
        <div className="site-header__drawer-panel" role="dialog" aria-modal="true" aria-label="Мобильное меню">
          <div className="site-header__drawer-top">
            <Link to="/" className="site-header__drawer-brand" onClick={closeMenu}>
              <img src={logoImage} alt="" className="site-header__logo" />
              <span>ЕнотМани</span>
            </Link>
            <button
              type="button"
              className="site-header__drawer-close"
              aria-label="Закрыть меню"
              onClick={closeMenu}
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>
          <button type="button" className="site-header__drawer-search" onClick={openSearch}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16.5 16.5L21 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Поиск по сайту
          </button>
          <nav className="site-header__drawer-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `site-header__drawer-link${isActive ? ' is-active' : ''}`
                }
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/consumer-loans" className="site-header__drawer-link" onClick={closeMenu}>
              Потребительские кредиты
            </NavLink>
            <NavLink to="/Job" className="site-header__drawer-link" onClick={closeMenu}>
              Вакансии
            </NavLink>
            <NavLink to="/faq" className="site-header__drawer-link" onClick={closeMenu}>
              Вопросы и ответы
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/account" className="site-header__drawer-link" onClick={closeMenu}>
                  Личный кабинет
                </NavLink>
                <button
                  type="button"
                  className="site-header__drawer-fav"
                  onClick={() => {
                    closeMenu();
                    logout();
                    navigate('/login');
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="site-header__drawer-link" onClick={closeMenu}>
                  Войти
                </NavLink>
                <NavLink to="/register" className="site-header__drawer-link" onClick={closeMenu}>
                  Регистрация
                </NavLink>
              </>
            )}
          </nav>
          <button
            type="button"
            className="site-header__drawer-fav"
            aria-label="Избранное"
            onClick={() => {
              closeMenu();
              navigate('/favorites');
            }}
          >
            <HeartIcon size={18} />
            Избранное
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
