import React from 'react';
import CardLoan from '../components/CardLoan';
import finmi from '../images/FinMi.webp'; // Импортируем картинку
import fin from '../images/finters.webp'; // Импортируем картинку
import sosed from '../images/sosed.webp'; // Импортируем картинку
import car from '../images/car.webp'; // Импортируем картинку
import ali from '../images/ali.webp'; // Импортируем картинку
import grand from '../images/grand.webp'; // Импортируем картинку
import asia from '../images/asia.webp'; // Импортируем картинку
import dobro from '../images/dobro.webp'; // Импортируем картинку
import medium from '../images/medium.webp'; // Импортируем картинку
import zaimer from '../images/zaimer.webp'; // Импортируем картинку
import laik from '../images/laik.webp'; // Импортируем картинку
import zanfin from '../images/zanfin.webp'; // Импортируем картинку
import kviki from '../images/kviki.webp'; // Импортируем картинку
import bstro from '../images/bstro.webp'; // Импортируем картинку
import money from '../images/money.webp'; // Импортируем картинку
import abr from '../images/abr.webp'; // Импортируем картинку



const Loans = () => {
  const demoData = [
    {
      bank: 'FINTERS',
      image: fin, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 24 недель',
      sum: '3000 - 50 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7307&p=10695&erid=2W5zFH4LCZF'
    },
    {
      bank: 'FinMi',
      image: finmi, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 70 дней',
      sum: '1000 - 50 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7304&p=10695&erid=2W5zFHRjyh3'
    },
    {
      bank: 'Привет, сосед!',
      image: sosed, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 31 дня',
      sum: '1000 - 30 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7280&p=10695&erid=2W5zFHNcvWu'
    },
    {
      bank: 'CarMoney',
      image: car, // Ссылка на картинку
      rate: 'до 75% годовых',
      term: 'до 84 недель',
      sum: '50 000 - 1 млн ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7234&p=10695&erid=2W5zFHkxvwA'
    },
    {
      bank: 'Алистар',
      image: ali, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 24 недель',
      sum: '5000 - 100 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7233&p=10695&erid=2W5zFJ8ghUV'
    },
    {
      bank: 'GranatFinance',
      image: grand, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 360 дней',
      sum: '1000 - 100 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7223&p=10695&erid=2W5zFJN4wcM'
    },
    {
      bank: 'Asiacredit',
      image: asia, // Ссылка на картинку
      rate: '0.6% в день',
      term: 'до 12 месяцев',
      sum: '5000 - 100 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7213&p=10695&erid=2W5zFHEjvPr'
    },
    {
      bank: 'Доброзайм',
      image: dobro, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 364 дней',
      sum: '1000 - 100 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7178&p=10695&erid=2W5zFHnPQoT'
    },
    {
      bank: 'Medium Score',
      image: medium, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 30 дней',
      sum: '3000 - 30 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7128&p=10695&erid=2W5zFJDLBdS'
    },
    {
      bank: 'Займер',
      image: zaimer, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 30 дней',
      sum: '2000 - 30 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7073&p=10695&erid=2W5zFJCB1U4'
    },
    {
      bank: 'Лайк Мани',
      image: laik, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 180 дней',
      sum: '2000 - 100 000 ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7038&p=10695&erid=2W5zFHHtZeg'
    },
    {
      bank: 'Финансы',
      image: zanfin, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 365 дней',
      sum: '1000 - 100 000 ₽',
      link: 'https://my.saleads.pro/s/6wlc8?erid=2VtzqvAAbzM'
    },
    {
      bank: 'Kviki',
      image: kviki, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 360 дней',
      sum: '1000 - 100 000 ₽',
      link: 'https://my.saleads.pro/s/39azf?erid=2Vtzqw5YA8m'
    },
    {
      bank: 'Быстроденьги',
      image: bstro, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 180 дней',
      sum: '3000 - 40 000 ₽',
      link: 'https://my.saleads.pro/s/lmhes?erid=2VtzqwgYGfX'
    },
    {
      bank: 'Монеткин',
      image: money, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 365 дней',
      sum: '1000 - 100 000 ₽',
      link: 'https://my.saleads.pro/s/p04x3?erid=2VtzqvWJVs3'
    },
    {
      bank: 'У Абрамовича',
      image: abr, // Ссылка на картинку
      rate: '0.8% в день',
      term: 'до 365 дней',
      sum: '1000 - 100 000 ₽',
      link: 'https://my.saleads.pro/s/ountl?erid=2Vtzqv8gci1'
    },
    // Добавь еще как минимум до 20 объектов, чтобы заполнить страницу.
    // Используй разные цвета в ссылке placehold.co, чтобы визуально различать их.
    // Например:
    // image: 'https://placehold.co/350x160/a9a9a9/a9a9a9/png?text=МФО+4'
];

return (
  <div className="page">

    <div className="cards-grid">
      {demoData.map((item) => (
        <CardLoan key={item.bank} {...item} /> /* Передаем все данные в компонент */
      ))}
    </div>
  </div>
);
};

export default Loans;