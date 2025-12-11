# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install netcat for wait-for-it.sh
RUN apk add --no-cache netcat-openbsd

# Copy all source code first
COPY . .

# Install gateway dependencies and build
RUN npm ci
RUN npm run build

# Install and build microservices (using npm install since package-lock may not be updated)
WORKDIR /app/microservices/enterprise-service
RUN npm install
RUN npm run build

WORKDIR /app/microservices/product-service
RUN npm install
RUN npm run build

WORKDIR /app/microservices/category-service
RUN npm install
RUN npm run build

WORKDIR /app

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Install netcat for wait-for-it.sh
RUN apk add --no-cache netcat-openbsd

# Copy wait-for-it and prisma-nest scripts
COPY wait-for-it.sh ./wait-for-it.sh
COPY prisma-nest.sh ./prisma-nest.sh
# Convert line endings and make executable
RUN apk add --no-cache dos2unix && \
    dos2unix ./wait-for-it.sh ./prisma-nest.sh && \
    chmod +x ./wait-for-it.sh ./prisma-nest.sh && \
    apk del dos2unix

# Copy node_modules, built code, and config files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/nest-cli.json ./nest-cli.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Copy microservices with their node_modules and dist
COPY --from=builder /app/microservices ./microservices

ENV PORT=5000
EXPOSE 5000 5001 5002 5003

CMD ["./prisma-nest.sh"]
