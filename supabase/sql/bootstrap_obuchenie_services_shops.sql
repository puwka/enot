-- Ручное применение в Supabase SQL Editor
-- Новые разделы: Обучение, Сервисы, Магазины
-- Требует: bootstrap_cms_crud.sql (таблицы pages, page_blocks, categories, menus)

INSERT INTO public.categories (type, slug, title, description, path, variant, cta_label, status, sort_order)
VALUES
  (
    'product',
    'obuchenie',
    'Обучение',
    'Курсы, переподготовка и онлайн-школы',
    '/obuchenie',
    'education',
    'Подробнее',
    'published',
    75
  ),
  (
    'product',
    'services',
    'Сервисы',
    'Доставка, подработка и бытовые услуги',
    '/services',
    'service',
    'Подробнее',
    'published',
    80
  ),
  (
    'product',
    'shops',
    'Магазины',
    'Кешбэк и выгода при покупках у партнёров',
    '/shops',
    'shop',
    'Подробнее',
    'published',
    85
  )
ON CONFLICT (type, slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  path = EXCLUDED.path,
  variant = EXCLUDED.variant,
  cta_label = EXCLUDED.cta_label,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  updated_at = timezone('utc', now());

INSERT INTO public.pages (slug, title, meta_title, meta_description, status, sort_order, published_at)
VALUES
  (
    'obuchenie',
    'Обучение',
    'Обучение — курсы и программы',
    'Курсы, переподготовка и онлайн-школы.',
    'published',
    35,
    timezone('utc', now())
  ),
  (
    'services',
    'Сервисы',
    'Сервисы — подработка и услуги',
    'Доставка, подработка и бытовые услуги.',
    'published',
    36,
    timezone('utc', now())
  ),
  (
    'shops',
    'Магазины',
    'Магазины — кешбэк и покупки',
    'Кешбэк и выгода при покупках у партнёров.',
    'published',
    37,
    timezone('utc', now())
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  status = EXCLUDED.status,
  sort_order = EXCLUDED.sort_order,
  updated_at = timezone('utc', now());

INSERT INTO public.page_blocks (page_id, block_type, title, body, payload, status, sort_order)
SELECT p.id, seed.block_type, seed.title, seed.body, seed.payload, 'published', seed.sort_order
FROM public.pages p
JOIN (
  VALUES
    (
      'obuchenie',
      'hero',
      'Обучение',
      'Курсы, программы переподготовки и онлайн-школы — выберите направление и запишитесь на сайте организации.',
      '{"buttonLabel":"Смотреть каталог","buttonUrl":"/obuchenie"}'::jsonb,
      0
    ),
    (
      'obuchenie',
      'list',
      'Направления',
      '',
      '{"items":["Психология и коучинг","IT и дизайн","Подготовка к ЕГЭ","Проф. переподготовка"]}'::jsonb,
      10
    ),
    (
      'services',
      'hero',
      'Сервисы',
      'Подработка, доставка, банковские и бытовые сервисы — актуальные предложения партнёров.',
      '{"buttonLabel":"Смотреть каталог","buttonUrl":"/services"}'::jsonb,
      0
    ),
    (
      'services',
      'list',
      'Категории',
      '',
      '{"items":["Доставка","Курьер","Уборка","Колл-центр","Банковский сервис"]}'::jsonb,
      10
    ),
    (
      'shops',
      'hero',
      'Магазины',
      'Карты и программы с выгодным кешбэком в магазинах, супермаркетах и у партнёров.',
      '{"buttonLabel":"Смотреть каталог","buttonUrl":"/shops"}'::jsonb,
      0
    ),
    (
      'shops',
      'list',
      'Выгода',
      '',
      '{"items":["Кешбэк в супермаркетах","Баллы у партнёров","Бесплатное обслуживание"]}'::jsonb,
      10
    )
) AS seed(page_slug, block_type, title, body, payload, sort_order)
  ON p.slug = seed.page_slug
WHERE p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.page_blocks pb
    WHERE pb.page_id = p.id
      AND pb.block_type = seed.block_type
      AND pb.title = seed.title
      AND pb.deleted_at IS NULL
  );

INSERT INTO public.menus (location, label, href, status, sort_order)
SELECT seed.location, seed.label, seed.href, 'published', seed.sort_order
FROM (
  VALUES
    ('header', 'Обучение', '/obuchenie', 35),
    ('header', 'Сервисы', '/services', 36),
    ('header', 'Магазины', '/shops', 37),
    ('footer_products', 'Обучение', '/obuchenie', 40),
    ('footer_products', 'Сервисы', '/services', 50),
    ('footer_products', 'Магазины', '/shops', 60)
) AS seed(location, label, href, sort_order)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.menus m
  WHERE m.location = seed.location
    AND m.href = seed.href
    AND m.deleted_at IS NULL
);

UPDATE public.page_blocks pb
SET payload = jsonb_build_object(
  'items', jsonb_build_array(
    jsonb_build_object('title', 'Потребительские кредиты', 'text', 'Сравните ставки и условия лучших банков'),
    jsonb_build_object('title', 'Дебетовые карты', 'text', 'Кэшбэк, проценты на остаток и бесплатное обслуживание'),
    jsonb_build_object('title', 'Кредитные карты', 'text', 'Льготный период и выгодные условия'),
    jsonb_build_object('title', 'Обучение', 'text', 'Курсы, переподготовка и онлайн-школы'),
    jsonb_build_object('title', 'Сервисы', 'text', 'Доставка, подработка и бытовые услуги'),
    jsonb_build_object('title', 'Магазины', 'text', 'Кешбэк и выгода при покупках у партнёров')
  )
),
updated_at = timezone('utc', now())
FROM public.pages p
WHERE pb.page_id = p.id
  AND p.slug = 'home'
  AND pb.block_type = 'cards'
  AND pb.title = 'Популярные категории'
  AND pb.deleted_at IS NULL
  AND jsonb_array_length(coalesce(pb.payload -> 'items', '[]'::jsonb)) < 6;
