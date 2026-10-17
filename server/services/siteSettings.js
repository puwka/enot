import { query } from '../db.js';

const DEFAULTS = {
  brand: {
    name: 'ЕнотМани',
    logo_url: '',
    mascot_url: '',
    telegram_url: 'https://t.me/enot_mani',
    vk_url: '',
    max_url: '',
    primary_color: '#12b5a2',
    secondary_color: '#0b1739',
    accent_color: '#0d9b8a',
    footer_text: 'Сервис сравнения финансовых продуктов.',
  },
  seo: {
    title: 'ЕнотМани — сравнение финансовых продуктов',
    description: 'Сравнение кредитов, микрозаймов и карт.',
    keywords: 'кредиты, займы, карты',
  },
  analytics: {
    yandex_metrika_id: '108751085',
    google_analytics_id: '',
    custom_head_html: '',
  },
  app: {
    version: '1.1.0',
    product_name: 'ЕнотМани CMS',
    update_channel: 'manual',
    update_notes:
      'Обновления ставит поддержка: git pull → npm ci → npm run build → npm run db:migrate → systemctl restart.',
  },
};

const mergeValue = (key, value) => ({
  ...(DEFAULTS[key] || {}),
  ...(value && typeof value === 'object' ? value : {}),
});

export const getPublicSettings = async () => {
  const { rows } = await query(
    `SELECT key, value FROM public.site_settings
     WHERE key = ANY($1) AND status = 'published'`,
    [['brand', 'seo', 'analytics', 'app']]
  );
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return {
    brand: mergeValue('brand', map.brand),
    seo: mergeValue('seo', map.seo),
    analytics: mergeValue('analytics', map.analytics),
    app: mergeValue('app', map.app),
  };
};

export const getAdminSettingsBundle = async () => getPublicSettings();

export const upsertSetting = async (key, value) => {
  const merged = mergeValue(key, value);
  const { rows } = await query(
    `INSERT INTO public.site_settings (key, value, status)
     VALUES ($1, $2::jsonb, 'published')
     ON CONFLICT (key) DO UPDATE SET
       value = EXCLUDED.value,
       status = 'published',
       updated_at = timezone('utc', now())
     RETURNING key, value, updated_at`,
    [key, JSON.stringify(merged)]
  );
  return rows[0];
};

export const saveSettingsBundle = async (bundle, adminId = null) => {
  const keys = ['brand', 'seo', 'analytics', 'app'];
  const saved = {};
  for (const key of keys) {
    if (bundle?.[key]) {
      saved[key] = (await upsertSetting(key, bundle[key])).value;
    } else {
      saved[key] = (await getPublicSettings())[key];
    }
  }
  try {
    await query(
      `INSERT INTO public.audit_logs (admin_actor_id, action, entity_type, entity_id, after_data)
       VALUES ($1, 'update', 'site_settings', NULL, $2::jsonb)`,
      [adminId, JSON.stringify({ keys: Object.keys(saved) })]
    );
  } catch {
    /* ignore audit write failures */
  }
  return saved;
};
