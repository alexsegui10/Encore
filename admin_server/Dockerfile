# Admin Server Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar herramientas necesarias
RUN apk add --no-cache netcat-openbsd

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar Prisma schema
COPY prisma ./prisma/

# Copiar el resto de la aplicación
COPY . .

# Copiar scripts
COPY --chmod=755 wait-for-it.sh ./
COPY --chmod=755 prisma-start.sh ./

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["./prisma-start.sh"]
