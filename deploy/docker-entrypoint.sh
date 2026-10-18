#!/bin/sh
set -eu

echo "[enotmani] waiting for database…"
i=0
until node scripts/wait-db.mjs; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then
    echo "[enotmani] database is not ready" >&2
    exit 1
  fi
  sleep 2
done

echo "[enotmani] applying migrations…"
node scripts/db.mjs migrate

echo "[enotmani] seeding defaults…"
node scripts/db.mjs seed || true

echo "[enotmani] starting API…"
exec node server/index.js
