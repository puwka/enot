# ЕнотМани

Сравнение финансовых продуктов + админка CMS.

## Установка на сервер (одна команда)

```bash
curl -fsSL https://raw.githubusercontent.com/puwka/enot/main/install.sh | sudo bash
```

С доменом:

```bash
curl -fsSL https://raw.githubusercontent.com/puwka/enot/main/install.sh | sudo DOMAIN=ваш-сайт.ru bash
```

Подробно: [INSTALL.md](./INSTALL.md)

## Обновление

```bash
cd /var/www/enotmani && sudo bash update.sh
```

## Админка

- URL: `/admin/login`
- Логин: `superadmin@enotmani.local`
- Пароль: `SuperAdmin123!`

## Локальная разработка

```bash
cp .env.example .env
# укажите параметры PostgreSQL
npm install
npm run db:migrate
npm run db:seed
npm run server   # API :3001
npm start        # React :3000
```
