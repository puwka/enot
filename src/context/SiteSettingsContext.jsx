import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/apiClient';

const SiteSettingsContext = createContext({
  settings: null,
  loading: true,
  refresh: () => {},
});

const applyThemeVars = (brand = {}) => {
  const root = document.documentElement;
  if (brand.primary_color) {
    root.style.setProperty('--brand-primary', brand.primary_color);
    root.style.setProperty('--color-teal-500', brand.primary_color);
    root.style.setProperty('--color-accent', brand.primary_color);
  }
  if (brand.accent_color) {
    root.style.setProperty('--brand-accent', brand.accent_color);
    root.style.setProperty('--color-teal-600', brand.accent_color);
    root.style.setProperty('--color-accent-hover', brand.accent_color);
  }
  if (brand.secondary_color) {
    root.style.setProperty('--brand-secondary', brand.secondary_color);
    root.style.setProperty('--color-navy-900', brand.secondary_color);
    root.style.setProperty('--color-text', brand.secondary_color);
    root.style.setProperty('--color-primary', brand.secondary_color);
  }
};

const applySeo = (seo = {}) => {
  if (seo.title) document.title = seo.title;
  const ensureMeta = (name, content) => {
    if (!content) return;
    let node = document.querySelector(`meta[name="${name}"]`);
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute('name', name);
      document.head.appendChild(node);
    }
    node.setAttribute('content', content);
  };
  ensureMeta('description', seo.description);
  ensureMeta('keywords', seo.keywords);
};

const applyAnalytics = (analytics = {}) => {
  const yandexId = String(analytics.yandex_metrika_id || '').trim();
  if (yandexId && !window.__enotYandexBooted) {
    window.__enotYandexBooted = true;
    (function (m, e, t, r, i, k, a) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = 1 * new Date();
      for (var j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) return;
      }
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(Number(yandexId), 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }

  const gaId = String(analytics.google_analytics_id || '').trim();
  if (gaId && !window.__enotGaBooted) {
    window.__enotGaBooted = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', gaId);
  }

  const custom = String(analytics.custom_head_html || '').trim();
  if (custom && !document.getElementById('enot-custom-analytics')) {
    const wrap = document.createElement('div');
    wrap.id = 'enot-custom-analytics';
    wrap.innerHTML = custom;
    Array.from(wrap.childNodes).forEach((node) => document.head.appendChild(node));
  }
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const payload = await apiFetch('/site/settings');
      const next = payload?.settings || null;
      setSettings(next);
      if (next?.brand) applyThemeVars(next.brand);
      if (next?.seo) applySeo(next.seo);
      if (next?.analytics) applyAnalytics(next.analytics);
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(() => ({ settings, loading, refresh }), [settings, loading]);
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
};

export const useSiteSettings = () => useContext(SiteSettingsContext);

export default SiteSettingsContext;
