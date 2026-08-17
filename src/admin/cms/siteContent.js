import { ARTICLES } from '../../data/articles';
import { NEWS } from '../../data/news';
import { ALL_OFFERS } from '../../data/offersRegistry';
import { slugify } from './cmsConstants';

export const PRODUCT_SECTIONS = {
  loans: {
    key: 'loans',
    title: 'Кредиты',
    listPath: '/admin/products/loans',
    paths: ['/loans', '/consumer-loans', '/collateral-loans'],
  },
  'debit-cards': {
    key: 'debit-cards',
    title: 'Дебетовые карты',
    listPath: '/admin/products/debit-cards',
    paths: ['/cards'],
  },
  'credit-cards': {
    key: 'credit-cards',
    title: 'Кредитные карты',
    listPath: '/admin/products/credit-cards',
    paths: ['/auto-loans'],
  },
  obuchenie: {
    key: 'obuchenie',
    title: 'Обучение',
    listPath: '/admin/products/obuchenie',
    paths: ['/obuchenie'],
  },
  services: {
    key: 'services',
    title: 'Сервисы',
    listPath: '/admin/products/services',
    paths: ['/services'],
  },
  shops: {
    key: 'shops',
    title: 'Магазины',
    listPath: '/admin/products/shops',
    paths: ['/shops'],
  },
};

const asUrl = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value);
};

const normalizeBlocks = (blocks = []) =>
  (Array.isArray(blocks) ? blocks : []).map((block) => {
    if (block.type === 'image') {
      return { ...block, src: asUrl(block.src), alt: block.alt || '' };
    }
    return { ...block };
  });

export const getSiteArticles = () =>
  ARTICLES.map((item, index) => ({
    id: `site-article:${item.slug}`,
    source: 'site',
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt || '',
    lead: item.excerpt || '',
    author: item.author || '',
    read_time: item.readTime || '',
    cover_url: asUrl(item.cover),
    category_title: item.category || '',
    category_id: null,
    meta_title: item.title,
    meta_description: item.excerpt || '',
    status: 'published',
    content_blocks: normalizeBlocks(item.blocks),
    toc: item.toc || [],
    cta: item.cta || {},
    facts: [],
    sort_order: index,
    published_at: item.dateISO || null,
  }));

export const getSiteNews = () =>
  NEWS.map((item, index) => ({
    id: `site-news:${item.slug}`,
    source: 'site',
    slug: item.slug,
    title: item.title,
    excerpt: item.lead || '',
    lead: item.lead || '',
    author: item.author || '',
    read_time: item.readTime || '',
    cover_url: asUrl(item.cover),
    category_title: item.category || '',
    category_id: null,
    meta_title: item.title,
    meta_description: item.lead || '',
    status: 'published',
    content_blocks: normalizeBlocks(item.blocks),
    toc: item.toc || [],
    cta: item.cta || {},
    facts: item.facts || [],
    sort_order: index,
    published_at: item.dateISO || null,
  }));

export const getSiteArticleBySlug = (slug) => getSiteArticles().find((item) => item.slug === slug) || null;
export const getSiteNewsBySlug = (slug) => getSiteNews().find((item) => item.slug === slug) || null;

const hasBlocks = (item) =>
  Array.isArray(item?.content_blocks)
    ? item.content_blocks.length > 0
    : Array.isArray(item?.blocks)
      ? item.blocks.length > 0
      : false;

export const mergeContentItems = (cmsItems = [], siteItems = []) => {
  const bySlug = new Map();
  siteItems.forEach((item) => bySlug.set(item.slug, item));
  cmsItems.forEach((item) => {
    const site = bySlug.get(item.slug);
    if (site && !hasBlocks(item) && hasBlocks(site)) {
      bySlug.set(item.slug, {
        ...item,
        source: 'cms',
        content_blocks: site.content_blocks || [],
        blocks: site.blocks || site.content_blocks || [],
        toc: item.toc?.length ? item.toc : site.toc,
        facts: item.facts?.length ? item.facts : site.facts,
        cta: item.cta && Object.keys(item.cta).length ? item.cta : site.cta,
      });
      return;
    }
    bySlug.set(item.slug, { ...item, source: 'cms' });
  });
  return Array.from(bySlug.values());
};

