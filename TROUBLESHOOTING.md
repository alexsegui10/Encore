# 🔧 Troubleshooting y Mejores Prácticas - Docker

## 🐛 Problemas Comunes y Soluciones

### 1. Error: "Cannot connect to Docker daemon"

**Síntomas:**
```
ERROR: Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Solución:**
```bash
# Windows: Abre Docker Desktop
# Verifica que está corriendo
docker ps

# Si no inicia, reinicia Docker Desktop
# Configuración → Reset → Restart Docker
```

---

### 2. Error: "Port is already allocated"

**Síntomas:**
```
ERROR: for frontend  Cannot start service frontend: 
Ports are not available: exposing port TCP 0.0.0.0:80 -> 0.0.0.0:0
```

**Solución:**
```powershell
# Encontrar qué proceso usa el puerto
netstat -ano | findstr :80

# Detener el proceso (reemplaza PID con el número encontrado)
Stop-Process -Id <PID> -Force

# O cambiar el puerto en .env
FRONTEND_PORT=8080
```

---

### 3. MongoDB: "MongoServerError: not master"

**Síntomas:**
```
MongoServerError: not master and slaveOk=false
```

**Solución:**
```bash
# Verificar estado del Replica Set
docker-compose exec mongo mongosh -u admin -p admin123 --authenticationDatabase admin

# En mongosh:
rs.status()

# Si no está configurado, reinicia mongo-init:
docker-compose up -d mongo-init
```

---

### 4. Prisma: "Schema engine error"

**Síntomas:**
```
Error: P1001: Can't reach database server
```

**Solución:**
```bash
# Verificar que MongoDB está corriendo
docker-compose ps mongo

# Verificar la URL en .env
# Debe ser: mongodb://admin:admin123@mongo:27017/admin_db?authSource=admin&replicaSet=rs0

# Regenerar Prisma Client
docker-compose exec admin_server npx prisma generate
docker-compose restart admin_server
```

---

### 5. Frontend: "Cannot GET /"

**Síntomas:**
- Navegador muestra "Cannot GET /"
- O página en blanco

**Solución:**
```bash
# Ver logs del build
docker-compose logs frontend

# Verificar que construyó correctamente
docker-compose exec frontend ls -la /usr/share/nginx/html

# Si está vacío, reconstruir:
docker-compose down frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

### 6. "Network already exists"

**Síntomas:**
```
ERROR: Network encore_network declared as external, but could not be found
```

**Solución:**
```bash
# Limpiar redes huérfanas
docker network prune

# O crear la red manualmente
docker network create encore_network

# Reintentar
docker-compose up -d
```

---

### 7. Contenedores en "Restarting" infinito

**Síntomas:**
```
encore_booking_client     restarting
```

**Solución:**
```bash
# Ver los últimos 100 logs para encontrar el error
docker-compose logs --tail=100 booking_client

# Errores comunes:
# - Base de datos no lista → esperar más tiempo
# - Variable de entorno faltante → revisar .env
# - Error en código → revisar logs

# Detener y ver logs en tiempo real
docker-compose stop booking_client
docker-compose up booking_client
```

---

### 8. MySQL: "Access denied for user"

**Síntomas:**
```
Access denied for user 'enterprise'@'%' (using password: YES)
```

**Solución:**
```bash
# Verificar credenciales en .env
# MYSQL_USER=enterprise
# MYSQL_PASSWORD=enterprise123

# Si cambiaste credenciales, elimina el volumen:
docker-compose down -v
docker-compose up -d mysql

# Espera 30 segundos para que MySQL inicialice
```

---

### 9. "No space left on device"

**Síntomas:**
```
ERROR: no space left on device
```

**Solución:**
```bash
# Limpiar imágenes sin usar
docker image prune -a

# Limpiar contenedores detenidos
docker container prune

# Limpiar volúmenes sin usar
docker volume prune

# Limpiar todo el caché de build
docker builder prune -a

# Ver uso de espacio
docker system df
```

---

### 10. Cambios en código no se reflejan

**Síntomas:**
- Modificaste código pero no ves cambios

