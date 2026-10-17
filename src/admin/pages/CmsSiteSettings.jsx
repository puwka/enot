import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/apiClient';
import { useAdminAuth } from '../AdminAuthContext';
import CmsImageUpload from '../cms/CmsImageUpload';
import { CmsAlert, CmsLoading } from '../cms/CmsUi';
import '../cms/Cms.css';

const empty = {
  brand: {
    name: 'ЕнотМани',
    logo_url: '',
    mascot_url: '',
    telegram_url: '',
    vk_url: '',
    max_url: '',
    primary_color: '#12b5a2',
    secondary_color: '#0b1739',
    accent_color: '#0d9b8a',
    footer_text: '',
  },
  seo: { title: '', description: '', keywords: '' },
  analytics: { yandex_metrika_id: '108751085', google_analytics_id: '', custom_head_html: '' },
  app: { version: '1.1.0', product_name: 'ЕнотМани CMS', update_channel: 'manual', update_notes: '' },
};

const CmsSiteSettings = () => {
  const { token } = useAdminAuth();
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/site/admin/settings', { adminToken: token });
      setForm({
        brand: { ...empty.brand, ...(data?.settings?.brand || {}) },
        seo: { ...empty.seo, ...(data?.settings?.seo || {}) },
        analytics: { ...empty.analytics, ...(data?.settings?.analytics || {}) },
        app: { ...empty.app, ...(data?.settings?.app || {}) },
      });
    } catch {
      setError('Не удалось загрузить настройки сайта.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const setBrand = (key, value) => setForm((prev) => ({ ...prev, brand: { ...prev.brand, [key]: value } }));
  const setSeo = (key, value) => setForm((prev) => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
  const setAnalytics = (key, value) =>
    setForm((prev) => ({ ...prev, analytics: { ...prev.analytics, [key]: value } }));

  const onSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await apiFetch('/site/admin/settings', {
        method: 'PUT',
        adminToken: token,
        body: { settings: form },
      });
      setMessage('Настройки сохранены. Обновите главную страницу, чтобы увидеть изменения.');
    } catch {
      setError('Не удалось сохранить настройки.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CmsLoading />;

  return (
    <div className="cms-panel">
      <div className="cms-toolbar">
        <div className="cms-toolbar__left">
          <strong>Настройки сайта</strong>
          <span className="cms-muted">v{form.app.version}</span>
        </div>
        <div className="cms-toolbar__right">
          <button type="button" className="admin-btn admin-btn--primary" onClick={onSave} disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>
      <CmsAlert>{error}</CmsAlert>
      {message ? <div className="cms-alert cms-alert--ok">{message}</div> : null}

      <div className="cms-form">
        <div className="cms-form-section">
          <h3 className="cms-form-section__title">Бренд и тема</h3>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Название бренда</span>
              <input value={form.brand.name} onChange={(e) => setBrand('name', e.target.value)} />
            </label>
            <label className="cms-field">
              <span>Текст в футере</span>
              <input value={form.brand.footer_text} onChange={(e) => setBrand('footer_text', e.target.value)} />
            </label>
          </div>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Основной цвет</span>
              <input type="color" value={form.brand.primary_color || '#12b5a2'} onChange={(e) => setBrand('primary_color', e.target.value)} />
            </label>
            <label className="cms-field">
              <span>Тёмный цвет</span>
              <input type="color" value={form.brand.secondary_color || '#0b1739'} onChange={(e) => setBrand('secondary_color', e.target.value)} />
            </label>
            <label className="cms-field">
              <span>Акцент</span>
              <input type="color" value={form.brand.accent_color || '#0d9b8a'} onChange={(e) => setBrand('accent_color', e.target.value)} />
            </label>
          </div>
          <div className="cms-form__grid">
            <CmsImageUpload label="Логотип" value={form.brand.logo_url} onChange={(url) => setBrand('logo_url', url)} />
            <CmsImageUpload label="Маскот / герой на главной" value={form.brand.mascot_url} onChange={(url) => setBrand('mascot_url', url)} />
          </div>
        </div>

        <div className="cms-form-section">
          <h3 className="cms-form-section__title">Соцсети</h3>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Telegram</span>
              <input value={form.brand.telegram_url} onChange={(e) => setBrand('telegram_url', e.target.value)} />
            </label>
            <label className="cms-field">
              <span>ВКонтакте</span>
              <input value={form.brand.vk_url} onChange={(e) => setBrand('vk_url', e.target.value)} />
            </label>
            <label className="cms-field">
              <span>MAX</span>
              <input value={form.brand.max_url} onChange={(e) => setBrand('max_url', e.target.value)} />
            </label>
          </div>
        </div>

        <div className="cms-form-section">
          <h3 className="cms-form-section__title">SEO</h3>
          <label className="cms-field">
            <span>Title сайта</span>
            <input value={form.seo.title} onChange={(e) => setSeo('title', e.target.value)} />
          </label>
          <label className="cms-field">
            <span>Description</span>
            <textarea rows={3} value={form.seo.description} onChange={(e) => setSeo('description', e.target.value)} />
          </label>
          <label className="cms-field">
            <span>Keywords (через запятую)</span>
            <input value={form.seo.keywords} onChange={(e) => setSeo('keywords', e.target.value)} />
          </label>
        </div>

        <div className="cms-form-section">
          <h3 className="cms-form-section__title">Статистика / счётчики</h3>
          <div className="cms-form__grid">
            <label className="cms-field">
              <span>Яндекс.Метрика ID</span>
              <input value={form.analytics.yandex_metrika_id} onChange={(e) => setAnalytics('yandex_metrika_id', e.target.value)} />
            </label>
            <label className="cms-field">
              <span>Google Analytics ID</span>
              <input value={form.analytics.google_analytics_id} onChange={(e) => setAnalytics('google_analytics_id', e.target.value)} placeholder="G-XXXXXXXX" />
            </label>
          </div>
          <label className="cms-field">
            <span>Доп. HTML в head (пиксели / скрипты)</span>
            <textarea rows={4} value={form.analytics.custom_head_html} onChange={(e) => setAnalytics('custom_head_html', e.target.value)} />
          </label>
        </div>

        <div className="cms-form-section">
          <h3 className="cms-form-section__title">Версия продукта</h3>
          <p className="cms-muted">
            Текущая версия: <strong>{form.app.version}</strong>. Обновления ставятся поддержкой: git pull → npm ci →
            build → db:migrate → restart. Клиент сам не ломает данные при миграциях.
          </p>
          <p className="cms-muted">{form.app.update_notes}</p>
        </div>
      </div>
    </div>
  );
};

export default CmsSiteSettings;
