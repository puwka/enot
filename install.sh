#!/usr/bin/env bash
# ЕнотМани — установка «в один клик» на Linux VPS
# Использование:
#   curl -fsSL https://raw.githubusercontent.com/puwka/enot/main/install.sh | sudo bash
# С доменом (DOMAIN после sudo!):
#   curl -fsSL https://raw.githubusercontent.com/puwka/enot/main/install.sh | sudo DOMAIN=site.ru bash
# Опции: DOMAIN APP_PORT INSTALL_DIR MODE=docker|native FORCE_ENV=1

set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/puwka/enot.git}"
INSTALL_DIR="${INSTALL_DIR:-/var/www/enotmani}"
APP_PORT="${APP_PORT:-3001}"
DOMAIN="${DOMAIN:-}"
MODE="${MODE:-auto}"
NODE_MAJOR="${NODE_MAJOR:-20}"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${CYAN}[enotmani]${NC} $*"; }
ok() { echo -e "${GREEN}[ok]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
die() { echo -e "${RED}[error]${NC} $*" >&2; exit 1; }

need_root() {
  if [ "$(id -u)" -ne 0 ]; then
    die "Запустите от root: sudo bash install.sh"
  fi
}

rand_pass() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 24 | tr -d '/+=' | head -c 24
  else
    head -c 48 /dev/urandom | base64 | tr -d '/+=' | head -c 24
  fi
}

ensure_swap() {
  local mem_kb
  mem_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 0)
  if [ "$mem_kb" -gt 0 ] && [ "$mem_kb" -lt 1800000 ]; then
    if ! swapon --show 2>/dev/null | grep -q .; then
      log "Мало RAM — добавляю swap 2G…"
      fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
      chmod 600 /swapfile
      mkswap /swapfile >/dev/null
      swapon /swapfile
      grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
      ok "swap включён"
    fi
  fi
}

detect_mode() {
  if [ "$MODE" = "docker" ] || [ "$MODE" = "native" ]; then
    echo "$MODE"
    return
  fi
  # auto: Docker проще для «одной команды»
  echo "docker"
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    ok "Docker уже установлен"
    return
  fi
  log "Ставлю Docker…"
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
      curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg
    fi
    . /etc/os-release
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin || \
      apt-get install -y docker.io docker-compose-v2 || \
      apt-get install -y docker.io
  elif command -v yum >/dev/null 2>&1; then
    yum install -y docker
    systemctl enable --now docker
  else
    die "Не удалось поставить Docker автоматически. Установите Docker и запустите снова."
  fi
  systemctl enable --now docker 2>/dev/null || true
  ok "Docker готов"
}

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    die "Нет docker compose. Установите Docker Compose v2."
  fi
}

install_node_native() {
  if command -v node >/dev/null 2>&1; then
    local major
    major=$(node -p "process.versions.node.split('.')[0]")
    if [ "$major" -ge 18 ]; then
      ok "Node.js $(node -v)"
      return
    fi
  fi
  log "Ставлю Node.js ${NODE_MAJOR}…"
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
    apt-get install -y nodejs
  else
    die "Установите Node.js ${NODE_MAJOR}+ вручную."
  fi
  ok "Node.js $(node -v)"
}

install_postgres_native() {
  if command -v psql >/dev/null 2>&1; then
    ok "PostgreSQL уже есть"
  else
    log "Ставлю PostgreSQL…"
    if command -v apt-get >/dev/null 2>&1; then
      apt-get update -y
      apt-get install -y postgresql postgresql-contrib
      systemctl enable --now postgresql
    else
      die "Установите PostgreSQL вручную."
    fi
  fi
}

clone_or_update() {
  mkdir -p "$(dirname "$INSTALL_DIR")"
  if [ -d "$INSTALL_DIR/.git" ]; then
    log "Обновляю репозиторий в $INSTALL_DIR…"
    git -C "$INSTALL_DIR" fetch --all --prune
    git -C "$INSTALL_DIR" reset --hard origin/main 2>/dev/null || git -C "$INSTALL_DIR" pull --ff-only
  else
    log "Клонирую $REPO_URL → $INSTALL_DIR…"
    if command -v apt-get >/dev/null 2>&1; then
      apt-get install -y git >/dev/null 2>&1 || true
    fi
    command -v git >/dev/null 2>&1 || die "Нужен git"
    git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
  fi
}

write_env() {
  local db_pass="${DATABASE_PASSWORD:-}"
  local env_file="$INSTALL_DIR/.env"
  if [ -f "$env_file" ] && [ "${FORCE_ENV:-0}" != "1" ]; then
    ok ".env уже есть — оставляю"
    # shellcheck disable=SC1090
    set -a; . "$env_file"; set +a
    return
  fi
  if [ -z "$db_pass" ]; then
    db_pass="$(rand_pass)"
  fi
  cat > "$env_file" <<EOF
APP_ENV=production
NODE_ENV=production
PORT=3001
APP_PORT=${APP_PORT}
REACT_APP_API_URL=/api

DATABASE_NAME=enotmani
DATABASE_USER=enotmani
DATABASE_PASSWORD=${db_pass}
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_SSL=false
DATABASE_URL=postgresql://enotmani:${db_pass}@localhost:5432/enotmani

CORS_ORIGIN=*
SESSION_DAYS=7
EOF
  chmod 600 "$env_file"
  ok "Создан $env_file"
  DATABASE_PASSWORD="$db_pass"
}

