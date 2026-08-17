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
  },
  'settings-site': {
    title: 'Сайт',
    text: 'Базовые настройки бренда и сервиса.',
  },
  'settings-header': {
    title: 'Header',
    text: 'Параметры шапки публичного сайта.',
  },
  'settings-footer': {
    title: 'Footer',
    text: 'Параметры подвала и служебных ссылок.',
  },
  'settings-menu': {
    title: 'Меню',
    text: 'Пункты навигации header и footer.',
  },
  'settings-seo': {
    title: 'SEO',
    text: 'Мета-данные и поисковые настройки страниц.',
  },
  audit: {
    title: 'Журнал действий',
    text: 'Аудит изменений в административной панели.',
  },
};

const AdminSection = ({ sectionKey }) => {
  const meta = COPY[sectionKey] || { title: 'Раздел', text: 'Раздел подготовлен для следующего этапа CMS.' };

  return (
    <section className="cms-panel">
      <p className="cms-panel__lead" style={{ marginTop: 0 }}>
        {meta.text}
      </p>
      <div className="cms-empty">
        <strong>{meta.title}</strong>
        <p>CRUD этого раздела будет подключен на следующем этапе. Сейчас доступен только каркас интерфейса.</p>
      </div>
    </section>
  );
};

export default AdminSection;