const pageBlock = (id, block_type, title, body = '', payload = {}, sort_order = 0) => ({
  id,
  block_type,
  title,
  body,
  payload,
  status: 'published',
  sort_order,
  is_hidden: false,
});

export const getSitePages = () => [
  {
    id: 'site-page:home',
    source: 'site',
    slug: 'home',
    title: 'Главная',
    meta_title: 'ЕнотМани — сравнение кредитов и карт',
    meta_description: 'Подбор кредитов, займов и банковских карт.',
    status: 'published',
    sort_order: 0,
    blocks: [
      pageBlock('home-hero', 'hero', 'Сравните кредиты и карты', 'Подберите выгодное предложение за пару минут.', {
        eyebrow: 'ЕнотМани',
        buttonLabel: 'Подобрать займ',
        buttonUrl: '/loans',
        src: '',
      }, 0),
      pageBlock('home-cats', 'cards', 'Популярные категории', '', {
        items: [
          { title: 'Потребительские кредиты', text: 'Сравните ставки и условия лучших банков' },
          { title: 'Дебетовые карты', text: 'Кэшбэк, проценты на остаток и бесплатное обслуживание' },
          { title: 'Кредитные карты', text: 'Льготный период и выгодные условия' },
          { title: 'Обучение', text: 'Курсы, переподготовка и онлайн-школы' },
          { title: 'Сервисы', text: 'Доставка, подработка и бытовые услуги' },
          { title: 'Магазины', text: 'Кешбэк и выгода при покупках у партнёров' },
        ],
      }, 10),
      pageBlock('home-offers', 'table', 'Лучшие предложения', 'Витрина лучших офферов с вкладками.', {
        headers: ['Банк', 'Ставка', 'Сумма', 'Срок'],
        rows: [
          ['Русский Стандарт', 'До 65%', '30 000 – 3 млн ₽', 'До 60 мес.'],
          ['Совкомбанк', 'До 30%', '30 000 – 5 млн ₽', 'До 5 лет'],
        ],
      }, 20),
      pageBlock('home-articles', 'cards', 'Полезные материалы', '', {
        items: [
          { title: 'Как снизить ставку', text: 'Рабочие способы' },
          { title: 'Кешбэк по картам', text: 'Как получать максимум' },
          { title: 'Безопасность', text: 'Защита платежей' },
        ],
      }, 30),
      pageBlock(
        'home-warning',
        'warning',
        'Важно знать',
        'ЕнотМани — информационный сервис сравнения финансовых предложений. Решение о оформлении принимаете вы.',
        {},
        40
      ),
    ],
  },
  {
    id: 'site-page:loans',
    source: 'site',
    slug: 'loans',
    title: 'Кредиты и займы',
    meta_title: 'Кредиты и займы',
    meta_description: 'Каталог кредитов и займов.',
    status: 'published',
    sort_order: 10,
    blocks: [
      pageBlock('loans-hero', 'hero', 'Кредиты и займы', 'Сравните актуальные предложения МФО и банков.', {
        buttonLabel: 'Смотреть каталог',
        buttonUrl: '/loans',
      }, 0),
      pageBlock('loans-list', 'list', 'Что сравниваем', '', {
        items: ['Ставка', 'Сумма', 'Срок', 'Партнёрская заявка'],
      }, 10),
    ],
  },
  {
    id: 'site-page:cards',
    source: 'site',
    slug: 'cards',
    title: 'Дебетовые карты',
    meta_title: 'Дебетовые карты',
    meta_description: 'Каталог дебетовых карт.',
    status: 'published',
    sort_order: 20,
    blocks: [
      pageBlock('cards-hero', 'hero', 'Дебетовые карты', 'Кешбэк, обслуживание и бонусы — в одном каталоге.', {
        buttonLabel: 'Смотреть карты',
        buttonUrl: '/cards',
      }, 0),
      pageBlock('cards-cta', 'cta', 'Подобрать карту', 'Сравните условия и оформите на сайте банка.', {
        buttonLabel: 'Открыть каталог',
        buttonUrl: '/cards',
      }, 10),
    ],
  },
  {
    id: 'site-page:auto-loans',
    source: 'site',
    slug: 'auto-loans',
    title: 'Кредитные карты',
    meta_title: 'Кредитные карты',
    meta_description: 'Каталог кредитных карт.',
    status: 'published',
    sort_order: 30,
    blocks: [
      pageBlock('credit-hero', 'hero', 'Кредитные карты', 'Лимиты, льготный период и рассрочка.', {
        buttonLabel: 'Смотреть карты',
        buttonUrl: '/auto-loans',
      }, 0),
    ],
  },
  {
    id: 'site-page:obuchenie',
    source: 'site',
    slug: 'obuchenie',
    title: 'Обучение',
    meta_title: 'Обучение',
    meta_description: 'Курсы, переподготовка и онлайн-школы.',
    status: 'published',
    sort_order: 35,
    blocks: [
      pageBlock(
        'obuchenie-hero',
        'hero',
        'Обучение',
        'Курсы, программы переподготовки и онлайн-школы — выберите направление и запишитесь на сайте организации.',
        { buttonLabel: 'Смотреть каталог', buttonUrl: '/obuchenie' },
        0
      ),
      pageBlock('obuchenie-list', 'list', 'Направления', '', {
        items: ['Психология и коучинг', 'IT и дизайн', 'Подготовка к ЕГЭ', 'Проф. переподготовка'],
      }, 10),
    ],
  },
  {
    id: 'site-page:services',
    source: 'site',
    slug: 'services',
    title: 'Сервисы',
    meta_title: 'Сервисы',
    meta_description: 'Подработка, доставка и бытовые услуги.',
    status: 'published',
    sort_order: 36,
    blocks: [
      pageBlock(
        'services-hero',
        'hero',
        'Сервисы',
        'Подработка, доставка, банковские и бытовые сервисы — актуальные предложения партнёров.',
        { buttonLabel: 'Смотреть каталог', buttonUrl: '/services' },
        0
      ),
      pageBlock('services-list', 'list', 'Категории', '', {
        items: ['Доставка', 'Курьер', 'Уборка', 'Колл-центр', 'Банковский сервис'],
      }, 10),
    ],
  },
  {
    id: 'site-page:shops',
    source: 'site',
    slug: 'shops',
    title: 'Магазины',
    meta_title: 'Магазины',
    meta_description: 'Кешбэк и выгода при покупках у партнёров.',
    status: 'published',
    sort_order: 37,
    blocks: [
      pageBlock(
        'shops-hero',
        'hero',
        'Магазины',
        'Карты и программы с выгодным кешбэком в магазинах, супермаркетах и у партнёров.',
        { buttonLabel: 'Смотреть каталог', buttonUrl: '/shops' },
        0
      ),
      pageBlock('shops-list', 'list', 'Выгода', '', {
        items: ['Кешбэк в супермаркетах', 'Баллы у партнёров', 'Бесплатное обслуживание'],
      }, 10),
    ],
  },
  {
    id: 'site-page:education',
    source: 'site',
    slug: 'Education',
    title: 'Статьи',
    meta_title: 'Статьи',
    meta_description: 'Полезные материалы о финансах.',
    status: 'published',
    sort_order: 40,
    blocks: [
      pageBlock('articles-hero', 'hero', 'Статьи и материалы', 'Обучение и разборы финансовых продуктов.', {
        buttonLabel: 'Читать статьи',
        buttonUrl: '/Education',
      }, 0),
      pageBlock('articles-list', 'list', 'Разделы', '', {
        items: ['Кредиты', 'Карты', 'Безопасность', 'Сравнение'],
      }, 10),
    ],
  },
  {
    id: 'site-page:news',
    source: 'site',
    slug: 'news',
    title: 'Новости',
    meta_title: 'Новости',
    meta_description: 'Новости финансового рынка.',
    status: 'published',
    sort_order: 50,
    blocks: [
      pageBlock('news-hero', 'hero', 'Новости', 'Актуальные изменения условий банков и рынка.', {
        buttonLabel: 'Все новости',
        buttonUrl: '/news',
      }, 0),
    ],
  },
  {
    id: 'site-page:faq',
    source: 'site',
    slug: 'faq',
    title: 'FAQ',
    meta_title: 'FAQ',
    meta_description: 'Частые вопросы.',
    status: 'published',
    sort_order: 60,
    blocks: [
      pageBlock('faq-block', 'faq', 'Частые вопросы', '', {
        items: [
          { q: 'ЕнотМани выдаёт кредиты?', a: 'Нет, сервис помогает сравнить предложения партнёров.' },
          { q: 'Это бесплатно?', a: 'Да, сравнение предложений на сайте бесплатно.' },
        ],
      }, 0),
    ],
  },
  {
    id: 'site-page:privacy',
    source: 'site',
    slug: 'privacy',
    title: 'Политика конфиденциальности',
    meta_title: 'Политика конфиденциальности',
    meta_description: 'Порядок обработки и защиты персональных данных пользователей сайта ЕнотМани.',
    status: 'published',
    sort_order: 70,
    blocks: [
      pageBlock(
        'privacy-hero',
        'hero',
        'Политика конфиденциальности',
        'Порядок обработки и защиты персональных данных пользователей сайта ЕнотМани.',
        {},
        0
      ),
      pageBlock(
        'privacy-general',
        'text',
        '1. Общие положения',
        '1.1. Настоящая Политика разработана в соответствии с ФЗ № 152-ФЗ «О персональных данных». 1.2. Оператор — владелец сервиса ЕнотМани. Вопросы: Telegram @enot_mani.',
        {},
        10
      ),
      pageBlock('privacy-data', 'list', '2. Какие данные собираются', '', {
        items: [
          'фамилия, имя, отчество',
          'контактный телефон',
          'адрес электронной почты',
          'иные данные, предоставленные добровольно',
          'технические данные об использовании сайта',
        ],
      }, 20),
      pageBlock('privacy-goals', 'list', '3. Цели обработки данных', '', {
        items: [
          'предоставление информации о финансовых продуктах',
          'обработка обращений пользователей',
          'обратная связь',
          'аналитика и улучшение работы сайта',
          'информационные сообщения при наличии согласия',
        ],
      }, 30),
      pageBlock(
        'privacy-transfer',
        'text',
        '4–7. Передача, защита и права',
        '4.1. При переходе к оформлению продукта пользователь взаимодействует с сайтом банка или компании. 5.1. Применяются организационные и технические меры защиты. 6.1. Пользователь может запросить уточнение или удаление данных через Telegram @enot_mani. 7.1. Актуальная версия политики доступна на этой странице.',
        {},
        40
      ),
      pageBlock('privacy-cta', 'cta', 'Остались вопросы по данным?', 'Напишите нам в Telegram — ответим по обработке персональных данных.', {
        buttonLabel: 'Telegram @enot_mani',
        buttonUrl: 'https://t.me/enot_mani',
      }, 50),
    ],
  },
  {
    id: 'site-page:terms',
    source: 'site',
    slug: 'terms',
    title: 'Условия использования',
    meta_title: 'Пользовательское соглашение',
    meta_description: 'Условия использования сайта ЕнотМани и правила работы с материалами сервиса.',
    status: 'published',
    sort_order: 80,
    blocks: [
      pageBlock(
        'terms-hero',
        'hero',
        'Пользовательское соглашение',
        'Условия использования сайта ЕнотМани и правила работы с материалами сервиса.',
        {},
        0
      ),
      pageBlock(
        'terms-subject',
        'text',
        '1. Предмет соглашения',
        '1.1. Соглашение определяет условия использования сайта ЕнотМани. 1.2. Используя сайт, вы подтверждаете согласие с условиями и политикой конфиденциальности.',
        {},
        10
      ),
      pageBlock(
        'terms-info',
        'text',
        '2. Характер информации',
        '2.1. Материалы носят справочный характер и не являются публичной офертой или финансовой рекомендацией. 2.2. Актуальные ставки и требования определяются банком на момент оформления.',
        {},
        20
      ),
      pageBlock('terms-duties', 'list', '3. Обязанности пользователя', '', {
        items: [
          'использовать сайт добросовестно и в рамках закона',
          'не нарушать работу сервиса',
          'самостоятельно проверять условия продукта перед оформлением',
          'не передавать третьим лицам доступы и коды подтверждения',
        ],
      }, 30),
      pageBlock(
        'terms-ip',
        'text',
        '4–6. Интеллектуальная собственность, ответственность, изменения',
        '4.1. Дизайн, тексты и материалы сайта охраняются законом. 5.1. Сервис не отвечает за решения банков и изменение их условий. 6.1. Соглашение может обновляться — продолжение использования означает принятие актуальной версии.',
        {},
        40
      ),
      pageBlock('terms-cta', 'cta', 'Смотрите также', 'Политика конфиденциальности и FAQ сервиса.', {
        buttonLabel: 'Политика',
        buttonUrl: '/privacy',
      }, 50),
    ],
  },
  {
    id: 'site-page:guide',
    source: 'site',
    slug: 'guide',
    title: 'Справочник',
    meta_title: 'Справочник',
    meta_description: 'Навигация по разделам сервиса и базовым терминам.',
    status: 'published',
    sort_order: 90,
    blocks: [
      pageBlock(
        'guide-hero',
        'hero',
        'Справочник',
        'Краткая навигация по разделам сервиса и базовым терминам — чтобы быстрее выбрать нужный продукт.',
        {},
        0
      ),
      pageBlock('guide-sections', 'cards', 'Разделы сервиса', '', {
        items: [
          { title: 'Кредиты и займы', text: 'Сравнение ставок, сумм и сроков' },
          { title: 'Потребительские кредиты', text: 'Кредиты наличными и рефинансирование' },
          { title: 'Кредитные карты', text: 'Лимиты, льготный период и рассрочка' },
          { title: 'Дебетовые карты', text: 'Кэшбэк, обслуживание и проценты на остаток' },
          { title: 'Кредиты под залог', text: 'Предложения под залог ПТС, авто и недвижимости' },
          { title: 'Обучение', text: 'Курсы, переподготовка и онлайн-школы' },
          { title: 'Сервисы', text: 'Доставка, подработка и бытовые услуги' },
          { title: 'Магазины', text: 'Кешбэк и выгода при покупках у партнёров' },
          { title: 'Статьи', text: 'Материалы о ставках, кэшбэке и безопасности' },
        ],
      }, 10),
      pageBlock('guide-terms', 'cards', 'Базовые термины', '', {
        items: [
          { title: 'Ставка', text: 'Стоимость пользования деньгами' },
          { title: 'Срок', text: 'Период кредита или действия лимита' },
          { title: 'Льготный период', text: 'Время без процентов по кредитной карте' },
          { title: 'Кэшбэк', text: 'Возврат части суммы покупок' },
        ],
      }, 20),
      pageBlock('guide-cta', 'cta', 'Готовы сравнить предложения?', 'Начните с кредитов или карт — условия собраны в одном месте.', {
        buttonLabel: 'Кредиты',
        buttonUrl: '/loans',
      }, 30),
    ],
  },
];

