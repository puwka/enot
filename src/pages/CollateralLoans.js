import CatalogPage from '../components/CatalogPage';
import draiv from '../images/draiv.webp';
import car from '../images/car.webp';
import dobro from '../images/dobro.webp';
import sovk from '../images/sov.webp';
import tbank from '../images/tbank.webp';

export const COLLATERAL_LOANS_ITEMS = [
  { bank: 'ДрайвЗайм - Залог ПТС', image: draiv, rate: 'До 9% в месяц', term: 'До 3 лет', sum: '10 000 - 500 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6864&p=10695&erid=2W5zFHwPkAU' },
  { bank: 'CarMoney - займ на карту до 1 млн', image: car, rate: 'До 129% годовых', term: 'До 48 месяцев', sum: '50 000 - 1 млн ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6848&p=10695&erid=2W5zFJEsCvt' },
  { bank: 'Доброзайм - Выдача под залог ПТС', image: dobro, rate: '89% в год', term: 'До 5 лет', sum: '50 000 - 1 млн ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6625&p=10695&erid=LjN8KZcbU' },
  { bank: 'Совкомбанк - под залог недвижимости', image: sovk, rate: 'До 20% годовых', term: 'До 180 месяцев', sum: '200 000 - 30 млн ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6584&p=10695&erid=2W5zFGMBh6G' },
  { bank: 'Совкомбанк - под залог авто', image: sovk, rate: 'До 15% годовых', term: 'До 60 месяцев', sum: '150 000 - 15 млн ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6221&p=10695&erid=2W5zFGGjjFE' },
  { bank: 'Т-Банк - Кредит под залог недвижимости', image: tbank, rate: 'До 32% годовых', term: 'до 15 лет', sum: '500 000 - 30 млн ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=4740&p=10695&erid=LjN8KFSkV' },
];

export const COLLATERAL_LOANS_CATALOG = {
  path: '/collateral-loans',
  label: 'Кредиты под залог',
  variant: 'loan',
  prefix: 'collateral',
  ctaLabel: 'Подробнее',
  items: COLLATERAL_LOANS_ITEMS,
};

const CollateralLoans = () => (
  <CatalogPage
    title="Кредиты под залог"
    description="Предложения под залог ПТС, авто и недвижимости. Сравните ставки, сроки и суммы."
    variant="loan"
    catalogPath="/collateral-loans"
    catalogLabel="Кредиты под залог"
    catalogPrefix="collateral"
    items={COLLATERAL_LOANS_ITEMS}
    ctaLabel="Подробнее"
  />
);

export default CollateralLoans;
