#!/bin/sh
# prisma-start.sh - Generar Prisma Client e iniciar servicio

set -e

echo "Generando Prisma Client para Product Service..."
npx prisma generate

echo "Aplicando migraciones..."
npx prisma db push --skip-generate

echo "Iniciando Product Service..."
npm run start:prod
