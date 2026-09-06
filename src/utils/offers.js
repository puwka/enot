import { getSectionByCatalogPath } from '../admin/cms/productSections';

export const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

export const enrichOffers = (items, meta) => {
  const { catalogPath, catalogLabel, variant, prefix, ctaLabel } = meta;
  return items.map((item, index) => {
    const title = item.title || item.bank || item.nameis || item.naprav || `offer-${index}`;
    const slug = item.slug || `${prefix}-${slugify(title)}-${index}`;
    return {
      ...item,
      title,
      slug,
      id: item.slug || item.id || item.link || slug,
      catalogPath,
      catalogLabel,
      variant,
      ctaLabel: ctaLabel || 'Подробнее',
      benefit1: item.benefit1 || item.opis || '',
      benefit2: item.benefit2 || item.opis1 || '',
      benefit3: item.benefit3 || item.opis2 || '',
      spec: item.spec || '',
      rate: item.rate || '',
      sum: item.sum || '',
      term: item.term || '',
    };
  });
};

const splitParagraphs = (text) =>
  String(text || '')
    .split(/\n+/)
    .map((row) => row.trim())
    .filter(Boolean);

const resolveSection = (offer) => getSectionByCatalogPath(offer.catalogPath) || null;

const buildConditionRows = (offer, section) => {
  const attrs = offer.attributes || {};
  const fields = attrs.conditions || {};
  if (section?.freeformConditions) {
    const text = offer.conditions || attrs.conditions_text || '';
    if (!text.trim()) return [];
    return splitParagraphs(text).map((value, index) => ({
      label: index === 0 ? 'Условия' : `Условие ${index + 1}`,
      value,
    }));
  }
  const keys = section?.conditionFields || [];
  return keys
    .map((field) => ({
      label: field.label,
      value: fields[field.key] || '',
    }))
    .filter((row) => row.value);
};

const buildSpecs = (offer, section) => {
  const attrs = offer.attributes || {};
  const mode = section?.specsMode || 'loan';
  const advantages = Array.isArray(offer.advantages) ? offer.advantages.filter(Boolean) : [];

  if (mode === 'loan') {
    return [
      { label: 'Ставка', value: offer.rate || 'По условиям' },
      { label: 'Сумма', value: offer.sum || 'По условиям' },
      { label: 'Срок', value: offer.term || 'По условиям' },
    ];
  }
  if (mode === 'advantages') {
    const labels =
      offer.variant === 'settlement' || section?.key === 'settlement-accounts'
        ? ['Преимущество 1', 'Преимущество 2', 'Преимущество 3']
        : ['Преимущество 1', 'Преимущество 2', 'Преимущество 3'];
    return [0, 1, 2].map((index) => ({
      label: labels[index],
      value: advantages[index] || offer[`benefit${index + 1}`] || '—',
    }));
  }
  if (mode === 'shop') {
    const cond = attrs.conditions || {};
    return [
      { label: 'Категория', value: cond.shop_category || offer.spec || '—' },
      { label: 'Деятельность магазина', value: cond.shop_activity || offer.benefit1 || '—' },
      { label: 'Регион', value: cond.shop_region || offer.benefit2 || '—' },
    ];
  }
  if (mode === 'education') {
    return [
      { label: 'Направление', value: offer.title || '—' },
      { label: 'Формат', value: attrs.education_format || '—' },
      { label: 'Старт', value: attrs.education_start || '—' },
    ];
  }
  if (mode === 'service') {
    return [
      { label: 'Сервис', value: offer.title || '—' },
      { label: 'Направление', value: offer.spec || '—' },
      { label: 'Статус', value: 'Актуальное предложение' },
    ];
  }
  if (mode === 'job') {
    return [
      { label: 'Вакансия', value: offer.title || '—' },
      { label: 'Направление', value: offer.spec || '—' },
      { label: 'Статус', value: 'Актуальное предложение' },
    ];
  }
  return [
    { label: 'Ставка', value: offer.rate || '—' },
    { label: 'Сумма', value: offer.sum || '—' },
    { label: 'Срок', value: offer.term || '—' },
  ];
};

const defaultFaq = (offer) => [
  {
    q: 'Как подать заявку?',
    a: 'Нажмите кнопку оформления — откроется сайт компании, где можно отправить заявку онлайн.',
  },
  {
    q: 'Можно ли выбрать другое предложение?',
    a: `Да, вернитесь в раздел «${offer.catalogLabel || 'каталог'}» или посмотрите связанные предложения ниже.`,
  },
];

export const buildOfferContent = (offer) => {
  const section = resolveSection(offer);
  const attrs = offer.attributes || {};
  const description = offer.description || '';
  const mainInfo = attrs.main_info || '';
  const advantages = Array.isArray(offer.advantages) ? offer.advantages.filter(Boolean) : [];
  const heroEyebrow =
    section?.heroEyebrow ||
    (offer.variant === 'settlement'
      ? 'Расчётный счёт'
      : offer.catalogLabel || 'Предложение');

  const main = description
    ? splitParagraphs(description)
    : [`${offer.title} — предложение в разделе «${offer.catalogLabel || 'каталог'}».`];

  const conditions = buildConditionRows(offer, section);
  const withFallbackConditions =
    conditions.length > 0
      ? conditions
      : section?.freeformConditions
        ? []
        : (section?.conditionFields || []).map((field) => ({
            label: field.label,
            value: 'Уточняется при оформлении',
          }));

  return {
    heroEyebrow,
    heroLead: attrs.lead || '',
    specs: buildSpecs(offer, section),
    main,
    conditions: withFallbackConditions,
    advantages,
    mainInfo: mainInfo ? splitParagraphs(mainInfo) : [],
    showConditions: section ? Boolean(section.showConditions) : true,
    showAdvantages: section ? Boolean(section.showAdvantages) : true,
    showBottomMainInfo: section ? Boolean(section.showBottomMainInfo) : false,
    faq: defaultFaq(offer),
    extras: [],
  };
};