setup_postgres_db() {
  local db_pass="${DATABASE_PASSWORD}"
  log "Создаю роль и БД PostgreSQL…"
  sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'enotmani') THEN
    CREATE ROLE enotmani LOGIN PASSWORD '${db_pass}';
  ELSE
    ALTER ROLE enotmani WITH LOGIN PASSWORD '${db_pass}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE enotmani OWNER enotmani'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'enotmani')\gexec
GRANT ALL PRIVILEGES ON DATABASE enotmani TO enotmani;
SQL
  ok "База enotmani готова"
}

setup_nginx() {
  if [ -z "$DOMAIN" ]; then
    warn "DOMAIN не задан — nginx пропускаю. Сайт: http://SERVER_IP:${APP_PORT}"
    return
  fi
  if ! command -v nginx >/dev/null 2>&1; then
    if command -v apt-get >/dev/null 2>&1; then
      apt-get install -y nginx
    else
      warn "nginx не найден — настройте прокси сами"
      return
    fi
  fi
  local conf="/etc/nginx/sites-available/enotmani"
  sed "s/YOUR_DOMAIN.ru/${DOMAIN}/g; s/www.YOUR_DOMAIN.ru/www.${DOMAIN}/g; s/3001/${APP_PORT}/g" \
    "$INSTALL_DIR/deploy/nginx-enotmani.conf" > "$conf"
  ln -sfn "$conf" /etc/nginx/sites-enabled/enotmani
  rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
  nginx -t && systemctl reload nginx
  ok "nginx → http://${DOMAIN}"
  if command -v certbot >/dev/null 2>&1; then
    certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "admin@${DOMAIN}" || warn "HTTPS: запустите certbot вручную"
  else
    warn "Для HTTPS: apt install certbot python3-certbot-nginx && certbot --nginx -d ${DOMAIN}"
  fi
}

install_docker_stack() {
  install_docker
  clone_or_update
  write_env
  # docker compose читает .env из каталога проекта
  cd "$INSTALL_DIR"
  # docker-compose сам передаёт postgres-хост в контейнер; URL на localhost только для хоста
  log "Собираю и запускаю контейнеры (первый раз может занять несколько минут)…"
  compose up -d --build
  ok "Контейнеры запущены"
  setup_nginx
}

install_native_stack() {
  install_node_native
  install_postgres_native
  clone_or_update
  write_env
  # native: localhost
  if grep -q '^DATABASE_HOST=' "$INSTALL_DIR/.env"; then
    sed -i 's/^DATABASE_HOST=.*/DATABASE_HOST=localhost/' "$INSTALL_DIR/.env" || true
  fi
  # shellcheck disable=SC1090
  set -a; . "$INSTALL_DIR/.env"; set +a
  setup_postgres_db
  cd "$INSTALL_DIR"
  log "npm ci…"
  npm ci
  log "миграции…"
  npm run db:migrate
  npm run db:seed || true
  log "сборка фронта…"
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
  export GENERATE_SOURCEMAP=false
  npm run build
  local unit="/etc/systemd/system/enotmani.service"
  sed "s|/var/www/enotmani|${INSTALL_DIR}|g" "$INSTALL_DIR/deploy/enotmani.service" > "$unit"
  # User=root safer for first install if www-data can't read; keep www-data if exists
  if id www-data >/dev/null 2>&1; then
    chown -R www-data:www-data "$INSTALL_DIR"
  else
    sed -i 's/^User=.*/User=root/; s/^Group=.*/Group=root/' "$unit"
  fi
  systemctl daemon-reload
  systemctl enable --now enotmani
  ok "сервис enotmani запущен"
  setup_nginx
}

print_done() {
  local ip
  ip=$(hostname -I 2>/dev/null | awk '{print $1}')
  echo
  echo -e "${GREEN}════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ЕнотМани установлен${NC}"
  echo -e "${GREEN}════════════════════════════════════════${NC}"
  if [ -n "$DOMAIN" ]; then
    echo "  Сайт:     http://${DOMAIN}"
  else
    echo "  Сайт:     http://${ip:-SERVER}:${APP_PORT}"
  fi
  echo "  Админка:  /admin/login"
  echo "  Логин:    superadmin@enotmani.local"
  echo "  Пароль:   SuperAdmin123!"
  echo "  Каталог:  ${INSTALL_DIR}"
  echo
  echo "  Смените пароль админа после первого входа."
  echo "  Обновление:  cd ${INSTALL_DIR} && sudo bash update.sh"
  echo -e "${GREEN}════════════════════════════════════════${NC}"
}

main() {
  need_root
  ensure_swap
  local chosen
  chosen="$(detect_mode)"
  log "Режим установки: ${chosen}"
  if [ "$chosen" = "docker" ]; then
    install_docker_stack
  else
    install_native_stack
  fi
  print_done
}

main "$@"
