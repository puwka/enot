import CatalogPage from '../components/CatalogPage';
import { useCatalogProducts } from '../hooks/useCatalogProducts';
import finmi from '../images/FinMi.webp';
import fin from '../images/finters.webp';
import sosed from '../images/sosed.webp';
import car from '../images/car.webp';
import ali from '../images/ali.webp';
import grand from '../images/grand.webp';
import asia from '../images/asia.webp';
import dobro from '../images/dobro.webp';
import medium from '../images/medium.webp';
import zaimer from '../images/zaimer.webp';
import laik from '../images/laik.webp';
import zanfin from '../images/zanfin.webp';
import kviki from '../images/kviki.webp';
import bstro from '../images/bstro.webp';
import money from '../images/money.webp';
import abr from '../images/abr.webp';

export const LOANS_ITEMS = [
  { bank: 'FINTERS', image: fin, rate: '0.8% в день', term: 'до 24 недель', sum: '3000 - 50 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7307&p=10695&erid=2W5zFH4LCZF' },
  { bank: 'FinMi', image: finmi, rate: '0.8% в день', term: 'до 70 дней', sum: '1000 - 50 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7304&p=10695&erid=2W5zFHRjyh3' },
  { bank: 'Привет, сосед!', image: sosed, rate: '0.8% в день', term: 'до 31 дня', sum: '1000 - 30 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7280&p=10695&erid=2W5zFHNcvWu' },
  { bank: 'CarMoney', image: car, rate: 'до 75% годовых', term: 'до 84 недель', sum: '50 000 - 1 млн ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7234&p=10695&erid=2W5zFHkxvwA' },
  { bank: 'Алистар', image: ali, rate: '0.8% в день', term: 'до 24 недель', sum: '5000 - 100 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7233&p=10695&erid=2W5zFJ8ghUV' },
  { bank: 'GranatFinance', image: grand, rate: '0.8% в день', term: 'до 360 дней', sum: '1000 - 100 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7223&p=10695&erid=2W5zFJN4wcM' },
  { bank: 'Asiacredit', image: asia, rate: '0.6% в день', term: 'до 12 месяцев', sum: '5000 - 100 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7213&p=10695&erid=2W5zFHEjvPr' },
  { bank: 'Доброзайм', image: dobro, rate: '0.8% в день', term: 'до 364 дней', sum: '1000 - 100 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7178&p=10695&erid=2W5zFHnPQoT' },
  { bank: 'Medium Score', image: medium, rate: '0.8% в день', term: 'до 30 дней', sum: '3000 - 30 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7128&p=10695&erid=2W5zFJDLBdS' },
  { bank: 'Займер', image: zaimer, rate: '0.8% в день', term: 'до 30 дней', sum: '2000 - 30 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7073&p=10695&erid=2W5zFJCB1U4' },
  { bank: 'Лайк Мани', image: laik, rate: '0.8% в день', term: 'до 180 дней', sum: '2000 - 100 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7038&p=10695&erid=2W5zFHHtZeg' },
  { bank: 'Финансы', image: zanfin, rate: '0.8% в день', term: 'до 365 дней', sum: '1000 - 100 000 ₽', link: 'https://my.saleads.pro/s/6wlc8?erid=2VtzqvAAbzM' },
  { bank: 'Kviki', image: kviki, rate: '0.8% в день', term: 'до 360 дней', sum: '1000 - 100 000 ₽', link: 'https://my.saleads.pro/s/39azf?erid=2Vtzqw5YA8m' },
  { bank: 'Быстроденьги', image: bstro, rate: '0.8% в день', term: 'до 180 дней', sum: '3000 - 40 000 ₽', link: 'https://my.saleads.pro/s/lmhes?erid=2VtzqwgYGfX' },
  { bank: 'Монеткин', image: money, rate: '0.8% в день', term: 'до 365 дней', sum: '1000 - 100 000 ₽', link: 'https://my.saleads.pro/s/p04x3?erid=2VtzqvWJVs3' },
  { bank: 'У Абрамовича', image: abr, rate: '0.8% в день', term: 'до 365 дней', sum: '1000 - 100 000 ₽', link: 'https://my.saleads.pro/s/ountl?erid=2Vtzqv8gci1' },
];

export const LOANS_CATALOG = {
  path: '/loans',
  label: 'Кредиты и займы',
  variant: 'loan',
  prefix: 'loans',
  ctaLabel: 'Получить деньги',
  items: LOANS_ITEMS,
};

const Loans = () => {
  const items = useCatalogProducts('loans', LOANS_ITEMS);

  return (
    <CatalogPage
      title="Кредиты и займы"
      description="Сравните актуальные предложения МФО и выберите подходящие условия по сумме, сроку и ставке."
      variant="loan"
      catalogPath="/loans"
      catalogLabel="Кредиты и займы"
      catalogPrefix="loans"
      items={items}
      ctaLabel="Получить деньги"
    />
  );
};

export default Loans;
