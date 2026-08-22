INSERT INTO public.site_settings (key, value, status)
VALUES
  (
    'bonus',
    jsonb_build_object(
      'points_to_ruble_rate', 0.1,
      'next_level_step', 2000
    ),
    'published'
  ),
  (
    'brand',
    jsonb_build_object(
      'name', 'ЕнотМани',
      'telegram_url', 'https://t.me/enot_mani',
      'vk_url', 'https://vk.com/skupka_59_perm'
    ),
    'published'
  )
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.bonus_rules (action_key, title, points, is_repeatable, cooldown_hours, status, sort_order)
VALUES
  ('daily-login', 'Вход в аккаунт', 10, true, 24, 'published', 10),
  ('invite-friend', 'Пригласить друга', 100, true, NULL, 'published', 20),
  ('social-share', 'Поделиться в соцсетях', 50, false, NULL, 'published', 30),
  ('read-material', 'Изучить материал', 20, false, NULL, 'published', 40),
  ('complete-profile', 'Заполнить профиль', 30, false, NULL, 'published', 50)
ON CONFLICT (action_key) DO NOTHING;

INSERT INTO public.categories (type, slug, title, path, variant, cta_label, status, sort_order)
VALUES
  ('product', 'loans', 'Кредиты и займы', '/loans', 'loan', 'Получить деньги', 'published', 10),
  ('product', 'consumer-loans', 'Потребительские кредиты', '/consumer-loans', 'loan', 'Оформить кредит', 'published', 20),
  ('product', 'credit-cards', 'Кредитные карты', '/auto-loans', 'credit-card', 'Оформить карту', 'published', 30),
  ('product', 'collateral-loans', 'Кредиты под залог', '/collateral-loans', 'loan', 'Оформить', 'published', 40),
  ('product', 'debit-cards', 'Дебетовые карты', '/cards', 'debit', 'Оформить карту', 'published', 50),
  ('product', 'jobs', 'Вакансии', '/Job', 'job', 'Откликнуться', 'published', 60),
  ('product', 'education', 'Статьи и обучение', '/Education', 'education', 'Подробнее', 'published', 70),
  ('product', 'obuchenie', 'Обучение', '/obuchenie', 'education', 'Подробнее', 'published', 75),
  ('product', 'services', 'Сервисы', '/services', 'service', 'Подробнее', 'published', 80),
  ('product', 'shops', 'Магазины', '/shops', 'shop', 'Подробнее', 'published', 85),
  ('article', 'all', 'Все', NULL, NULL, NULL, 'published', 0),
  ('news', 'all', 'Все', NULL, NULL, NULL, 'published', 0)
ON CONFLICT (type, slug) DO NOTHING;

INSERT INTO public.pages (slug, title, meta_title, status, sort_order, published_at)
VALUES
  ('home', 'Главная', 'ЕнотМани — сравнение финансовых продуктов', 'published', 0, timezone('utc', now())),
  ('privacy', 'Политика конфиденциальности', 'Политика конфиденциальности — ЕнотМани', 'published', 10, timezone('utc', now())),
  ('terms', 'Условия использования', 'Условия использования — ЕнотМани', 'published', 20, timezone('utc', now())),
  ('guide', 'Справочник', 'Справочник — ЕнотМани', 'published', 30, timezone('utc', now())),
  ('faq', 'Вопросы и ответы', 'FAQ — ЕнотМани', 'published', 40, timezone('utc', now())),
  ('obuchenie', 'Обучение', 'Обучение — курсы и программы', 'published', 35, timezone('utc', now())),
  ('services', 'Сервисы', 'Сервисы — подработка и услуги', 'published', 36, timezone('utc', now())),
  ('shops', 'Магазины', 'Магазины — кешбэк и покупки', 'published', 37, timezone('utc', now()))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.menus (location, label, href, status, sort_order)
VALUES
  ('header', 'Кредиты', '/loans', 'published', 10),
  ('header', 'Дебетовые карты', '/cards', 'published', 20),
  ('header', 'Кредитные карты', '/auto-loans', 'published', 30),
  ('header', 'Обучение', '/obuchenie', 'published', 35),
  ('header', 'Сервисы', '/services', 'published', 36),
  ('header', 'Магазины', '/shops', 'published', 37),
  ('header', 'Статьи', '/Education', 'published', 40),
  ('header', 'Новости', '/news', 'published', 50),
  ('header', 'Справочник', '/guide', 'published', 60),
  ('footer_products', 'Кредиты', '/loans', 'published', 10),
  ('footer_products', 'Дебетовые карты', '/cards', 'published', 20),
  ('footer_products', 'Кредитные карты', '/auto-loans', 'published', 30),
  ('footer_products', 'Обучение', '/obuchenie', 'published', 40),
  ('footer_products', 'Сервисы', '/services', 'published', 50),
  ('footer_products', 'Магазины', '/shops', 'published', 60),
  ('footer_info', 'Статьи', '/Education', 'published', 10),
  ('footer_info', 'Новости', '/news', 'published', 20),
  ('footer_info', 'Справочник', '/guide', 'published', 30),
  ('footer_info', 'Вопросы и ответы', '/faq', 'published', 40);

