# PWA — Progressive Web App

Сайт ЕнотМани поддерживает установку как приложение на телефон и компьютер.

---

## Что добавлено

| Файл | Назначение |
|------|------------|
| `public/manifest.json` | Web App Manifest |
| `public/sw.js` | Service Worker |
| `public/offline.html` | Offline fallback |
| `public/icons/` | PWA-иконки из логотипа |
| `src/pwa/serviceWorkerRegistration.js` | регистрация и обновление SW |
| `src/components/pwa/PwaShell.jsx` | install prompt, offline, update UI |
| `scripts/generate-pwa-icons.mjs` | генерация иконок |

---

## Manifest

- **name:** ЕнотМани — займы и кредиты
- **display:** standalone
- **theme_color / background_color:** `#0b1739`
- **start_url:** `/`
- **scope:** `/`

Проверка: DevTools → Application → Manifest

---

## Иконки

Генерация из `src/images/logo.png`:

```bash
npm run pwa:icons
```

Создаются:

- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-512-maskable.png`
- `public/icons/apple-touch-icon.png`
- `public/favicon-32.png`

После смены логотипа перегенерируйте иконки и пересоберите проект.

---

## Service Worker

Файл: `public/sw.js` (копируется в `build/` при сборке).

### Cache versioning

- `shell-enotmani-v1` — offline.html, manifest, иконки, index.html
- `static-enotmani-v1` — `/static/*`, CSS, JS, шрифты

При обновлении версии в `sw.js` измените `CACHE_VERSION` (например `enotmani-v2`).

### Стратегии

| Тип | Стратегия |
|-----|-----------|
| `/api/*` | не кешируется |
| `/admin`, `/account`, `/login` и др. | только network |
| `/static/*`, иконки | cache-first + обновление из сети |
| публичные страницы | network-first, fallback offline.html |

### Приватные данные

Не кешируются:

- API
- личный кабинет
- админка
- авторизация

При logout вызывается `clearPrivateCache()` — SW очищает потенциально чувствительные cache.

---

## Обновление PWA

1. Меняете код и `CACHE_VERSION` в `sw.js`
2. Деплоите новый `build/`
3. Пользователь видит баннер «Доступна новая версия»
4. По кнопке «Обновить» — reload с новым SW

Автоперезагрузка во время заполнения форм не выполняется.

---

## Локальная проверка

```bash
npm run build
npm run server
```

Откройте https или localhost (Service Worker требует secure context).

DevTools → Application:

- Manifest валиден
- Service Worker registered
- Cache Storage содержит `shell-*` и `static-*`

Lighthouse → категория PWA.

Для dev-сервера CRA (`npm start`) SW по умолчанию выключен.  
Для теста PWA используйте production build.

---

## HTTPS (production)

PWA работает только через HTTPS (или localhost).

На VPS:

```bash
certbot --nginx -d your-domain.com
```

Service Worker и install prompt не работают на HTTP.

---

## Установка

### Android / Chrome

Баннер «Установить приложение» или меню браузера → «Установить».

### iPhone / Safari

Подсказка: Поделиться → «На экран Домой».

### Desktop

Chrome/Edge → иконка установки в адресной строке.

---

## Offline

- Публичные страницы: fallback на `offline.html` или ранее загруженный shell
- `/account`, `/admin`: сообщение «Нет подключения» + кнопка «Повторить»
- Индикатор «Нет подключения» / «Соединение восстановлено»

---

## SEO

PWA не меняет routing и metadata.  
`robots.txt`, sitemap, Open Graph остаются без изменений.

---

## Push notifications

Не подключены. SW архитектура позволяет добавить позже через `push` event в `sw.js`.

---

## Чеклист перед релизом

- [ ] `npm run pwa:icons`
- [ ] `npm run build`
- [ ] HTTPS на production
- [ ] `/manifest.json` открывается
- [ ] `/sw.js` открывается
- [ ] Lighthouse PWA без критичных ошибок
- [ ] Login / logout в установленном PWA
- [ ] Offline fallback на главной
- [ ] Admin не показывает закешированные данные
