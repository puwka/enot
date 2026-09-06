import CatalogPage, { PRODUCT_CATEGORIES } from '../components/CatalogPage';
import { useCatalogProducts } from '../hooks/useCatalogProducts';

export const SETTLEMENT_ITEMS = [];

export const SETTLEMENT_CATALOG = {
  path: '/settlement-accounts',
  label: 'Расчётные счета',
  variant: 'debit',
  prefix: 'settlement',
  ctaLabel: 'Открыть счёт',
  items: SETTLEMENT_ITEMS,
};

const SettlementAccounts = () => {
  const items = useCatalogProducts('settlement-accounts', SETTLEMENT_ITEMS);
  return (
    <CatalogPage
      title="Расчётные счета"
      description="Сравните тарифы РКО и условия открытия расчётного счёта для бизнеса."
      variant="debit"
      catalogPath="/settlement-accounts"
      catalogLabel="Расчётные счета"
      catalogPrefix="settlement"
      items={items}
      categories={PRODUCT_CATEGORIES}
      ctaLabel="Открыть счёт"
    />
  );
};

export default SettlementAccounts;
