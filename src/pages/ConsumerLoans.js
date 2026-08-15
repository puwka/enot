import React from 'react';
import CardLoan from '../components/CardLoan';
import rus from '../images/rus.webp'; // Импортируем картинку
import sov from '../images/sov.webp'; // Импортируем картинку
import ren from '../images/renesans.webp'; // Импортируем картинку
import atb from '../images/atb.webp'; // Импортируем картинку
import tbank from '../images/tbank.webp'; // Импортируем картинку
import alfa from '../images/alfa.webp'; // Импортируем картинку




const ConsumerLoans = () => {
  const demoData = [
      {
      bank: 'Русский Стандарт Банк - Наличными',
      image: rus, // Ссылка на картинку
      rate: 'До 65% годовых',
      term: 'До 60 месяцев',
      sum: '30 000 - 3 млн ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6459&p=10695&erid=2W5zFH1t71s'
    },
      {
      bank: 'Совкомбанк - Наличными',
      image: sov, // Ссылка на картинку
      rate: 'До 30% годовых',
      term: 'До 5 лет',
      sum: '30 000 - 5 млн ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5199&p=10695&erid=2W5zFGFFjxt'
    },
      {
      bank: 'Ренессанс Банк - Кредит наличными',
      image: ren, // Ссылка на картинку
      rate: 'До 40% годовых',
      term: 'До 84 месяцев',
      sum: '30 000 - 2 млн ₽',
      link: 'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6138&p=10695&erid=2W5zFJeimse'
    },
      {
      bank: 'АТБ - Кредит наличными',
      image: atb, // Ссылка на картинку
      rate: 'До 39% годовых',
      term: 'До 84 месяцев',
      sum: '30 000 - 5 млн ₽',
      link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=2583&p=10695&erid=LjN8KGDaw'
    },
      {
      bank: 'Т-Банк - рефинансирование',
      image: tbank, // Ссылка на картинку
      rate: 'До 40% годовых',
      term: 'До 5 лет',
      sum: '50 000 - 5 млн ₽',
      link: 'https://my.saleads.pro/s/gf6yt?erid=2VtzqvB9uxS'
    },
      {
      bank: 'Т-Банк - кредит на карту',
      image: tbank, // Ссылка на картинку
      rate: 'До 41% годовых',
      term: 'До 15 лет',
      sum: '30 000 - 30 млн ₽',
      link: 'https://my.saleads.pro/s/jscd1?erid=2VtzqxkwKg2'
    },
      {
      bank: 'Альфа Банк - рефинансирование',
      image: alfa, // Ссылка на картинку
      rate: 'До 54% годовых',
      term: 'До 15 лет',
      sum: '30 000 - 30 млн ₽',
      link: 'https://my.saleads.pro/s/23z7g?erid=2Vtzqw5BBDp'
    },
      {
      bank: 'Альфа Банк - кредит наличными',
      image: alfa, // Ссылка на картинку
      rate: 'До 37% годовых',
      term: 'До 5 лет',
      sum: '30 000 - 7 млн ₽',
      link: 'https://my.saleads.pro/s/blewj?erid=2VtzqwLPiD3'
    },
   ];

   return (
     <div className="page">

       <div className="cards-grid">
         {demoData.map((item) => (
           <CardLoan key={item.bank} {...item} />
         ))}
       </div>
       
     </div>
   );
 };
 export default ConsumerLoans;