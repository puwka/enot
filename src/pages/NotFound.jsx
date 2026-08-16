import { Link } from 'react-router-dom';
import './ContentPage.css';

const NotFound = () => (
  <main className="content-page">
    <div className="content-page__container">
      <nav className="content-crumbs" aria-label="Хлебные крошки">
        <Link to="/">Главная</Link>
        <span aria-hidden="true">/</span>
        <span>Страница не найдена</span>
      </nav>

      <header className="content-page__header">
        <h1 className="content-page__title">Страница не найдена</h1>
        <p className="content-page__lead">
          Такой страницы нет или адрес изменился. Вернитесь на главную или выберите нужный раздел.
        </p>
      </header>

      <div className="content-grid">
        <Link to="/loans" className="content-card">
          <span className="content-card__tag">Каталог</span>
          <strong>Кредиты и займы</strong>
          <p>Сравните актуальные предложения по сумме, сроку и ставке.</p>
        </Link>
        <Link to="/cards" className="content-card">
          <span className="content-card__tag">Каталог</span>
          <strong>Дебетовые карты</strong>
          <p>Кэшбэк, обслуживание и условия в одном списке.</p>
        </Link>
        <Link to="/Education" className="content-card">
          <span className="content-card__tag">Контент</span>
          <strong>Статьи</strong>
          <p>Полезные материалы о финансах и выборе продуктов.</p>
        </Link>
        <Link to="/guide" className="content-card">
          <span className="content-card__tag">Помощь</span>
          <strong>Справочник</strong>
          <p>Короткая навигация по разделам и базовым терминам.</p>
        </Link>
      </div>

      <section className="content-banner">
        <div>
          <h2>Вернуться к сравнению</h2>
          <p>Главная страница — быстрый старт по кредитам и картам.</p>
        </div>
        <Link to="/" className="btn btn--primary">
          На главную
        </Link>
      </section>
    </div>
  </main>
);

export default NotFound;
