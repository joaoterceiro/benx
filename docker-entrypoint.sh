#!/bin/sh
set -e

echo "==> Aplicando migrations (drizzle)..."
npm run db:migrate

if [ "$RUN_SEED" = "true" ]; then
  echo "==> RUN_SEED=true: rodando seed inicial (admin + dados base)..."
  npm run db:seed || echo "seed falhou ou ja aplicado, seguindo..."
fi

echo "==> Iniciando Next.js em :$PORT ..."
exec npm run start
