-- Сид банков и продуктов с публичного сайта
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
('finters', 'FINTERS', 'published', 0),
('finmi', 'FinMi', 'published', 1),
('привет-сосед', 'Привет, сосед!', 'published', 2),
('carmoney', 'CarMoney', 'published', 3),
('алистар', 'Алистар', 'published', 4),
('granatfinance', 'GranatFinance', 'published', 5),
('asiacredit', 'Asiacredit', 'published', 6),
('доброзайм', 'Доброзайм', 'published', 7),
('medium-score', 'Medium Score', 'published', 8),
('займер', 'Займер', 'published', 9),
('лайк-мани', 'Лайк Мани', 'published', 10),
('финансы', 'Финансы', 'published', 11),
('kviki', 'Kviki', 'published', 12),
('быстроденьги', 'Быстроденьги', 'published', 13),
('монеткин', 'Монеткин', 'published', 14),
('у-абрамовича', 'У Абрамовича', 'published', 15),
('русский-стандарт-банк', 'Русский Стандарт Банк', 'published', 16),
('совкомбанк', 'Совкомбанк', 'published', 17),
('ренессанс-банк', 'Ренессанс Банк', 'published', 18),
('атб', 'АТБ', 'published', 19),
('т-банк', 'Т-Банк', 'published', 20),
('альфа-банк', 'Альфа Банк', 'published', 21),
('драйвзайм', 'ДрайвЗайм', 'published', 22),
('втб', 'ВТБ', 'published', 23),
('мтс-деньги', 'МТС Деньги', 'published', 24),
('фора-банк', 'Фора-Банк', 'published', 25),
('уралсиб-банк', 'Уралсиб Банк', 'published', 26),
('бспб', 'БСПБ', 'published', 27),
('ак-барс-банк', 'Ак Барс Банк', 'published', 28),
('отп-банк', 'ОТП Банк', 'published', 29),
('ак-барс', 'АК Барс', 'published', 30),
('халва', 'Халва', 'published', 31)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  updated_at = timezone('utc', now());

