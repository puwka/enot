import CatalogPage from '../components/CatalogPage';
import zaimerkart from '../images/zaimer.webp';
import bars from '../images/bars.webp';
import rus from '../images/rus.webp';
import ural from '../images/ural.webp';
import halva from '../images/halva.webp';
import tin from '../images/tbank.webp';

export const AUTO_LOANS_ITEMS = [
  { bank: 'Займер - Виртуальная карта', image: zaimerkart, rate: '0,65% в день', term: 'До 180 дней', sum: '15 000 - 100 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6736&p=10695&erid=2W5zFGNo5ep' },
  { bank: 'АК Барс - Кредитная карта 115 дней', image: bars, rate: 'До 115 дней без %', term: 'До 5 лет', sum: '10 000 - 1 000 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6474&p=10695&erid=2W5zFHxn2e4' },
  { bank: 'Русский Стандарт Банк - Кредитка', image: rus, rate: 'До 59% годовых', term: 'До 5 лет', sum: '30 000 - 1 000 000 ₽', link: 'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6460&p=10695&erid=2W5zFH3N6JD' },
  { bank: 'Уралсиб Банк - Кредитная карта', image: ural, rate: 'От 34,9% годовых', term: 'До 5 лет', sum: '10 000 - 5 000 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5567&p=10695&erid=2W5zFJjKetp' },
  { bank: 'Халва - Карта рассрочки', image: halva, rate: 'До 15% годовых', term: 'До 7 лет', sum: '10 000 - 100 000 ₽', link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=2413&p=10695&erid=LjN8KTAzF' },
  { id: 'tbank-drive-1', bank: 'Т-Банк — кредитная карта Drive', image: tin, rate: 'До 62% годовых', term: '5 лет', sum: '15 000 - 1 000 000 ₽', link: 'https://my.saleads.pro/s/ounml?erid=2VtzqvRynmt' },
  { id: 'tbank-drive-2', bank: 'Т-Банк — кредитная карта Drive', image: tin, rate: 'До 62% годовых', term: '5 лет', sum: '15 000 - 1 000 000 ₽', link: 'https://my.saleads.pro/s/8dski?erid=2Vtzqw6fAWA' },
];

export const AUTO_LOANS_CATALOG = {
  path: '/auto-loans',
  label: 'Кредитные карты',
  variant: 'loan',
  prefix: 'cards-credit',
  ctaLabel: 'Подробнее',
  items: AUTO_LOANS_ITEMS,
};

const AutoLoans = () => (
  <CatalogPage
    title="Кредитные карты"
    description="Лимиты, льготный период и рассрочка — сравните предложения банков в одном списке."
    variant="loan"
    catalogPath="/auto-loans"
    catalogLabel="Кредитные карты"
    catalogPrefix="cards-credit"
    items={AUTO_LOANS_ITEMS}
    ctaLabel="Подробнее"
  />
);

export default AutoLoans;
