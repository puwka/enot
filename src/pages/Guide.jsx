import { Link } from 'react-router-dom';
import './ContentPage.css';

const SECTIONS = [
  {
    title: 'Кредиты и займы',
    text: 'Сравнение ставок, сумм и сроков. Подходит, если нужна быстрая ориентация по предложениям МФО и банков.',
    to: '/loans',
    label: 'Открыть раздел',
  },
  {
    title: 'Потребительские кредиты',
    text: 'Кредиты наличными и рефинансирование. Смотрите ставку, срок и диапазон суммы до заявки.',
    to: '/consumer-loans',
    label: 'Сравнить кредиты',
  },
  {
    title: 'Кредитные карты',
    text: 'Лимиты, льготный период и рассрочка. Полезно, если нужен резерв или отсрочка платежа.',
    to: '/auto-loans',
    label: 'Смотреть карты',
  },
  {
    title: 'Дебетовые карты',
    text: 'Кэшбэк, обслуживание и проценты на остаток. Выбирайте карту под повседневные траты.',
    to: '/cards',
    label: 'К дебетовым картам',
  },
  {
    title: 'Кредиты под залог',
    text: 'Предложения под залог ПТС, авто и недвижимости. Сравнивайте условия перед оформлением.',
    to: '/collateral-loans',
    label: 'Открыть каталог',
  },
  {
    title: 'Статьи',
    text: 'Практические материалы о ставках, кэшбэке и финансовой безопасности.',
    to: '/Education',
    label: 'Читать статьи',
  },
  {
    title: 'Обучение',
    text: 'Курсы, переподготовка и программы онлайн-школ.',
    to: '/obuchenie',
    label: 'Смотреть курсы',
  },
  {
    title: 'Сервисы',
    text: 'Подработка, доставка и бытовые услуги партнёров.',
    to: '/services',
    label: 'Открыть сервисы',
  },
  {
    title: 'Магазины',
    text: 'Карты и программы с кешбэком для покупок.',
    to: '/shops',
    label: 'К покупкам',
  },
];

const TERMS = [
  {
    title: 'Ставка',
    text: 'Стоимость пользования деньгами. Сравнивайте не только «ставку от», но и полные условия продукта.',
  },
  {
    title: 'Срок',
    text: 'Период, на который выдаётся кредит или действует лимит. Влияет на размер платежа и переплату.',
  },
  {
    title: 'Льготный период',
    text: 'Время, в течение которого по кредитной карте можно пользоваться лимитом без процентов при соблюдении условий.',
  },
  {
    title: 'Кэшбэк',
    text: 'Возврат части суммы покупок. Важно смотреть категории, лимиты и стоимость обслуживания карты.',
  },
];

const Guide = () => (
  <main className="content-page">
    <div className="content-page__container content-page__container--wide">
      <nav className="content-crumbs" aria-label="Хлебные крошки">
        <Link to="/">Главная</Link>
        <span aria-hidden="true">/</span>
        <span>Справочник</span>
      </nav>

      <header className="content-page__header">
        <h1 className="content-page__title">Справочник</h1>
        <p className="content-page__lead">
          Краткая навигация по разделам сервиса и базовым терминам — чтобы быстрее выбрать нужный продукт.
        </p>
      </header>

      <div className="content-grid content-grid--3">
        {SECTIONS.map((item) => (
          <Link key={item.to} to={item.to} className="content-card">
            <span className="content-card__tag">{item.label}</span>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </Link>
        ))}
      </div>

      <section className="content-panel">
        <h2>Базовые термины</h2>
        <div className="content-grid">
          {TERMS.map((item) => (
            <article key={item.title} className="content-card">
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-banner">
        <div>
          <h2>Готовы сравнить предложения?</h2>
          <p>Начните с кредитов или карт — условия собраны в одном месте.</p>
        </div>
        <div className="content-banner__actions">
          <Link to="/loans" className="btn btn--primary">
            Кредиты
          </Link>
          <Link to="/faq" className="btn btn--secondary">
            FAQ
          </Link>
        </div>
      </section>
    </div>
  </main>
);

export default Guide;
