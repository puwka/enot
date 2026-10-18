#!/usr/bin/env bash
# Обновление ЕнотМани одной командой
#   cd /var/www/enotmani && sudo bash update.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'
log() { echo -e "${CYAN}[enotmani]${NC} $*"; }
ok() { echo -e "${GREEN}[ok]${NC} $*"; }
die() { echo -e "${RED}[error]${NC} $*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Нужен root: sudo bash update.sh"

# swap на слабых VPS
mem_kb=$(awk '/MemTotal/ {print $2}' /proc/meminfo 2>/dev/null || echo 0)
if [ "$mem_kb" -gt 0 ] && [ "$mem_kb" -lt 1800000 ] && ! swapon --show 2>/dev/null | grep -q .; then
  log "Добавляю swap 2G…"
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
fi

log "git pull…"
git fetch --all --prune
git reset --hard origin/main 2>/dev/null || git pull --ff-only

if [ -f docker-compose.yml ] && command -v docker >/dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^enotmani-app$'; then
  log "Docker-обновление…"
  if docker compose version >/dev/null 2>&1; then
    docker compose up -d --build
  else
    docker-compose up -d --build
  fi
  ok "Готово (docker)"
  exit 0
fi

log "npm ci…"
npm ci
log "миграции…"
npm run db:migrate
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
export GENERATE_SOURCEMAP=false
log "build…"
npm run build

if systemctl list-unit-files 2>/dev/null | grep -q '^enotmani.service'; then
  systemctl restart enotmani
  ok "Сервис перезапущен"
else
  echo "[!] Перезапустите приложение вручную: node server/index.js"
fi

ok "Обновление завершено"
