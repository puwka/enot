import CatalogPage, { INFO_CATEGORIES } from '../components/CatalogPage';
import { EDUCATION_ITEMS, EDUCATION_CATALOG } from './EducationData';

const Obuchenie = () => (
  <CatalogPage
    title="Обучение"
    description="Курсы, программы переподготовки и онлайн-школы — выберите направление и запишитесь на сайте организации."
    variant="education"
    catalogPath="/obuchenie"
    catalogLabel="Обучение"
    catalogPrefix="obuchenie"
    items={EDUCATION_ITEMS}
    categories={INFO_CATEGORIES}
    ctaLabel="Подробнее"
  />
);

export const OBUCHENIE_CATALOG = {
  ...EDUCATION_CATALOG,
  path: '/obuchenie',
  label: 'Обучение',
  prefix: 'obuchenie',
};

export default Obuchenie;
