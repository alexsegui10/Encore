#!/bin/sh
set -e

echo "Waiting for MongoDB to be ready..."
./wait-for-it.sh mongo:27017 --timeout=60 --strict -- echo "MongoDB is reachable"

echo "Generating Prisma Client for Enterprise Service..."
cd microservices/enterprise-service && DATABASE_URL="$ENTERPRISE_DATABASE_URL" npx prisma generate && DATABASE_URL="$ENTERPRISE_DATABASE_URL" npx prisma db push --skip-generate && cd ../..

echo "Generating Prisma Client for Product Service..."
cd microservices/product-service && DATABASE_URL="$PRODUCT_DATABASE_URL" npx prisma generate && DATABASE_URL="$PRODUCT_DATABASE_URL" npx prisma db push --skip-generate && cd ../..

echo "Generating Prisma Client for Category Service..."
cd microservices/category-service && DATABASE_URL="$CATEGORY_DATABASE_URL" npx prisma generate && DATABASE_URL="$CATEGORY_DATABASE_URL" npx prisma db push --skip-generate && cd ../..

echo "Starting microservices in background..."
PORT=5001 DATABASE_URL="$ENTERPRISE_DATABASE_URL" node /app/microservices/enterprise-service/dist/main.js &
PORT=5002 DATABASE_URL="$PRODUCT_DATABASE_URL" node /app/microservices/product-service/dist/main.js &
PORT=5003 DATABASE_URL="$CATEGORY_DATABASE_URL" node /app/microservices/category-service/dist/main.js &

echo "Waiting for microservices to start..."
sleep 5

echo "Starting NestJS Enterprise Gateway..."
PORT=5000 node /app/dist/main.js
