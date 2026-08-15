import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../images/logo.png';
import './Header.css';

const NAV_ITEMS = [
  { to: '/loans', label: 'Кредиты' },
  { to: '/cards', label: 'Дебетовые карты' },
  { to: '/auto-loans', label: 'Кредитные карты' },
  { to: '/Education', label: 'Статьи' },
  { to: '/collateral-loans', label: 'Справочник' },
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
    keywords: ['статьи', 'статья', 'обучение', 'советы', 'безопасность', 'ставка'],
    group: 'Информация',
  },
  {
    to: '/collateral-loans',
    title: 'Справочник',
    description: 'Справочная информация по продуктам',
    keywords: ['справочник', 'информация', 'условия'],
    group: 'Информация',
  },
  {
    to: '/Job',
    title: 'Вакансии',
    description: 'Актуальные вакансии партнёров',
    keywords: ['вакансии', 'работа', 'карьера', 'вопросы'],
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
    if (!isSearchOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen]);

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
    <header className="site-header">
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
              aria-label="Избранное"
              title="Избранное"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  d="M12 20.5s-7.2-4.35-9.2-8.2C1.4 9.5 2.5 6.5 5.4 5.6c1.8-.55 3.7.15 4.8 1.55 1.1-1.4 3-2.1 4.8-1.55 2.9.9 4 3.9 2.6 6.7-2 3.85-9.2 8.2-9.2 8.2z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="site-header__action-label">Избранное</span>
            </button>

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
          </nav>
          <button type="button" className="site-header__drawer-fav" aria-label="Избранное">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M12 20.5s-7.2-4.35-9.2-8.2C1.4 9.5 2.5 6.5 5.4 5.6c1.8-.55 3.7.15 4.8 1.55 1.1-1.4 3-2.1 4.8-1.55 2.9.9 4 3.9 2.6 6.7-2 3.85-9.2 8.2-9.2 8.2z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            Избранное
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
