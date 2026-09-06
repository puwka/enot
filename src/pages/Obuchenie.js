import CatalogPage, { INFO_CATEGORIES } from '../components/CatalogPage';
import { useCatalogProducts } from '../hooks/useCatalogProducts';
import { EDUCATION_ITEMS, EDUCATION_CATALOG } from './EducationData';

const Obuchenie = () => {
  const items = useCatalogProducts('obuchenie', EDUCATION_ITEMS);
  return (
    <CatalogPage
      title="Обучение"
      description="Курсы, программы переподготовки и онлайн-школы — выберите направление и запишитесь на сайте организации."
      variant="education"
      catalogPath="/obuchenie"
      catalogLabel="Обучение"
      catalogPrefix="obuchenie"
      items={items}
      categories={INFO_CATEGORIES}
      ctaLabel="Подробнее"
    />
  );
};

export const OBUCHENIE_CATALOG = {
  ...EDUCATION_CATALOG,
  path: '/obuchenie',
  label: 'Обучение',
  prefix: 'obuchenie',
};

export default Obuchenie;