INSERT INTO public.financial_products (
  category_id, bank_id, slug, title, product_type, apr_rate, amount_min, amount_max, term_min, term_max,
  rate_label, term_label, amount_label, benefit_1, benefit_2, benefit_3, advantages, link, partner_url,
  active, featured, status, sort_order, published_at
)
SELECT
    c.id,
    b.id,
    'loans-finters-0',
    'FINTERS',
    'Займ',
    0.8,
    3000,
    50000,
    1,
    6,
    '0.8% в день',
    'до 24 недель',
    '3000 - 50 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7307&p=10695&erid=2W5zFH4LCZF',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7307&p=10695&erid=2W5zFH4LCZF',
    true,
    false,
    'published',
    0,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'finters'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-finmi-1',
    'FinMi',
    'Займ',
    0.8,
    1000,
    50000,
    1,
    2,
    '0.8% в день',
    'до 70 дней',
    '1000 - 50 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7304&p=10695&erid=2W5zFHRjyh3',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7304&p=10695&erid=2W5zFHRjyh3',
    true,
    false,
    'published',
    1,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'finmi'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-привет-сосед-2',
    'Привет, сосед!',
    'Займ',
    0.8,
    1000,
    30000,
    1,
    1,
    '0.8% в день',
    'до 31 дня',
    '1000 - 30 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7280&p=10695&erid=2W5zFHNcvWu',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7280&p=10695&erid=2W5zFHNcvWu',
    true,
    false,
    'published',
    2,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'привет-сосед'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-carmoney-3',
    'CarMoney',
    'Займ',
    75,
    50000,
    1000000,
    1,
    20,
    'до 75% годовых',
    'до 84 недель',
    '50 000 - 1 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7234&p=10695&erid=2W5zFHkxvwA',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7234&p=10695&erid=2W5zFHkxvwA',
    true,
    false,
    'published',
    3,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'carmoney'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-алистар-4',
    'Алистар',
    'Займ',
    0.8,
    5000,
    100000,
    1,
    6,
    '0.8% в день',
    'до 24 недель',
    '5000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7233&p=10695&erid=2W5zFJ8ghUV',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7233&p=10695&erid=2W5zFJ8ghUV',
    true,
    false,
    'published',
    4,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'алистар'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-granatfinance-5',
    'GranatFinance',
    'Займ',
    0.8,
    1000,
    100000,
    1,
    12,
    '0.8% в день',
    'до 360 дней',
    '1000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7223&p=10695&erid=2W5zFJN4wcM',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7223&p=10695&erid=2W5zFJN4wcM',
    true,
    false,
    'published',
    5,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'granatfinance'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-asiacredit-6',
    'Asiacredit',
    'Займ',
    0.6,
    5000,
    100000,
    1,
    12,
    '0.6% в день',
    'до 12 месяцев',
    '5000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7213&p=10695&erid=2W5zFHEjvPr',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7213&p=10695&erid=2W5zFHEjvPr',
    true,
    false,
    'published',
    6,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'asiacredit'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-доброзайм-7',
    'Доброзайм',
    'Займ',
    0.8,
    1000,
    100000,
    1,
    12,
    '0.8% в день',
    'до 364 дней',
    '1000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7178&p=10695&erid=2W5zFHnPQoT',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7178&p=10695&erid=2W5zFHnPQoT',
    true,
    false,
    'published',
    7,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'доброзайм'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-medium-score-8',
    'Medium Score',
    'Займ',
    0.8,
    3000,
    30000,
    1,
    1,
    '0.8% в день',
    'до 30 дней',
    '3000 - 30 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7128&p=10695&erid=2W5zFJDLBdS',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7128&p=10695&erid=2W5zFJDLBdS',
    true,
    false,
    'published',
    8,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'medium-score'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-займер-9',
    'Займер',
    'Займ',
    0.8,
    2000,
    30000,
    1,
    1,
    '0.8% в день',
    'до 30 дней',
    '2000 - 30 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7073&p=10695&erid=2W5zFJCB1U4',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7073&p=10695&erid=2W5zFJCB1U4',
    true,
    false,
    'published',
    9,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'займер'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-лайк-мани-10',
    'Лайк Мани',
    'Займ',
    0.8,
    2000,
    100000,
    1,
    6,
    '0.8% в день',
    'до 180 дней',
    '2000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7038&p=10695&erid=2W5zFHHtZeg',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7038&p=10695&erid=2W5zFHHtZeg',
    true,
    false,
    'published',
    10,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'лайк-мани'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-финансы-11',
    'Финансы',
    'Займ',
    0.8,
    1000,
    100000,
    1,
    12,
    '0.8% в день',
    'до 365 дней',
    '1000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/6wlc8?erid=2VtzqvAAbzM',
    'https://my.saleads.pro/s/6wlc8?erid=2VtzqvAAbzM',
    true,
    false,
    'published',
    11,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'финансы'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-kviki-12',
    'Kviki',
    'Займ',
    0.8,
    1000,
    100000,
    1,
    12,
    '0.8% в день',
    'до 360 дней',
    '1000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/39azf?erid=2Vtzqw5YA8m',
    'https://my.saleads.pro/s/39azf?erid=2Vtzqw5YA8m',
    true,
    false,
    'published',
    12,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'kviki'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-быстроденьги-13',
    'Быстроденьги',
    'Займ',
    0.8,
    3000,
    40000,
    1,
    6,
    '0.8% в день',
    'до 180 дней',
    '3000 - 40 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/lmhes?erid=2VtzqwgYGfX',
    'https://my.saleads.pro/s/lmhes?erid=2VtzqwgYGfX',
    true,
    false,
    'published',
    13,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'быстроденьги'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-монеткин-14',
    'Монеткин',
    'Займ',
    0.8,
    1000,
    100000,
    1,
    12,
    '0.8% в день',
    'до 365 дней',
    '1000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/p04x3?erid=2VtzqvWJVs3',
    'https://my.saleads.pro/s/p04x3?erid=2VtzqvWJVs3',
    true,
    false,
    'published',
    14,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'монеткин'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'loans-у-абрамовича-15',
    'У Абрамовича',
    'Займ',
    0.8,
    1000,
    100000,
    1,
    12,
    '0.8% в день',
    'до 365 дней',
    '1000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/ountl?erid=2Vtzqv8gci1',
    'https://my.saleads.pro/s/ountl?erid=2Vtzqv8gci1',
    true,
    false,
    'published',
    15,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'у-абрамовича'
  WHERE c.type = 'product' AND c.slug = 'loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'consumer-русский-стандарт-банк-наличными-0',
    'Русский Стандарт Банк - Наличными',
    'Потребительский кредит',
    65,
    30000,
    3000000,
    1,
    60,
    'До 65% годовых',
    'До 60 месяцев',
    '30 000 - 3 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6459&p=10695&erid=2W5zFH1t71s',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6459&p=10695&erid=2W5zFH1t71s',
    true,
    false,
    'published',
    0,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'русский-стандарт-банк'
  WHERE c.type = 'product' AND c.slug = 'consumer-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'consumer-совкомбанк-наличными-1',
    'Совкомбанк - Наличными',
    'Потребительский кредит',
    30,
    30000,
    5000000,
    1,
    60,
    'До 30% годовых',
    'До 5 лет',
    '30 000 - 5 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5199&p=10695&erid=2W5zFGFFjxt',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5199&p=10695&erid=2W5zFGFFjxt',
    true,
    false,
    'published',
    1,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'совкомбанк'
  WHERE c.type = 'product' AND c.slug = 'consumer-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'consumer-ренессанс-банк-кредит-наличными-2',
    'Ренессанс Банк - Кредит наличными',
    'Потребительский кредит',
    40,
    30000,
    2000000,
    1,
    84,
    'До 40% годовых',
    'До 84 месяцев',
    '30 000 - 2 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6138&p=10695&erid=2W5zFJeimse',
    'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6138&p=10695&erid=2W5zFJeimse',
    true,
    false,
    'published',
    2,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'ренессанс-банк'
  WHERE c.type = 'product' AND c.slug = 'consumer-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'consumer-атб-кредит-наличными-3',
    'АТБ - Кредит наличными',
    'Потребительский кредит',
    39,
    30000,
    5000000,
    1,
    84,
    'До 39% годовых',
    'До 84 месяцев',
    '30 000 - 5 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=2583&p=10695&erid=LjN8KGDaw',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=2583&p=10695&erid=LjN8KGDaw',
    true,
    false,
    'published',
    3,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'атб'
  WHERE c.type = 'product' AND c.slug = 'consumer-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'consumer-т-банк-рефинансирование-4',
    'Т-Банк - рефинансирование',
    'Потребительский кредит',
    40,
    50000,
    5000000,
    1,
    60,
    'До 40% годовых',
    'До 5 лет',
    '50 000 - 5 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/gf6yt?erid=2VtzqvB9uxS',
    'https://my.saleads.pro/s/gf6yt?erid=2VtzqvB9uxS',
    true,
    false,
    'published',
    4,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'consumer-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'consumer-т-банк-кредит-на-карту-5',
    'Т-Банк - кредит на карту',
    'Потребительский кредит',
    41,
    30000,
    30000000,
    1,
    180,
    'До 41% годовых',
    'До 15 лет',
    '30 000 - 30 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/jscd1?erid=2VtzqxkwKg2',
    'https://my.saleads.pro/s/jscd1?erid=2VtzqxkwKg2',
    true,
    false,
    'published',
    5,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'consumer-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'consumer-альфа-банк-рефинансирование-6',
    'Альфа Банк - рефинансирование',
    'Потребительский кредит',
    54,
    30000,
    30000000,
    1,
    180,
    'До 54% годовых',
    'До 15 лет',
    '30 000 - 30 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/23z7g?erid=2Vtzqw5BBDp',
    'https://my.saleads.pro/s/23z7g?erid=2Vtzqw5BBDp',
    true,
    false,
    'published',
    6,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'альфа-банк'
  WHERE c.type = 'product' AND c.slug = 'consumer-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'consumer-альфа-банк-кредит-наличными-7',
    'Альфа Банк - кредит наличными',
    'Потребительский кредит',
    37,
    30000,
    7000000,
    1,
    60,
    'До 37% годовых',
    'До 5 лет',
    '30 000 - 7 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/blewj?erid=2VtzqwLPiD3',
    'https://my.saleads.pro/s/blewj?erid=2VtzqwLPiD3',
    true,
    false,
    'published',
    7,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'альфа-банк'
  WHERE c.type = 'product' AND c.slug = 'consumer-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'collateral-драйвзайм-залог-птс-0',
    'ДрайвЗайм - Залог ПТС',
    'Кредит под залог',
    9,
    10000,
    500000,
    1,
    36,
    'До 9% в месяц',
    'До 3 лет',
    '10 000 - 500 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6864&p=10695&erid=2W5zFHwPkAU',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6864&p=10695&erid=2W5zFHwPkAU',
    true,
    false,
    'published',
    0,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'драйвзайм'
  WHERE c.type = 'product' AND c.slug = 'collateral-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'collateral-carmoney-займ-на-карту-до-1-млн-1',
    'CarMoney - займ на карту до 1 млн',
    'Кредит под залог',
    129,
    50000,
    1000000,
    1,
    48,
    'До 129% годовых',
    'До 48 месяцев',
    '50 000 - 1 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6848&p=10695&erid=2W5zFJEsCvt',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6848&p=10695&erid=2W5zFJEsCvt',
    true,
    false,
    'published',
    1,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'carmoney'
  WHERE c.type = 'product' AND c.slug = 'collateral-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'collateral-доброзайм-выдача-под-залог-птс-2',
    'Доброзайм - Выдача под залог ПТС',
    'Кредит под залог',
    89,
    50000,
    1000000,
    1,
    60,
    '89% в год',
    'До 5 лет',
    '50 000 - 1 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6625&p=10695&erid=LjN8KZcbU',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6625&p=10695&erid=LjN8KZcbU',
    true,
    false,
    'published',
    2,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'доброзайм'
  WHERE c.type = 'product' AND c.slug = 'collateral-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'collateral-совкомбанк-под-залог-недвижимости-3',
    'Совкомбанк - под залог недвижимости',
    'Кредит под залог',
    20,
    200000,
    30000000,
    1,
    180,
    'До 20% годовых',
    'До 180 месяцев',
    '200 000 - 30 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6584&p=10695&erid=2W5zFGMBh6G',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6584&p=10695&erid=2W5zFGMBh6G',
    true,
    false,
    'published',
    3,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'совкомбанк'
  WHERE c.type = 'product' AND c.slug = 'collateral-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'collateral-совкомбанк-под-залог-авто-4',
    'Совкомбанк - под залог авто',
    'Кредит под залог',
    15,
    150000,
    15000000,
    1,
    60,
    'До 15% годовых',
    'До 60 месяцев',
    '150 000 - 15 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6221&p=10695&erid=2W5zFGGjjFE',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6221&p=10695&erid=2W5zFGGjjFE',
    true,
    false,
    'published',
    4,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'совкомбанк'
  WHERE c.type = 'product' AND c.slug = 'collateral-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'collateral-т-банк-кредит-под-залог-недвижимости-5',
    'Т-Банк - Кредит под залог недвижимости',
    'Кредит под залог',
    32,
    500000,
    30000000,
    1,
    180,
    'До 32% годовых',
    'до 15 лет',
    '500 000 - 30 млн ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=4740&p=10695&erid=LjN8KFSkV',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=4740&p=10695&erid=LjN8KFSkV',
    true,
    false,
    'published',
    5,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'collateral-loans'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-втб-дебетовая-карта-мир-веселая-0',
    'ВТБ - Дебетовая карта "МИР Весёлая"',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кешбэк рублями до 3000 ₽',
    '',
    '',
    'Кешбэк рублями до 3000 ₽',
    'Бесплатная доставка по России',
    'Бесплатное обслуживание',
    '["Кешбэк рублями до 3000 ₽","Бесплатная доставка по России","Бесплатное обслуживание"]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7332&p=10695&erid=2W5zFJuUpi5',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7332&p=10695&erid=2W5zFJuUpi5',
    true,
    false,
    'published',
    0,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'втб'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-альфа-банк-апельсиновая-карта-1',
    'Альфа-Банк - Апельсиновая карта',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кешбэк до 7% на продукты',
    '',
    '',
    'Кешбэк до 7% на продукты',
    'Оплачивайте баллами до 100%',
    'Бесплатное обслуживание',
    '["Кешбэк до 7% на продукты","Оплачивайте баллами до 100%","Бесплатное обслуживание"]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7049&p=10695&erid=2W5zFHrdQPS',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=7049&p=10695&erid=2W5zFHrdQPS',
    true,
    false,
    'published',
    1,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'альфа-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-мтс-деньги-дебетовая-карта-2',
    'МТС Деньги - Дебетовая карта',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'До 10 000 ₽ кешбэк в месяц',
    '',
    '',
    'До 10 000 ₽ кешбэк в месяц',
    '5% в супермаркетах',
    '30% на связь',
    '["До 10 000 ₽ кешбэк в месяц","5% в супермаркетах","30% на связь"]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6766&p=10695&erid=2W5zFFy4MBv',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6766&p=10695&erid=2W5zFFy4MBv',
    true,
    false,
    'published',
    2,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'мтс-деньги'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-фора-банк-дебетовая-карта-все-включено-3',
    'Фора-Банк - Дебетовая Карта «Все включено»',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'До 10 000 ₽ кешбэк в месяц',
    '',
    '',
    'До 10 000 ₽ кешбэк в месяц',
    'До 40% выгода в магазинах',
    'Бесплатное обслуживание',
    '["До 10 000 ₽ кешбэк в месяц","До 40% выгода в магазинах","Бесплатное обслуживание"]'::jsonb,
    'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6236&p=10695&erid=LjN8KXfdi',
    'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6236&p=10695&erid=LjN8KXfdi',
    true,
    false,
    'published',
    3,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'фора-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-уралсиб-банк-карта-прибыль-4',
    'Уралсиб Банк - карта "Прибыль"',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кешбэк рублями до 30%',
    '',
    '',
    'Кешбэк рублями до 30%',
    'До 12.5% на остаток',
    'Бесплатное обслуживание',
    '["Кешбэк рублями до 30%","До 12.5% на остаток","Бесплатное обслуживание"]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5549&p=10695&erid=2W5zFGJHX4k',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5549&p=10695&erid=2W5zFGJHX4k',
    true,
    false,
    'published',
    4,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'уралсиб-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-бспб-дебетовая-карта-яркая-5',
    'БСПБ - Дебетовая карта Яркая',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кешбэк до 25%',
    '',
    '',
    'Кешбэк до 25%',
    'До 15% годовых на остаток',
    'Бесплатное обслуживание',
    '["Кешбэк до 25%","До 15% годовых на остаток","Бесплатное обслуживание"]'::jsonb,
    'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=7224&p=10695&erid=2W5zFH96mxL',
    'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=7224&p=10695&erid=2W5zFH96mxL',
    true,
    false,
    'published',
    5,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'бспб'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-альфа-банк-альфа-смарт-6',
    'Альфа Банк - Альфа‑Смарт',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кешбэк до 7000 ₽ в месяц',
    '',
    '',
    'Кешбэк до 7000 ₽ в месяц',
    '4 категории кешбэка',
    'Снятие до 200 000₽',
    '["Кешбэк до 7000 ₽ в месяц","4 категории кешбэка","Снятие до 200 000₽"]'::jsonb,
    'https://my.saleads.pro/s/Jpxs2?erid=2VtzquvpuBc',
    'https://my.saleads.pro/s/Jpxs2?erid=2VtzquvpuBc',
    true,
    false,
    'published',
    6,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'альфа-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-альфа-банк-карта-для-иностранцев-7',
    'Альфа Банк - карта для Иностранцев',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Вернем до 30% от стоимости',
    '',
    '',
    'Вернем до 30% от стоимости',
    'Снятие наличных без комиссии',
    'Бесплатное обслуживание',
    '["Вернем до 30% от стоимости","Снятие наличных без комиссии","Бесплатное обслуживание"]'::jsonb,
    'https://my.saleads.pro/s/9ot3b?erid=2Vtzquzmzz2',
    'https://my.saleads.pro/s/9ot3b?erid=2Vtzquzmzz2',
    true,
    false,
    'published',
    7,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'альфа-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-ак-барс-банк-дебетовая-карта-барс-карта-8',
    'Ак Барс Банк - дебетовая карта Барс Карта',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кешбек до 10%',
    '',
    '',
    'Кешбек до 10%',
    'До 9% годовых',
    'Бесплатное обслуживание',
    '["Кешбек до 10%","До 9% годовых","Бесплатное обслуживание"]'::jsonb,
    'https://my.saleads.pro/s/mi1lJ?erid=2VtzqwFPgna',
    'https://my.saleads.pro/s/mi1lJ?erid=2VtzqwFPgna',
    true,
    false,
    'published',
    8,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'ак-барс-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-отп-банк-дебетовая-карта-premium-9',
    'ОТП Банк - Дебетовая карта Premium',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кешбэк до 5%',
    '',
    '',
    'Кешбэк до 5%',
    'Переводы SWIFT',
    'Бесплатное обслуживание',
    '["Кешбэк до 5%","Переводы SWIFT","Бесплатное обслуживание"]'::jsonb,
    'https://my.saleads.pro/s/u8jom?erid=2Vtzqx9h7XU',
    'https://my.saleads.pro/s/u8jom?erid=2Vtzqx9h7XU',
    true,
    false,
    'published',
    9,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'отп-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-отп-банк-дебетовая-карта-отп-карта-10',
    'ОТП Банк - Дебетовая карта «ОТП карта»',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кешбэк  до 10%',
    '',
    '',
    'Кешбэк  до 10%',
    'Снятие до 500 000 ₽',
    'Бесплатное обслуживание',
    '["Кешбэк  до 10%","Снятие до 500 000 ₽","Бесплатное обслуживание"]'::jsonb,
    'https://my.saleads.pro/s/k52i0?erid=2VtzqvZiBDx',
    'https://my.saleads.pro/s/k52i0?erid=2VtzqvZiBDx',
    true,
    false,
    'published',
    10,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'отп-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-альфа-банк-карта-для-молодежи-11',
    ' Альфа Банк - карта для молодёжи',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Игры с кешбэком до 10%',
    '',
    '',
    'Игры с кешбэком до 10%',
    'Выгода до 100%',
    'Бесплатное обслуживание',
    '["Игры с кешбэком до 10%","Выгода до 100%","Бесплатное обслуживание"]'::jsonb,
    'https://my.saleads.pro/s/y6bqu?erid=2Vtzquwp2RL',
    'https://my.saleads.pro/s/y6bqu?erid=2Vtzquwp2RL',
    true,
    false,
    'published',
    11,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'альфа-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-т-банк-дебетовая-карта-drive-12',
    'Т-Банк - дебетовая карта Drive',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'До 10% за покупки на АЗС',
    '',
    '',
    'До 10% за покупки на АЗС',
    'До 5% за автоуслуги',
    '1% за другие покупки',
    '["До 10% за покупки на АЗС","До 5% за автоуслуги","1% за другие покупки"]'::jsonb,
    'https://my.saleads.pro/s/dcJ8k?erid=2Vtzqvk9Tcz',
    'https://my.saleads.pro/s/dcJ8k?erid=2Vtzqvk9Tcz',
    true,
    false,
    'published',
    12,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-альфа-банк-карта-для-самозанятых-13',
    'Альфа Банк - карта для самозанятых',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'До 100% кешбэк на остаток',
    '',
    '',
    'До 100% кешбэк на остаток',
    'Низкие налоговые ставки',
    'Бесплатное обслуживание',
    '["До 100% кешбэк на остаток","Низкие налоговые ставки","Бесплатное обслуживание"]'::jsonb,
    'https://my.saleads.pro/s/7z95y?erid=2VtzquvL38z',
    'https://my.saleads.pro/s/7z95y?erid=2VtzquvL38z',
    true,
    false,
    'published',
    13,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'альфа-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-альфа-банк-пенсия-в-альфа-банке-14',
    'Альфа Банк - «Пенсия в Альфа-Банке»',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '5% кешбэк в аптеках',
    '',
    '',
    '5% кешбэк в аптеках',
    'Защита от мошенников',
    'Бесплатное обслуживание',
    '["5% кешбэк в аптеках","Защита от мошенников","Бесплатное обслуживание"]'::jsonb,
    'https://my.saleads.pro/s/wem6d?erid=2Vtzqutr3re',
    'https://my.saleads.pro/s/wem6d?erid=2Vtzqutr3re',
    true,
    false,
    'published',
    14,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'альфа-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-т-банк-дебетовая-карта-islam-black-15',
    'Т-Банк - дебетовая карта Islam Black',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кэшбэк до 3 000 ₽ в месяц',
    '',
    '',
    'Кэшбэк до 3 000 ₽ в месяц',
    'до 30 млн ₽ в месяц через СБП',
    'Не требуется паспорт',
    '["Кэшбэк до 3 000 ₽ в месяц","до 30 млн ₽ в месяц через СБП","Не требуется паспорт"]'::jsonb,
    'https://my.saleads.pro/s/vx0c7?erid=2Vtzqw2cQni',
    'https://my.saleads.pro/s/vx0c7?erid=2Vtzqw2cQni',
    true,
    false,
    'published',
    15,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-т-банк-дебетовая-карта-black-premium-16',
    'Т-Банк - дебетовая карта Black Premium',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кэшбэк 5% на рестораны',
    '',
    '',
    'Кэшбэк 5% на рестораны',
    'До 60 000 ₽ кэшбэк за покупки',
    'До 14% годовых по вкладу',
    '["Кэшбэк 5% на рестораны","До 60 000 ₽ кэшбэк за покупки","До 14% годовых по вкладу"]'::jsonb,
    'https://my.saleads.pro/s/atuzw?erid=2VtzqupQ61c',
    'https://my.saleads.pro/s/atuzw?erid=2VtzqupQ61c',
    true,
    false,
    'published',
    16,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-т-банк-дебетовая-карта-для-нерезидентов-17',
    'Т-Банк - дебетовая карта для нерезидентов',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кешбэк до 3000₽ в месяц',
    '',
    '',
    'Кешбэк до 3000₽ в месяц',
    'Переводы за рубеж до 5 млн',
    'Бесплатное обслуживание',
    '["Кешбэк до 3000₽ в месяц","Переводы за рубеж до 5 млн","Бесплатное обслуживание"]'::jsonb,
    'https://my.saleads.pro/s/h1kev?erid=2VtzqvhJsaN',
    'https://my.saleads.pro/s/h1kev?erid=2VtzqvhJsaN',
    true,
    false,
    'published',
    17,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-т-банк-дебетовая-карта-all-airlines-18',
    'Т-Банк - дебетовая карта ALL Airlines',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'До 30% кэшбэк милями',
    '',
    '',
    'До 30% кэшбэк милями',
    '1,5% за повседневные покупки',
    'До 5% за авиабилеты',
    '["До 30% кэшбэк милями","1,5% за повседневные покупки","До 5% за авиабилеты"]'::jsonb,
    'https://my.saleads.pro/s/4gyxa?erid=2Vtzqv8CvrA',
    'https://my.saleads.pro/s/4gyxa?erid=2Vtzqv8CvrA',
    true,
    false,
    'published',
    18,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-альфа-банк-дебетовая-детская-карта-19',
    'Альфа Банк - дебетовая детская карта',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кэшбэк до 10 в Пятёрочке',
    '',
    '',
    'Кэшбэк до 10 в Пятёрочке',
    'Кешбэк до 2000 ₽ месяц',
    'Бесплатное обслуживание',
    '["Кэшбэк до 10 в Пятёрочке","Кешбэк до 2000 ₽ месяц","Бесплатное обслуживание"]'::jsonb,
    'https://my.saleads.pro/s/r27g4?erid=2Vtzqunv6jG',
    'https://my.saleads.pro/s/r27g4?erid=2Vtzqunv6jG',
    true,
    false,
    'published',
    19,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'альфа-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-т-банк-карта-black-молодежная-20',
    'Т-Банк - карта Black Молодежная',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'До 30% — в магазинах',
    '',
    '',
    'До 30% — в магазинах',
    'Бесплатная доставка',
    'Вернем 1% за все покупки',
    '["До 30% — в магазинах","Бесплатная доставка","Вернем 1% за все покупки"]'::jsonb,
    'https://my.saleads.pro/s/fbwjn?erid=2VtzqwntwD8',
    'https://my.saleads.pro/s/fbwjn?erid=2VtzqwntwD8',
    true,
    false,
    'published',
    20,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-т-банк-дебетовая-карта-джуниор-21',
    'Т-Банк - дебетовая карта Джуниор',
    'Дебетовая карта',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    'Кэшбэк до 30%',
    '',
    '',
    'Кэшбэк до 30%',
    'Снятие до 20 000 ₽ в месяц',
    'Бесплатно навсегда',
    '["Кэшбэк до 30%","Снятие до 20 000 ₽ в месяц","Бесплатно навсегда"]'::jsonb,
    'https://my.saleads.pro/s/sJv2r?erid=2VtzqwXwfsc',
    'https://my.saleads.pro/s/sJv2r?erid=2VtzqwXwfsc',
    true,
    false,
    'published',
    21,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'debit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-credit-займер-виртуальная-карта-0',
    'Займер - Виртуальная карта',
    'Кредитная карта',
    0.65,
    15000,
    100000,
    1,
    6,
    '0,65% в день',
    'До 180 дней',
    '15 000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6736&p=10695&erid=2W5zFGNo5ep',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6736&p=10695&erid=2W5zFGNo5ep',
    true,
    false,
    'published',
    0,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'займер'
  WHERE c.type = 'product' AND c.slug = 'credit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-credit-ак-барс-кредитная-карта-115-дней-1',
    'АК Барс - Кредитная карта 115 дней',
    'Кредитная карта',
    115,
    10000,
    1000000,
    1,
    60,
    'До 115 дней без %',
    'До 5 лет',
    '10 000 - 1 000 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6474&p=10695&erid=2W5zFHxn2e4',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=6474&p=10695&erid=2W5zFHxn2e4',
    true,
    false,
    'published',
    1,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'ак-барс'
  WHERE c.type = 'product' AND c.slug = 'credit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-credit-русский-стандарт-банк-кредитка-2',
    'Русский Стандарт Банк - Кредитка',
    'Кредитная карта',
    59,
    30000,
    1000000,
    1,
    60,
    'До 59% годовых',
    'До 5 лет',
    '30 000 - 1 000 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6460&p=10695&erid=2W5zFH3N6JD',
    'https://go.leadgid.ru/aff_c?aff_id=145356&offer_id=6460&p=10695&erid=2W5zFH3N6JD',
    true,
    false,
    'published',
    2,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'русский-стандарт-банк'
  WHERE c.type = 'product' AND c.slug = 'credit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-credit-уралсиб-банк-кредитная-карта-3',
    'Уралсиб Банк - Кредитная карта',
    'Кредитная карта',
    34.9,
    10000,
    5000000,
    1,
    60,
    'От 34,9% годовых',
    'До 5 лет',
    '10 000 - 5 000 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5567&p=10695&erid=2W5zFJjKetp',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=5567&p=10695&erid=2W5zFJjKetp',
    true,
    false,
    'published',
    3,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'уралсиб-банк'
  WHERE c.type = 'product' AND c.slug = 'credit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-credit-халва-карта-рассрочки-4',
    'Халва - Карта рассрочки',
    'Кредитная карта',
    15,
    10000,
    100000,
    1,
    84,
    'До 15% годовых',
    'До 7 лет',
    '10 000 - 100 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=2413&p=10695&erid=LjN8KTAzF',
    'https://fin-lg.com/aff_c?aff_id=145356&offer_id=2413&p=10695&erid=LjN8KTAzF',
    true,
    false,
    'published',
    4,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'халва'
  WHERE c.type = 'product' AND c.slug = 'credit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-credit-т-банк-кредитная-карта-drive-5',
    'Т-Банк — кредитная карта Drive',
    'Кредитная карта',
    62,
    15000,
    1000000,
    1,
    60,
    'До 62% годовых',
    '5 лет',
    '15 000 - 1 000 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/ounml?erid=2VtzqvRynmt',
    'https://my.saleads.pro/s/ounml?erid=2VtzqvRynmt',
    true,
    false,
    'published',
    5,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'credit-cards'
UNION ALL
SELECT
    c.id,
    b.id,
    'cards-credit-т-банк-кредитная-карта-drive-6',
    'Т-Банк — кредитная карта Drive',
    'Кредитная карта',
    62,
    15000,
    1000000,
    1,
    60,
    'До 62% годовых',
    '5 лет',
    '15 000 - 1 000 000 ₽',
    '',
    '',
    '',
    '[]'::jsonb,
    'https://my.saleads.pro/s/8dski?erid=2Vtzqw6fAWA',
    'https://my.saleads.pro/s/8dski?erid=2Vtzqw6fAWA',
    true,
    false,
    'published',
    6,
    timezone('utc', now())
  FROM public.categories c
  LEFT JOIN public.banks b ON b.slug = 'т-банк'
  WHERE c.type = 'product' AND c.slug = 'credit-cards'
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
