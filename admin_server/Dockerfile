# Stage 1: Install dependencies
FROM node:20-alpine AS builder
WORKDIR /app

# Install netcat for wait-for-it.sh
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy application code and scripts
COPY . .

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Install netcat for wait-for-it.sh
RUN apk add --no-cache netcat-openbsd

# Copy wait-for-it and prisma-fastify scripts
COPY wait-for-it.sh ./wait-for-it.sh
COPY prisma-fastify.sh ./prisma-fastify.sh
RUN chmod +x ./wait-for-it.sh ./prisma-fastify.sh

# Copy node_modules and application code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/seed.js ./seed.js

ENV PORT=3000
EXPOSE 3000

CMD ["./prisma-fastify.sh"]
