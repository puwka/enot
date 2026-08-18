const fs = require('fs');
const path = require('path');

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

const sqlStr = (value) => `'${String(value || '').replace(/'/g, "''")}'`;
const sqlNum = (value) => (value == null || Number.isNaN(value) ? 'NULL' : String(value));
const sqlJson = (value) => `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;

const parseAmount = (raw) => {
  if (!raw) return { min: null, max: null };
  const cleaned = String(raw).replace(/₽/g, '').trim();
  const parts = cleaned.split(/\s*[-–—]\s*/);
  const toNum = (part) => {
    if (!part) return null;
    const compact = part.replace(/\s/g, '').toLowerCase();
    const mln = compact.match(/([\d.,]+)\s*млн/);
    if (mln) return Number(mln[1].replace(',', '.')) * 1000000;
    const digits = compact.replace(/[^\d]/g, '');
    return digits ? Number(digits) : null;
  };
  return { min: toNum(parts[0]), max: toNum(parts[1] || parts[0]) };
};

const parseTerm = (raw) => {
  if (!raw) return { min: null, max: null };
  const text = String(raw).toLowerCase();
  const num = Number((text.match(/(\d+)/) || [])[1]);
  if (!num) return { min: null, max: null };
  if (text.includes('лет') || text.includes('год')) return { min: 1, max: num * 12 };
  if (text.includes('недел')) return { min: 1, max: Math.round(num / 4.3) || 1 };
  if (text.includes('дн')) return { min: 1, max: Math.max(1, Math.round(num / 30)) };
  return { min: 1, max: num };
};

const parseRate = (raw) => {
  if (!raw) return null;
  const match = String(raw).replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const extractObjects = (src) => {
  const start = src.search(/export const \w+_ITEMS = \[/);
  if (start < 0) return [];
  const slice = src.slice(src.indexOf('[', start) + 1);
  const objs = [];
  let buf = '';
  let depth = 0;
  for (const ch of slice) {
    if (ch === '{') depth += 1;
    if (depth) buf += ch;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        objs.push(buf);
        buf = '';
      }
    }
    if (ch === ']' && depth === 0) break;
  }
  return objs.map((block) => {
    const pick = (key) => {
      const match = block.match(new RegExp(`${key}:\\s*'((?:\\\\'|[^'])*)'`));
      return match ? match[1].replace(/\\'/g, "'") : '';
    };
    return {
      bank: pick('bank'),
      rate: pick('rate'),
      term: pick('term'),
      sum: pick('sum'),
      opis: pick('opis'),
      opis1: pick('opis1'),
      opis2: pick('opis2'),
      link: pick('link'),
    };
  });
};

const catalogs = [
  { file: 'src/pages/Loans.js', prefix: 'loans', category: 'loans', type: 'Займ' },
  { file: 'src/pages/ConsumerLoans.js', prefix: 'consumer', category: 'consumer-loans', type: 'Потребительский кредит' },
  { file: 'src/pages/CollateralLoans.js', prefix: 'collateral', category: 'collateral-loans', type: 'Кредит под залог' },
  { file: 'src/pages/Cards.js', prefix: 'cards', category: 'debit-cards', type: 'Дебетовая карта' },
  { file: 'src/pages/AutoLoans.js', prefix: 'cards-credit', category: 'credit-cards', type: 'Кредитная карта' },
];

const products = [];
const banks = new Map();

catalogs.forEach((catalog) => {
  const src = fs.readFileSync(path.join(process.cwd(), catalog.file), 'utf8');
  extractObjects(src).forEach((item, index) => {
    const title = item.bank || `${catalog.prefix}-${index}`;
    const slug = `${catalog.prefix}-${slugify(title)}-${index}`;
    const bankName = title.split(' - ')[0].split(' — ')[0].trim();
    const bankSlug = slugify(bankName);
    if (!banks.has(bankSlug)) banks.set(bankSlug, { name: bankName, slug: bankSlug });
    const amount = parseAmount(item.sum);
    const term = parseTerm(item.term);
    const advantages = [item.opis, item.opis1, item.opis2].filter(Boolean);
    products.push({
      slug,
      title,
      bankSlug,
      category: catalog.category,
      type: catalog.type,
      rate: parseRate(item.rate),
      rateLabel: item.rate || item.opis,
      amountMin: amount.min,
      amountMax: amount.max,
      amountLabel: item.sum,
      termMin: term.min,
      termMax: term.max,
      termLabel: item.term,
      link: item.link,
      advantages,
      sort: index,
    });
  });
});

const bankRows = Array.from(banks.values()).map((bank, index) =>
  `(${sqlStr(bank.slug)}, ${sqlStr(bank.name)}, 'published', ${index})`
);

const productSelects = products.map((item) => `SELECT
    c.id,
    b.id,
    ${sqlStr(item.slug)},
    ${sqlStr(item.title)},
    ${sqlStr(item.type)},
    ${sqlNum(item.rate)},
    ${sqlNum(item.amountMin)},
    ${sqlNum(item.amountMax)},
    ${sqlNum(item.termMin)},
    ${sqlNum(item.termMax)},
    ${sqlStr(item.rateLabel)},
    ${sqlStr(item.termLabel)},
    ${sqlStr(item.amountLabel)},
    ${sqlStr(item.advantages[0] || '')},
    ${sqlStr(item.advantages[1] || '')},
    ${sqlStr(item.advantages[2] || '')},
    ${sqlJson(item.advantages)},
    ${sqlStr(item.link)},
    ${sqlStr(item.link)},
    true,
    false,
    'published',
    ${item.sort},
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = ${sqlStr(item.bankSlug)}
  WHERE c.type = 'product' AND c.slug = ${sqlStr(item.category)}`);

const sql = `-- Сид банков и продуктов с публичного сайта
INSERT INTO public.categories (type, slug, title, path, variant, cta_label, status, sort_order)
VALUES
  ('product', 'loans', 'Кредиты и займы', '/loans', 'loan', 'Получить деньги', 'published', 10),
  ('product', 'consumer-loans', 'Потребительские кредиты', '/consumer-loans', 'loan', 'Оформить кредит', 'published', 20),
  ('product', 'credit-cards', 'Кредитные карты', '/auto-loans', 'credit-card', 'Оформить карту', 'published', 30),
  ('product', 'collateral-loans', 'Кредиты под залог', '/collateral-loans', 'loan', 'Оформить', 'published', 40),
  ('product', 'debit-cards', 'Дебетовые карты', '/cards', 'debit', 'Оформить карту', 'published', 50)
ON CONFLICT (type, slug) DO UPDATE SET
  title = EXCLUDED.title,
  path = EXCLUDED.path,
  variant = EXCLUDED.variant,
  cta_label = EXCLUDED.cta_label,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order;

INSERT INTO public.banks (slug, name, status, sort_order)
VALUES
${bankRows.join(',\n')}
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  updated_at = timezone('utc', now());

INSERT INTO public.financial_products (
  category_id, bank_id, slug, title, product_type, apr_rate, amount_min, amount_max, term_min, term_max,
  rate_label, term_label, amount_label, benefit_1, benefit_2, benefit_3, advantages, link, partner_url,
  active, featured, status, sort_order, published_at
)
${productSelects.join('\nUNION ALL\n')}
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  bank_id = EXCLUDED.bank_id,
  title = EXCLUDED.title,
  product_type = EXCLUDED.product_type,
  apr_rate = EXCLUDED.apr_rate,
  amount_min = EXCLUDED.amount_min,
  amount_max = EXCLUDED.amount_max,
  term_min = EXCLUDED.term_min,
  term_max = EXCLUDED.term_max,
  rate_label = EXCLUDED.rate_label,
  term_label = EXCLUDED.term_label,
  amount_label = EXCLUDED.amount_label,
  benefit_1 = EXCLUDED.benefit_1,
  benefit_2 = EXCLUDED.benefit_2,
  benefit_3 = EXCLUDED.benefit_3,
  advantages = EXCLUDED.advantages,
  link = EXCLUDED.link,
  partner_url = EXCLUDED.partner_url,
  active = EXCLUDED.active,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  updated_at = timezone('utc', now());
`;

const out = path.join(process.cwd(), 'supabase/migrations/20260818133000_seed_site_products.sql');
fs.writeFileSync(out, sql);
console.log(`Wrote ${products.length} products and ${banks.size} banks to ${out}`);