export const getSitePageBySlug = (slug) => getSitePages().find((item) => item.slug === slug) || null;

export const mergePageItems = (cmsItems = [], siteItems = []) => {
  const bySlug = new Map();
  siteItems.forEach((item) => bySlug.set(item.slug, item));
  cmsItems.forEach((item) => {
    const site = bySlug.get(item.slug);
    if (site && !(item.blocks || []).length && (site.blocks || []).length) {
      bySlug.set(item.slug, { ...item, source: 'cms', blocks: site.blocks });
      return;
    }
    bySlug.set(item.slug, { ...item, source: 'cms', blocks: item.blocks || [] });
  });
  return Array.from(bySlug.values());
};

export const getSiteProducts = (sectionKey) => {
  const section = PRODUCT_SECTIONS[sectionKey];
  if (!section) return [];
  return ALL_OFFERS.filter((offer) => section.paths.includes(offer.catalogPath)).map((offer, index) => ({
    id: `site-product:${offer.slug}`,
    source: 'site',
    slug: offer.slug,
    title: offer.title,
    partner_url: offer.link || '',
    image_url: asUrl(offer.image),
    rate_label: offer.rate || '',
    term_label: offer.term || '',
    amount_label: offer.sum || '',
    benefit_1: offer.benefit1 || '',
    benefit_2: offer.benefit2 || '',
    benefit_3: offer.benefit3 || '',
    spec: offer.spec || '',
    short_description: offer.benefit1 || '',
    catalog_path: offer.catalogPath,
    catalog_label: offer.catalogLabel,
    variant: offer.variant,
    status: 'published',
    sort_order: index,
  }));
};

