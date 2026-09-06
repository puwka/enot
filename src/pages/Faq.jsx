import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFaqItems } from '../data/articlesRuntimeApi';
import './ContentPage.css';

const FALLBACK_FAQ = [
  {
    q: 'Что такое ЕнотМани?',
    a: 'ЕнотМани — сервис сравнения финансовых продуктов: кредитов, займов, дебетовых и кредитных карт. Мы помогаем быстро сориентироваться в условиях и перейти к оформлению.',
  },
  {
    q: 'Это бесплатно?',
    a: 'Да, сравнение предложений на сайте бесплатно для пользователей. Оформление проходит на стороне банка или компании по их условиям.',
  },
  {
    q: 'Как работает избранное?',
    a: 'Нажмите на сердечко у предложения — оно сохранится в разделе «Избранное». Список хранится в вашем браузере.',
  },
];

const Faq = () => {
  const [open, setOpen] = useState(0);
  const [items, setItems] = useState(FALLBACK_FAQ);

  useEffect(() => {
    let active = true;
    fetchFaqItems().then((rows) => {
      if (!active) return;
      if (rows.length) setItems(rows);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="content-page">
      <div className="content-page__container">
        <nav className="content-crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">/</span>
          <span>Вопросы и ответы</span>
        </nav>

        <header className="content-page__header">
          <h1 className="content-page__title">Вопросы и ответы</h1>
          <p className="content-page__lead">
            Короткие ответы о работе сервиса, заявках, избранном и сравнении предложений.
          </p>
        </header>

        <div className="content-faq">
          {items.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.id || item.q} className={`content-faq__item${isOpen ? ' is-open' : ''}`}>
                <button
                  type="button"
                  className="content-faq__q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  {item.q}
                  <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen ? <p className="content-faq__a">{item.a}</p> : null}
              </div>
            );
          })}
        </div>

        <section className="content-banner">
          <div>
            <h2>Не нашли ответ?</h2>
            <p>Напишите нам в Telegram — подскажем, с какого раздела лучше начать.</p>
          </div>
          <div className="content-banner__actions">
            <a
              href="https://t.me/enot_mani"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
            >
              Написать в Telegram
            </a>
            <Link to="/loans" className="btn btn--secondary">
              К каталогу
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Faq;