**Solución:**
```bash
# En producción, debes reconstruir la imagen
docker-compose build booking_client
docker-compose up -d booking_client

# Para desarrollo, usa volúmenes montados o docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up -d
# Luego ejecuta servicios localmente con npm run dev
```

---

## ✅ Mejores Prácticas

### 🔐 Seguridad

```bash
# 1. NUNCA subas .env a git
echo ".env" >> .gitignore

# 2. Usa secretos fuertes en producción
# Genera con:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. No expongas puertos innecesarios
# En docker-compose.yml, comenta puertos de microservicios internos
```

### 📦 Optimización de Imágenes

```dockerfile
# ✅ BIEN: Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/main.js"]

# ❌ MAL: Todo en una etapa
FROM node:20
COPY . .
RUN npm install
CMD ["npm", "start"]
```

### 🚀 Performance

```yaml
# Agregar health checks en docker-compose.yml
services:
  booking_client:
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 📝 Logging

```bash
# Limitar tamaño de logs
services:
  booking_client:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 🔄 Updates y Mantenimiento

```bash
# Actualizar imágenes base regularmente
docker-compose pull

# Reconstruir con últimas versiones
docker-compose build --pull

# Verificar vulnerabilidades
docker scan encore_frontend:latest
```

---

## 🎯 Comandos de Diagnóstico

### Información del Sistema

```bash
# Información general de Docker
docker info

# Uso de recursos
docker stats

# Uso de espacio en disco
docker system df -v

# Inspeccionar un contenedor
docker inspect encore_booking_client

# Ver procesos dentro de un contenedor
docker-compose top booking_client
```

### Debugging en Contenedores

```bash
# Ejecutar shell dentro del contenedor
docker-compose exec booking_client sh

# Ver variables de entorno
docker-compose exec booking_client env

# Ver archivos de configuración
docker-compose exec booking_client cat /app/.env

# Ejecutar comandos Node.js
docker-compose exec booking_client node -v
docker-compose exec booking_client npm list
```

### Red y Conectividad

```bash
# Listar redes
docker network ls

# Inspeccionar red
docker network inspect encore_network

# Probar conectividad entre servicios
docker-compose exec booking_client ping mongo
docker-compose exec admin_server nc -zv mongo 27017
```

### Bases de Datos

```bash
# MongoDB: Ver bases de datos
docker-compose exec mongo mongosh -u admin -p admin123 --eval "show dbs"

# MongoDB: Ver colecciones
docker-compose exec mongo mongosh -u admin -p admin123 booking_db --eval "show collections"

# MySQL: Ver bases de datos
docker-compose exec mysql mysql -u root -proot123 -e "SHOW DATABASES;"

# MySQL: Ver tablas
docker-compose exec mysql mysql -u enterprise -penterprise123 enterprise_db -e "SHOW TABLES;"
```

---

## 📊 Monitoreo

### Ver Recursos en Tiempo Real

```bash
# CPU, Memoria, Red, I/O
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Logs con timestamps
docker-compose logs -f --timestamps booking_client

# Seguir logs de múltiples servicios
docker-compose logs -f booking_client admin_server frontend
```

### Exportar Logs

```bash
# Guardar logs a archivo
docker-compose logs --no-color > logs_$(date +%Y%m%d_%H%M%S).txt

# Logs de las últimas 24 horas
docker-compose logs --since 24h > logs_24h.txt
```

---

## 🔄 CI/CD Considerations

```yaml
# .github/workflows/docker-build.yml
name: Docker Build and Test

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build images
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose up -d && sleep 30 && docker-compose exec -T booking_client npm test
      
      - name: Push to registry
        run: |
          docker tag encore_frontend:latest myregistry/encore_frontend:latest
          docker push myregistry/encore_frontend:latest
```

---

## 📚 Recursos Adicionales

- **Docker Hub**: https://hub.docker.com/
- **Docker Compose Reference**: https://docs.docker.com/compose/compose-file/
- **Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Security**: https://docs.docker.com/engine/security/

---

✨ **Recuerda: Los logs son tus amigos. Siempre revisa los logs cuando algo falla.**

```bash
docker-compose logs -f --tail=100
```
