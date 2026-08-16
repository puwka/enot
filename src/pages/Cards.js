import CatalogPage from '../components/CatalogPage';
import vtb from '../images/vtb.webp';
import alfa from '../images/alfa.webp';
import mts from '../images/mts.webp';
import fora from '../images/fora.webp';
import ural from '../images/ural.webp';
import bspb from '../images/bspb.webp';
import bars from '../images/bars.webp';
import otp from '../images/otp.webp';
import tin from '../images/tbank.webp';

export const CARDS_ITEMS = [
  { bank: 'ВТБ - Дебетовая карта "МИР Весёлая"', opis: 'Кешбэк рублями до 3000 ₽', opis1: 'Бесплатная доставка по России', opis2: 'Бесплатное обслуживание', image: vtb, link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7332&p=10695&erid=2W5zFJuUpi5' },
  { bank: 'Альфа-Банк - Апельсиновая карта', opis: 'Кешбэк до 7% на продукты', opis1: 'Оплачивайте баллами до 100%', opis2: 'Бесплатное обслуживание', image: alfa, link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7049&p=10695&erid=2W5zFHrdQPS' },
  { bank: 'МТС Деньги - Дебетовая карта', opis: 'До 10 000 ₽ кешбэк в месяц', opis1: '5% в супермаркетах', opis2: '30% на связь', image: mts, link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6766&p=10695&erid=2W5zFFy4MBv' },
  { bank: 'Фора-Банк - Дебетовая Карта «Все включено»', opis: 'До 10 000 ₽ кешбэк в месяц', opis1: 'До 40% выгода в магазинах', opis2: 'Бесплатное обслуживание', image: fora, link: 'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6236&p=10695&erid=LjN8KXfdi' },
  { bank: 'Уралсиб Банк - карта "Прибыль"', opis: 'Кешбэк рублями до 30%', opis1: 'До 12.5% на остаток', opis2: 'Бесплатное обслуживание', image: ural, link: 'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5549&p=10695&erid=2W5zFGJHX4k' },
  { bank: 'БСПБ - Дебетовая карта Яркая', opis: 'Кешбэк до 25%', opis1: 'До 15% годовых на остаток', opis2: 'Бесплатное обслуживание', image: bspb, link: 'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=7224&p=10695&erid=2W5zFH96mxL' },
  { bank: 'Альфа Банк - Альфа‑Смарт', opis: 'Кешбэк до 7000 ₽ в месяц', opis1: '4 категории кешбэка', opis2: 'Снятие до 200 000₽', image: alfa, link: 'https://my.saleads.pro/s/Jpxs2?erid=2VtzquvpuBc' },
  { bank: 'Альфа Банк - карта для Иностранцев', opis: 'Вернем до 30% от стоимости', opis1: 'Снятие наличных без комиссии', opis2: 'Бесплатное обслуживание', image: alfa, link: 'https://my.saleads.pro/s/9ot3b?erid=2Vtzquzmzz2' },
  { bank: 'Ак Барс Банк - дебетовая карта Барс Карта', opis: 'Кешбек до 10%', opis1: 'До 9% годовых', opis2: 'Бесплатное обслуживание', image: bars, link: 'https://my.saleads.pro/s/mi1lJ?erid=2VtzqwFPgna' },
  { bank: 'ОТП Банк - Дебетовая карта Premium', opis: 'Кешбэк до 5%', opis1: 'Переводы SWIFT', opis2: 'Бесплатное обслуживание', image: otp, link: 'https://my.saleads.pro/s/u8jom?erid=2Vtzqx9h7XU' },
  { bank: 'ОТП Банк - Дебетовая карта «ОТП карта»', opis: 'Кешбэк  до 10%', opis1: 'Снятие до 500 000 ₽', opis2: 'Бесплатное обслуживание', image: otp, link: 'https://my.saleads.pro/s/k52i0?erid=2VtzqvZiBDx' },
  { bank: ' Альфа Банк - карта для молодёжи', opis: 'Игры с кешбэком до 10%', opis1: 'Выгода до 100%', opis2: 'Бесплатное обслуживание', image: alfa, link: 'https://my.saleads.pro/s/y6bqu?erid=2Vtzquwp2RL' },
  { bank: 'Т-Банк - дебетовая карта Drive', opis: 'До 10% за покупки на АЗС', opis1: 'До 5% за автоуслуги', opis2: '1% за другие покупки', image: tin, link: 'https://my.saleads.pro/s/dcJ8k?erid=2Vtzqvk9Tcz' },
  { bank: 'Альфа Банк - карта для самозанятых', opis: 'До 100% кешбэк на остаток', opis1: 'Низкие налоговые ставки', opis2: 'Бесплатное обслуживание', image: alfa, link: 'https://my.saleads.pro/s/7z95y?erid=2VtzquvL38z' },
  { bank: 'Альфа Банк - «Пенсия в Альфа-Банке»', opis: '5% кешбэк в аптеках', opis1: 'Защита от мошенников', opis2: 'Бесплатное обслуживание', image: alfa, link: 'https://my.saleads.pro/s/wem6d?erid=2Vtzqutr3re' },
  { bank: 'Т-Банк - дебетовая карта Islam Black', opis: 'Кэшбэк до 3 000 ₽ в месяц', opis1: 'до 30 млн ₽ в месяц через СБП', opis2: 'Не требуется паспорт', image: tin, link: 'https://my.saleads.pro/s/vx0c7?erid=2Vtzqw2cQni' },
  { bank: 'Т-Банк - дебетовая карта Black Premium', opis: 'Кэшбэк 5% на рестораны', opis1: 'До 60 000 ₽ кэшбэк за покупки', opis2: 'До 14% годовых по вкладу', image: tin, link: 'https://my.saleads.pro/s/atuzw?erid=2VtzqupQ61c' },
  { bank: 'Т-Банк - дебетовая карта для нерезидентов', opis: 'Кешбэк до 3000₽ в месяц', opis1: 'Переводы за рубеж до 5 млн', opis2: 'Бесплатное обслуживание', image: tin, link: 'https://my.saleads.pro/s/h1kev?erid=2VtzqvhJsaN' },
  { bank: 'Т-Банк - дебетовая карта ALL Airlines', opis: 'До 30% кэшбэк милями', opis1: '1,5% за повседневные покупки', opis2: 'До 5% за авиабилеты', image: tin, link: 'https://my.saleads.pro/s/4gyxa?erid=2Vtzqv8CvrA' },
  { bank: 'Альфа Банк - дебетовая детская карта', opis: 'Кэшбэк до 10 в Пятёрочке', opis1: 'Кешбэк до 2000 ₽ месяц', opis2: 'Бесплатное обслуживание', image: tin, link: 'https://my.saleads.pro/s/r27g4?erid=2Vtzqunv6jG' },
  { bank: 'Т-Банк - карта Black Молодежная', opis: 'До 30% — в магазинах', opis1: 'Бесплатная доставка', opis2: 'Вернем 1% за все покупки', image: tin, link: 'https://my.saleads.pro/s/fbwjn?erid=2VtzqwntwD8' },
  { bank: 'Т-Банк - дебетовая карта Джуниор', opis: 'Кэшбэк до 30%', opis1: 'Снятие до 20 000 ₽ в месяц', opis2: 'Бесплатно навсегда', image: tin, link: 'https://my.saleads.pro/s/sJv2r?erid=2VtzqwXwfsc' },
];

export const CARDS_CATALOG = {
  path: '/cards',
  label: 'Дебетовые карты',
  variant: 'debit',
  prefix: 'cards',
  ctaLabel: 'Оформить карту',
  items: CARDS_ITEMS,
};

const Cards = () => (
  <CatalogPage
    title="Дебетовые карты"
    description="Кэшбэк, проценты на остаток и бесплатное обслуживание — выберите карту под свои задачи."
    variant="debit"
    catalogPath="/cards"
    catalogLabel="Дебетовые карты"
    catalogPrefix="cards"
    items={CARDS_ITEMS}
    ctaLabel="Оформить карту"
  />
);

export default Cards;
