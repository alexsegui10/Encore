#!/bin/sh
# prisma-start.sh - Generar Prisma Client e iniciar servidor

set -e

echo "Generando Prisma Client..."
npx prisma generate --schema ./prisma/schema.prisma

echo "Aplicando migraciones..."
npx prisma db push --schema ./prisma/schema.prisma --skip-generate

echo "Iniciando servidor Admin..."
npm start
