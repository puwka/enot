const isLocalhost = () =>
  Boolean(
    window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );

export const register = (config = {}) => {
  if (!('serviceWorker' in navigator)) return;

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd && !process.env.REACT_APP_ENABLE_PWA) return;

  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL || ''}/sw.js`;

    if (isLocalhost()) {
      checkValidServiceWorker(swUrl, config);
      navigator.serviceWorker.ready.then(() => {});
      return;
    }

    registerValidSW(swUrl, config);
  });
};

const registerValidSW = (swUrl, config) => {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.onstatechange = () => {
          if (installing.state !== 'installed') return;
          if (navigator.serviceWorker.controller) {
            config.onUpdate?.(registration);
          } else {
            config.onSuccess?.(registration);
          }
        };
      };
    })
    .catch(() => {
      config.onError?.();
    });
};

const checkValidServiceWorker = (swUrl, config) => {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      if (response.status === 404 || !response.headers.get('content-type')?.includes('javascript')) {
        navigator.serviceWorker.ready.then((registration) => registration.unregister());
        return;
      }
      registerValidSW(swUrl, config);
    })
    .catch(() => {});
};

export const unregister = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => registration.unregister());
  }
};

export const skipWaiting = () => {
  navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
};

export const clearPrivateCache = () => {
  navigator.serviceWorker.controller?.postMessage({ type: 'CLEAR_PRIVATE_CACHE' });
};

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

export const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent);
