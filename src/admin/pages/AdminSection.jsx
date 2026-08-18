const COPY = {
  pages: {
    title: 'Страницы',
    text: 'Управление страницами сайта: главная, юридические и служебные материалы.',
  },
  news: {
    title: 'Новости',
    text: 'Лента новостей и публикации для публичного раздела.',
  },
  articles: {
    title: 'Статьи',
    text: 'Редактор статей и обучающих материалов.',
  },
  categories: {
    title: 'Категории',
    text: 'Категории контента и продуктовых каталогов.',
  },
  faq: {
    title: 'FAQ',
    text: 'Вопросы и ответы для пользователей сервиса.',
  },
  loans: {
    title: 'Кредиты',
    text: 'Продукты категории кредитов и займов.',
  },
  'debit-cards': {
    title: 'Дебетовые карты',
    text: 'Каталог дебетовых карт партнёров.',
  },
  'credit-cards': {
    title: 'Кредитные карты',
    text: 'Каталог кредитных карт партнёров.',
  },
  banks: {
    title: 'Банки',
    text: 'Справочник банков и брендов.',
  },
  users: {
    title: 'Пользователи',
    text: 'Профили пользователей публичного кабинета.',
    groups: [
      { title: 'Список', rows: [['Поиск', 'По имени, email и телефону'], ['Фильтры', 'Статус, дата регистрации'], ['Действия', 'Добавить пользователя']] },
    ],
  },
  applications: {
    title: 'Заявки',
    text: 'Статистика и история пользовательских заявок.',
  },
  bonuses: {
    title: 'Бонусы',
    text: 'Правила начислений и журнал бонусных операций.',
  },
  referrals: {
    title: 'Рефералы',
    text: 'Реферальные связи и приглашения.',
  },
  media: {
    title: 'Изображения',
    text: 'Медиатека обложек, логотипов и иллюстраций.',
    groups: [
      { title: 'Файлы', rows: [['Preview', 'Миниатюра'], ['Название', 'Оригинальное имя файла'], ['Тип / размер', 'webp, png, svg'], ['Дата', 'Загрузка и обновление']] },
    ],
  },
  'settings-site': {
    title: 'Сайт',
    text: 'Базовые настройки бренда и сервиса.',
    groups: [
      { title: 'General', rows: [['Название', 'ЕнотМани'], ['Домен', 'публичный URL'], ['Язык', 'ru']] },
      { title: 'Contact information', rows: [['Email', 'support@'], ['Телефон', 'горячая линия']] },
      { title: 'Social networks', rows: [['Telegram', 'ссылка'], ['VK', 'ссылка']] },
    ],
  },
  'settings-header': {
    title: 'Header',
    text: 'Параметры шапки публичного сайта.',
    groups: [
      { title: 'Navigation', rows: [['Логотип', 'файл или SVG'], ['Пункты меню', 'порядок и подписи']] },
    ],
  },
  'settings-footer': {
    title: 'Footer',
    text: 'Параметры подвала и служебных ссылок.',
    groups: [
      { title: 'Navigation', rows: [['Колонки', 'ссылки подвала'], ['Копирайт', 'текст']] },
    ],
  },
  'settings-menu': {
    title: 'Меню',
    text: 'Пункты навигации header и footer.',
    groups: [
      { title: 'Navigation', rows: [['Header', 'основные разделы'], ['Footer', 'служебные ссылки']] },
    ],
  },
  'settings-seo': {
    title: 'SEO',
    text: 'Мета-данные и поисковые настройки страниц.',
    groups: [
      { title: 'SEO', rows: [['Title template', 'шаблон заголовка'], ['Description', 'описание по умолчанию']] },
    ],
  },
  audit: {
    title: 'Журнал действий',
    text: 'Аудит изменений в административной панели.',
  },
};

const AdminSection = ({ sectionKey }) => {
  const meta = COPY[sectionKey] || { title: 'Раздел', text: 'Раздел подготовлен для следующего этапа CMS.' };
  const groups = meta.groups || [
    {
      title: meta.title,
      rows: [
        ['Статус', 'Раздел доступен в навигации'],
        ['CRUD', 'Будет подключен на следующем этапе'],
      ],
    },
  ];

  return (
    <div className="cms-placeholder">
      <p className="cms-panel__lead" style={{ marginTop: 0 }}>
        {meta.text}
      </p>
      {groups.map((group) => (
        <section key={group.title} className="cms-placeholder__group">
          <h3>{group.title}</h3>
          {group.rows.map((row) => (
            <div key={row[0]} className="cms-placeholder__row">
              <span>{row[0]}</span>
              <div>{row[1]}</div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};

export default AdminSection;
