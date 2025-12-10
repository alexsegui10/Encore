# Booking Client Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar herramientas necesarias
RUN apk add --no-cache netcat-openbsd

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto de la aplicación
COPY . .

# Copiar wait-for-it script
COPY --chmod=755 wait-for-it.sh ./

# Exponer puerto
EXPOSE 4000

# Comando por defecto
CMD ["npm", "start"]
