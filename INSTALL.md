# Установка ЕнотМани за пару кликов

Нужен Linux-сервер (Ubuntu 22.04 / Debian 12 и аналоги) и SSH.

**Минимум:** 1 CPU, **2 GB RAM** (на 1 GB скрипт добавит swap), ~10 GB диска.

---

## Одна команда

Подключитесь по SSH и выполните:

```bash
curl -fsSL https://raw.githubusercontent.com/puwka/enot/main/install.sh | sudo bash
```

Скрипт сам поставит Docker, скачает проект, создаст базу, соберёт и запустит сайт.

Откройте: `http://IP_СЕРВЕРА:3001`

### С доменом

Сначала в панели хостинга направьте A-запись домена на IP сервера, затем:

```bash
curl -fsSL https://raw.githubusercontent.com/puwka/enot/main/install.sh | sudo DOMAIN=ваш-сайт.ru bash
```

(Важно: `DOMAIN=...` пишется **после** `sudo`, иначе переменная не дойдёт до скрипта.)

---

## Если репозиторий уже на сервере

```bash
cd /var/www/enotmani
sudo bash install.sh
```

Или только Docker:

```bash
cd /var/www/enotmani
cp -n .env.example .env
sudo docker compose up -d --build
```

---

## Вход в админку

| | |
|---|---|
| Адрес | `http://ВАШ_САЙТ/admin/login` |
| Логин | `superadmin@enotmani.local` |
| Пароль | `SuperAdmin123!` |

Смените пароль после первого входа.

Запасной аккаунт: `admin@enotmani.local` / `Admin123!`

---

## Обновление одной командой

```bash
cd /var/www/enotmani
sudo bash update.sh
```

---

## Без Docker (Node + PostgreSQL)

```bash
curl -fsSL https://raw.githubusercontent.com/puwka/enot/main/install.sh | sudo MODE=native bash
```

---

## Если сборка пишет `Killed`

Не хватает RAM. Скрипт обычно включает swap сам. Вручную:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
cd /var/www/enotmani && sudo bash update.sh
```

---

## Полезные команды

```bash
# статус
cd /var/www/enotmani && sudo docker compose ps
sudo docker compose logs -f app

# без Docker
sudo systemctl status enotmani
sudo journalctl -u enotmani -f
```

---

## Параметры установки

| Переменная | По умолчанию | Смысл |
|---|---|---|
| `DOMAIN` | — | домен + nginx |
| `APP_PORT` | `3001` | порт |
| `INSTALL_DIR` | `/var/www/enotmani` | папка |
| `MODE` | `docker` | `docker` или `native` |
| `FORCE_ENV=1` | — | пересоздать `.env` |

Пример:

```bash
curl -fsSL https://raw.githubusercontent.com/puwka/enot/main/install.sh \
  | sudo DOMAIN=enot.example.ru APP_PORT=3001 MODE=docker bash
```