export const getSiteProductBySlug = (slug) => {
  const offer = ALL_OFFERS.find((item) => item.slug === slug);
  if (!offer) return null;
  return {
    id: `site-product:${offer.slug}`,
    source: 'site',
    slug: offer.slug,
    title: offer.title,
    partner_url: offer.link || '',
    image_url: asUrl(offer.image),
    rate_label: offer.rate || '',
    term_label: offer.term || '',
    amount_label: offer.sum || '',
    benefit_1: offer.benefit1 || '',
    benefit_2: offer.benefit2 || '',
    benefit_3: offer.benefit3 || '',
    spec: offer.spec || '',
    short_description: offer.benefit1 || '',
    catalog_path: offer.catalogPath,
    catalog_label: offer.catalogLabel,
    variant: offer.variant,
    status: 'published',
    sort_order: 0,
  };
};

export const getSiteBanks = () => {
  const map = new Map();
  ALL_OFFERS.forEach((offer) => {
    const name = String(offer.bank || offer.title || '').split(' - ')[0].split(' — ')[0].trim();
    if (!name) return;
    const slug = slugify(name);
    if (!map.has(slug)) {
      map.set(slug, {
        id: `site-bank:${slug}`,
        source: 'site',
        slug,
        name,
        logo_url: asUrl(offer.image),
        website_url: '',
        status: 'published',
        products_count: 0,
      });
    }
    map.get(slug).products_count += 1;
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
};

export const toCmsPayloadFromSite = (item) => ({
  title: item.title,
  slug: item.slug,
  excerpt: item.excerpt || item.lead || '',
  lead: item.lead || item.excerpt || '',
  author: item.author || '',
  read_time: item.read_time || '',
  cover_url: item.cover_url || '',
  category_id: item.category_id || null,
  meta_title: item.meta_title || item.title || '',
  meta_description: item.meta_description || item.excerpt || item.lead || '',
  status: item.status || 'published',
  content_blocks: item.content_blocks || [],
  toc: item.toc || [],
  cta: item.cta || {},
  facts: item.facts || [],
  published_at: item.published_at || null,
});
