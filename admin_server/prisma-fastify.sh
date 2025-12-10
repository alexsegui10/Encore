#!/bin/sh
set -e

echo "Waiting for MongoDB to be ready..."
./wait-for-it.sh mongo:27017 --timeout=60 --strict -- echo "MongoDB is reachable"

echo "Generating Prisma Client..."
npx prisma generate --schema ./prisma/schema.prisma

echo "Pushing database schema..."
npx prisma db push --schema ./prisma/schema.prisma --skip-generate

echo "Starting Fastify admin server..."
PORT=3000 node src/server.js
