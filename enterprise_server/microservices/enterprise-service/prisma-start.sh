#!/bin/sh
# prisma-start.sh - Generar Prisma Client e iniciar servicio

set -e

echo "Generando Prisma Client para Enterprise Service..."
npx prisma generate

echo "Aplicando migraciones..."
npx prisma db push --skip-generate

echo "Iniciando Enterprise Service..."
npm run start:prod
