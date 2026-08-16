import CatalogPage, { INFO_CATEGORIES } from '../components/CatalogPage';
import dost from '../images/dost.webp';
import yandex from '../images/yandex1.webp';
import yandex1 from '../images/yandex.webp';
import alfa from '../images/alfa.webp';
import voxys from '../images/voxys.webp';
import tin from '../images/tbank.webp';
import domovenok from '../images/domovenok.webp';

export const JOB_ITEMS = [
  { nameis: 'Яндекс-Маркет', image: yandex, spec: 'Кладовщик', link: 'https://my.saleads.pro/s/p04u3?erid=2Vtzqw9y84u' },
  { nameis: 'Работа в Т-Банке HR', image: tin, spec: 'Представитель', link: 'https://my.saleads.pro/s/zaoh6?erid=2VtzqubADhQ' },
  { nameis: 'Мобильный банкир', image: alfa, spec: 'Доставка', link: 'https://my.saleads.pro/s/8ds7i?erid=2Vtzqw87pcv' },
  { nameis: 'Voxys HR', image: voxys, spec: 'Оператор', link: 'https://my.saleads.pro/s/wemed?erid=2VtzqwpNari' },
  { nameis: 'Альфа - Агент (DSA)', image: alfa, spec: 'Продажи', link: 'https://my.saleads.pro/s/qyfdo?erid=2Vtzqw6dqLa' },
  { nameis: 'Домовёнок HR', image: domovenok, spec: 'Клининг', link: 'https://my.saleads.pro/s/cvpa5?erid=2VtzqvsLSU5' },
  { nameis: 'Яндекс Еда HR', image: yandex1, spec: 'Курьер', link: 'https://my.saleads.pro/s/vx0x7?erid=2VtzqwSDctu' },
  { nameis: 'Достависта', image: dost, spec: 'Курьер', link: 'https://my.saleads.pro/s/lmh0s?erid=2VtzqwA533u' },
];

export const JOB_CATALOG = {
  path: '/Job',
  label: 'Вакансии',
  variant: 'job',
  prefix: 'job',
  ctaLabel: 'Оставить заявку',
  items: JOB_ITEMS,
};

const Job = () => (
  <CatalogPage
    title="Вакансии"
    description="Актуальные вакансии: доставка, банки, продажи и сервис."
    variant="job"
    catalogPath="/Job"
    catalogLabel="Вакансии"
    catalogPrefix="job"
    items={JOB_ITEMS}
    categories={INFO_CATEGORIES}
    ctaLabel="Оставить заявку"
  />
);

export default Job;
