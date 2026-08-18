export const PRODUCT_SECTIONS = {
  loans: {
    key: 'loans',
    title: 'Кредиты',
    categorySlug: 'loans',
    categorySlugs: ['loans', 'consumer-loans', 'collateral-loans'],
    listPath: '/admin/products/loans',
    paths: ['/loans', '/consumer-loans', '/collateral-loans'],
  },
  'debit-cards': {
    key: 'debit-cards',
    title: 'Дебетовые карты',
    categorySlug: 'debit-cards',
    categorySlugs: ['debit-cards'],
    listPath: '/admin/products/debit-cards',
    paths: ['/cards'],
  },
  'credit-cards': {
    key: 'credit-cards',
    title: 'Кредитные карты',
    categorySlug: 'credit-cards',
    categorySlugs: ['credit-cards'],
    listPath: '/admin/products/credit-cards',
    paths: ['/auto-loans'],
  },
};
