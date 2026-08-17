import CatalogPage, { INFO_CATEGORIES } from '../components/CatalogPage';
import dost from '../images/dost.webp';
import yandex from '../images/yandex1.webp';
import alfa from '../images/alfa.webp';
import voxys from '../images/voxys.webp';
import tin from '../images/tbank.webp';
import domovenok from '../images/domovenok.webp';

export const SERVICES_ITEMS = [
  { nameis: 'Яндекс Еда — курьер', image: yandex, spec: 'Доставка', link: 'https://my.saleads.pro/s/vx0x7?erid=2VtzqwSDctu' },
  { nameis: 'Достависта', image: dost, spec: 'Курьер', link: 'https://my.saleads.pro/s/lmh0s?erid=2VtzqwA533u' },
  { nameis: 'Домовёнок — клининг', image: domovenok, spec: 'Уборка', link: 'https://my.saleads.pro/s/cvpa5?erid=2VtzqvsLSU5' },
  { nameis: 'Voxys HR — оператор', image: voxys, spec: 'Колл-центр', link: 'https://my.saleads.pro/s/wemed?erid=2VtzqwpNari' },
  { nameis: 'Т-Банк — представитель', image: tin, spec: 'Банковский сервис', link: 'https://my.saleads.pro/s/zaoh6?erid=2VtzqubADhQ' },
  { nameis: 'Альфа-Банк — мобильный банкир', image: alfa, spec: 'Доставка карт', link: 'https://my.saleads.pro/s/8ds7i?erid=2Vtzqw87pcv' },
  { nameis: 'Альфа-Банк — агент DSA', image: alfa, spec: 'Продажи', link: 'https://my.saleads.pro/s/qyfdo?erid=2Vtzqw6dqLa' },
];

export const SERVICES_CATALOG = {
  path: '/services',
  label: 'Сервисы',
  variant: 'service',
  prefix: 'services',
  ctaLabel: 'Подробнее',
  items: SERVICES_ITEMS,
};

const Services = () => (
  <CatalogPage
    title="Сервисы"
    description="Подработка, доставка, банковские и бытовые сервисы — актуальные предложения партнёров."
    variant="service"
    catalogPath="/services"
    catalogLabel="Сервисы"
    catalogPrefix="services"
    items={SERVICES_ITEMS}
    categories={INFO_CATEGORIES}
    ctaLabel="Подробнее"
  />
);

export default Services;
