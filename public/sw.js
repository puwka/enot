const CACHE_VERSION = 'enotmani-v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const SHELL_CACHE = `shell-${CACHE_VERSION}`;

const SHELL_ASSETS = ['/offline.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

const PRIVATE_PATH_PREFIXES = ['/api/', '/admin', '/account', '/login', '/register', '/forgot-password'];

const isPrivatePath = (pathname) => PRIVATE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const isStaticAsset = (url) =>
  url.pathname.startsWith('/static/') ||
  url.pathname.startsWith('/icons/') ||
  url.pathname.endsWith('.css') ||
  url.pathname.endsWith('.js') ||
  url.pathname.endsWith('.woff2');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== SHELL_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_PRIVATE_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key.startsWith('pages-') || key.startsWith('api-')) {
              return caches.delete(key);
            }
            return Promise.resolve(false);
          })
        )
      )
    );
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/api/')) {
    return;
  }

  if (isPrivatePath(url.pathname)) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Нет сети</title></head><body style="font-family:sans-serif;padding:24px;background:#0b1739;color:#fff;text-align:center"><h1>Нет подключения</h1><p>Этот раздел доступен только онлайн.</p><button onclick="location.reload()" style="padding:12px 18px;border:0;border-radius:10px;background:#12b5a2;color:#fff;font:inherit">Повторить</button></body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        )
      )
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(SHELL_CACHE);
          const cachedShell = await cache.match('/index.html');
          if (cachedShell) return cachedShell;
          const offline = await cache.match('/offline.html');
          return offline || Response.error();
        })
    );
  }
});
