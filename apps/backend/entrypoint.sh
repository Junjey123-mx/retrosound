#!/bin/sh
set -e

echo ">>> [1/3] Running Prisma migrations..."
npx prisma migrate deploy

echo ">>> [2/3] Checking if initial seed is needed..."
SEED_NEEDED=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.categoria.count()
  .then(n => { process.stdout.write(n === 0 ? '1' : '0'); return p.\$disconnect(); })
  .catch(() => { process.stdout.write('1'); return p.\$disconnect(); });
" 2>/dev/null || echo "1")

if [ "$SEED_NEEDED" = "1" ]; then
  echo ">>> Seeding database with demo data..."
  npx prisma db seed || echo ">>> Seed failed or skipped — continuing anyway."
else
  echo ">>> Database already has data — skipping seed."
fi

echo ">>> [3/3] Starting NestJS server..."
exec node dist/main.js
