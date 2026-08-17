export const ADMIN_ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
};

export const ROLE_PERMISSIONS = {
  SUPERADMIN: ['*'],
  ADMIN: ['content', 'news', 'articles', 'categories', 'faq', 'products', 'users', 'bonuses'],
  EDITOR: ['news', 'articles', 'categories', 'faq', 'media'],
};

export const ADMIN_NAV = [
  {
    key: 'dashboard',
    path: '/admin',
    label: 'Dashboard',
    end: true,
  },
  {
    key: 'content',
    label: 'Контент',
    children: [
      { key: 'pages', path: '/admin/pages', label: 'Страницы', permission: 'content' },
      { key: 'news', path: '/admin/news', label: 'Новости', permission: 'news' },
      { key: 'articles', path: '/admin/articles', label: 'Статьи', permission: 'articles' },
      { key: 'categories', path: '/admin/categories', label: 'Категории', permission: 'categories' },
      { key: 'faq', path: '/admin/faq', label: 'FAQ', permission: 'faq' },
    ],
  },
  {
    key: 'products',
    label: 'Продукты',
    children: [
      { key: 'loans', path: '/admin/products/loans', label: 'Кредиты', permission: 'products' },
      { key: 'debit-cards', path: '/admin/products/debit-cards', label: 'Дебетовые карты', permission: 'products' },
      { key: 'credit-cards', path: '/admin/products/credit-cards', label: 'Кредитные карты', permission: 'products' },
      { key: 'obuchenie', path: '/admin/products/obuchenie', label: 'Обучение', permission: 'products' },
      { key: 'services', path: '/admin/products/services', label: 'Сервисы', permission: 'products' },
      { key: 'shops', path: '/admin/products/shops', label: 'Магазины', permission: 'products' },
      { key: 'banks', path: '/admin/products/banks', label: 'Банки', permission: 'products' },
    ],
  },
  {
    key: 'users',
    label: 'Пользователи',
    children: [
      { key: 'users-list', path: '/admin/users', label: 'Пользователи', permission: 'users' },
      { key: 'applications', path: '/admin/applications', label: 'Заявки', permission: 'users' },
      { key: 'bonuses', path: '/admin/bonuses', label: 'Бонусы', permission: 'bonuses' },
      { key: 'referrals', path: '/admin/referrals', label: 'Рефералы', permission: 'users' },
    ],
  },
  {
    key: 'media',
    label: 'Медиа',
    children: [
      { key: 'images', path: '/admin/media', label: 'Изображения', permission: 'media' },
    ],
  },
  {
    key: 'settings',
    label: 'Настройки',
    children: [
      { key: 'settings-site', path: '/admin/settings/site', label: 'Сайт', permission: 'settings' },
      { key: 'settings-header', path: '/admin/settings/header', label: 'Header', permission: 'settings' },
      { key: 'settings-footer', path: '/admin/settings/footer', label: 'Footer', permission: 'settings' },
      { key: 'settings-menu', path: '/admin/settings/menu', label: 'Меню', permission: 'settings' },
      { key: 'settings-seo', path: '/admin/settings/seo', label: 'SEO', permission: 'settings' },
    ],
  },
  {
    key: 'system',
    label: 'Система',
    children: [
      { key: 'audit', path: '/admin/system/audit', label: 'Журнал действий', permission: 'system' },
    ],
  },
];

export const hasPermission = (role, permission) => {
  if (!role) return false;
  const grants = ROLE_PERMISSIONS[role];
  if (!grants) return false;
  if (grants.includes('*')) return true;
  if (!permission) return true;
  return grants.includes(permission);
};

export const getAllowedNav = (role) =>
  ADMIN_NAV.map((item) => {
    if (!item.children) {
      return hasPermission(role, item.permission) ? item : null;
    }
    const children = item.children.filter((child) => hasPermission(role, child.permission));
    if (!children.length) return null;
    return { ...item, children };
  }).filter(Boolean);

export const flattenNav = (nav = ADMIN_NAV) =>
  nav.flatMap((item) => (item.children ? item.children : [item]));

export const findNavItem = (pathname) => {
  const items = flattenNav(ADMIN_NAV);
  const exact = items.find((item) => item.path === pathname);
  if (exact) return exact;
  return items
    .filter((item) => item.path !== '/admin' && pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0] || null;
};

export const getBreadcrumbs = (pathname) => {
  const crumbs = [{ label: 'Админ', path: '/admin' }];
  if (pathname === '/admin') {
    crumbs.push({ label: 'Dashboard', path: '/admin' });
    return crumbs;
  }

  const group = ADMIN_NAV.find(
    (item) => item.children && item.children.some((child) => pathname === child.path || pathname.startsWith(`${child.path}/`))
  );
  const current = findNavItem(pathname);

  if (group) crumbs.push({ label: group.label, path: group.children[0]?.path || '/admin' });
  if (current) crumbs.push({ label: current.label, path: current.path });
  return crumbs;
};

export const canAccessSection = (role, sectionKey) => {
  const item = flattenNav(ADMIN_NAV).find((entry) => entry.key === sectionKey);
  if (!item) {
    if (sectionKey === 'dashboard') return hasPermission(role, null);
    return false;
  }
  return hasPermission(role, item.permission);
};

export const getAllowedSections = (role) => flattenNav(getAllowedNav(role));

export const ADMIN_SECTIONS = flattenNav(ADMIN_NAV);
