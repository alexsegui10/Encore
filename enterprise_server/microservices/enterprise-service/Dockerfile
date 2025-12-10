# Enterprise Service Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar herramientas necesarias
RUN apk add --no-cache netcat-openbsd

# Copiar package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar todas las dependencias (incluye devDependencies necesarias para build)
RUN npm ci

# Copiar Prisma schema
COPY prisma ./prisma/

# Copiar código fuente
COPY src ./src

# Build de TypeScript
RUN npm run build

# Copiar scripts
COPY --chmod=755 wait-for-it.sh ./
COPY --chmod=755 prisma-start.sh ./

# Exponer puerto
EXPOSE 5001

CMD ["./prisma-start.sh"]
