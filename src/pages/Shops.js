import CatalogPage, { INFO_CATEGORIES } from '../components/CatalogPage';
import yandex from '../images/yandex.webp';
import alfa from '../images/alfa.webp';
import mts from '../images/mts.webp';
import fora from '../images/fora.webp';
import ural from '../images/ural.webp';
import tin from '../images/tbank.webp';
import bspb from '../images/bspb.webp';

export const SHOPS_ITEMS = [
  { bank: 'Яндекс Маркет', opis: 'Кешбэк и акции', opis1: 'Миллионы товаров', opis2: 'Доставка по России', image: yandex, link: 'https://my.saleads.pro/s/p04u3?erid=2Vtzqw9y84u' },
  { bank: 'Альфа-Банк — Апельсиновая', opis: 'Кешбэк до 7% на продукты', opis1: 'Оплата баллами до 100%', opis2: 'Бесплатное обслуживание', image: alfa, link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7049&p=10695&erid=2W5zFHrdQPS' },
  { bank: 'МТС Деньги', opis: '5% в супермаркетах', opis1: 'До 10 000 ₽ кешбэк', opis2: '30% на связь', image: mts, link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6766&p=10695&erid=2W5zFFy4MBv' },
  { bank: 'Фора-Банк — Все включено', opis: 'До 40% в магазинах', opis1: 'До 10 000 ₽ кешбэк', opis2: 'Бесплатное обслуживание', image: fora, link: 'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6236&p=10695&erid=LjN8KXfdi' },
  { bank: 'Уралсиб — Прибыль', opis: 'Кешбэк до 30%', opis1: 'До 12.5% на остаток', opis2: 'Бесплатное обслуживание', image: ural, link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5549&p=10695&erid=2W5zFGJHX4k' },
  { bank: 'БСПБ — Яркая', opis: 'Кешбэк до 25%', opis1: 'До 15% на остаток', opis2: 'Бесплатное обслуживание', image: bspb, link: 'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=7224&p=10695&erid=2W5zFH96mxL' },
  { bank: 'Т-Банк — Black', opis: 'Кешбэк в магазинах', opis1: 'До 30% у партнёров', opis2: '1% на все покупки', image: tin, link: 'https://my.saleads.pro/s/fbwjn?erid=2VtzqwntwD8' },
];

export const SHOPS_CATALOG = {
  path: '/shops',
  label: 'Магазины',
  variant: 'shop',
  prefix: 'shops',
  ctaLabel: 'Подробнее',
  items: SHOPS_ITEMS,
};

const Shops = () => (
  <CatalogPage
    title="Магазины"
    description="Карты и программы с выгодным кешбэком в магазинах, супермаркетах и у партнёров."
    variant="shop"
    catalogPath="/shops"
    catalogLabel="Магазины"
    catalogPrefix="shops"
    items={SHOPS_ITEMS}
    categories={INFO_CATEGORIES}
    ctaLabel="Подробнее"
  />
);

export default Shops;
