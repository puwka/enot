# Развертывание на PostgreSQL (без Supabase)

Проект работает через **свой backend (Node.js + Express)** и **PostgreSQL** на сервере заказчика.

Supabase не используется.

---

## Архитектура

```
Браузер → React (build/) → API (/api) → Node.js server → PostgreSQL
```

- **Фронтенд** — статика React (`npm run build`)
- **Backend** — `server/index.js` (Express)
- **БД** — PostgreSQL 15+

---

## Быстрый старт

### 1. Установить PostgreSQL

Ubuntu:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### 2. Создать базу и пользователя

```bash
sudo -u postgres psql
```

```sql
CREATE USER enotmani WITH PASSWORD 'your_secure_password';
CREATE DATABASE enotmani OWNER enotmani;
GRANT ALL PRIVILEGES ON DATABASE enotmani TO enotmani;
\q
```

### 3. Настроить `.env`

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://enotmani:your_secure_password@localhost:5432/enotmani
DATABASE_SSL=false
PORT=3001
REACT_APP_API_URL=/api
```

### 4. Установить зависимости и миграции

```bash
npm install
npm run db:migrate
npm run db:check
```

### 5. Создать администратора

Отредактируйте `database/grant_superadmin.sql` и выполните:

```bash
psql "$DATABASE_URL" -f database/grant_superadmin.sql
```

Или:

```bash
node scripts/gen-admin-hashes.mjs YourPassword
```

и выполните сгенерированный SQL.

Тестовые админы после migrate (migration 011):

- superadmin@enotmani.local / SuperAdmin123!
- admin@enotmani.local / Admin123!
- editor@enotmani.local / Editor123!

### 6. Собрать и запустить

```bash
npm run build
npm run server
```

Сайт: http://localhost:3001  
Админка: http://localhost:3001/admin/login

---

## Разработка

Терминал 1 — API:

```bash
npm run server
```

Терминал 2 — фронтенд:

```bash
npm start
```

CRA proxy перенаправляет `/api` на `http://localhost:3001`.

---

## VPS (production)

### Вариант A — Node отдаёт и API, и статику

```bash
git clone <repo>
cd project
cp .env.example .env
# заполнить DATABASE_*
npm install
npm run db:migrate
npm run build
npm run server
```

Systemd unit `/etc/systemd/system/enotmani.service`:

```ini
[Unit]
Description=EnotMani
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/enotmani
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable enotmani
sudo systemctl start enotmani
```

Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

HTTPS — certbot.

### Вариант B — Docker Compose

```bash
cp .env.example .env
docker compose up -d postgres
npm run db:migrate
docker compose up -d --build app
```

---

## Команды БД

| Команда | Описание |
|---------|----------|
| `npm run db:migrate` | применить миграции |
| `npm run db:seed` | начальные данные |
| `npm run db:check` | проверка подключения |

Миграции: `database/migrations/001..017`

---

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `DATABASE_URL` | строка подключения PostgreSQL |
| `DATABASE_HOST/PORT/NAME/USER/PASSWORD` | альтернатива URL |
| `DATABASE_SSL` | `true` для облачных БД с SSL |
| `PORT` | порт API (по умолчанию 3001) |
| `REACT_APP_API_URL` | URL API для фронтенда (`/api` в production) |
| `CORS_ORIGIN` | разрешённый origin или `*` |
| `SESSION_DAYS` | срок сессии пользователя |

---

## Backup и restore

```bash
pg_dump "$DATABASE_URL" -Fc -f backup.dump
pg_restore -d "$DATABASE_URL" --clean --if-exists backup.dump
```

---

## Обновление версии

```bash
pg_dump "$DATABASE_URL" -Fc -f backup_before_update.dump
git pull
npm install
npm run db:migrate
npm run build
sudo systemctl restart enotmani
```

---

## Проверка

- [ ] `npm run db:check` — OK
- [ ] `curl http://localhost:3001/api/health` — `"ok": true`
- [ ] Главная, каталоги, калькулятор
- [ ] Регистрация и вход
- [ ] Личный кабинет, бонусы
- [ ] `/admin/login` — вход и CRUD

---

## Структура

```
database/migrations/   SQL-миграции
database/seed/         seed-данные
server/                Express API
src/                   React frontend
.env.example           шаблон конфигурации
docker-compose.yml     PostgreSQL + app
```
