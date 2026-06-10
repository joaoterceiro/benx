#!/bin/sh
set -e

echo "===================== BENX BOOT ====================="
echo "==> Aplicando migrations (drizzle)..."
if npm run db:migrate; then
  echo "==> MIGRATIONS: OK"
else
  echo "!!!!! MIGRATE FALHOU (erro acima). O app segue no ar para diagnostico."
fi

if [ "$RUN_SEED" = "true" ]; then
  echo "==> RUN_SEED=true: rodando seed inicial (admin + dados base)..."
  npm run db:seed || echo "seed falhou ou ja aplicado, seguindo..."
fi

echo "==> Iniciando Next.js em :$PORT ..."
exec npm run start
