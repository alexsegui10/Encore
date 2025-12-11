# 🎯 Cheat Sheet - Encore Docker

## ⚡ Comandos más usados (copiar y pegar)

### 🚀 Inicio Rápido
```powershell
# 1. Configurar entorno
Copy-Item .env.example .env

# 2. Levantar todo
docker-compose up -d

# 3. Ver logs
docker-compose logs -f

# 4. Ver estado
docker-compose ps
```

---

## 📋 Gestión de Servicios

### Levantar
```bash
# Todo
docker-compose up -d

# Solo un servicio
docker-compose up -d booking_client

# Con rebuild
docker-compose up -d --build

# Solo bases de datos (desarrollo)
docker-compose -f docker-compose.dev.yml up -d
```

### Detener
```bash
# Todo
docker-compose down

# Solo un servicio
docker-compose stop booking_client

# Con eliminación de volúmenes (⚠️ borra datos)
docker-compose down -v
```

### Reiniciar
```bash
# Todo
docker-compose restart

# Solo un servicio
docker-compose restart admin_server
```

---

## 📊 Logs y Monitoreo

### Ver Logs
```bash
# Todos los servicios
docker-compose logs -f

# Un servicio específico
docker-compose logs -f booking_client
docker-compose logs -f admin_server
docker-compose logs -f frontend

# Últimas 100 líneas
docker-compose logs --tail=100 booking_client

# Logs desde hace 1 hora
docker-compose logs --since 1h booking_client

# Sin seguir (snapshot)
docker-compose logs booking_client
```

### Estado y Métricas
```bash
# Ver estado de contenedores
docker-compose ps

# Uso de recursos (CPU, RAM)
docker stats

# Información de un contenedor
docker inspect encore_booking_client

# Procesos dentro de un contenedor
docker-compose top booking_client
```

---

## 🐛 Debugging

### Acceder a Contenedores
```bash
# Shell en booking_client
docker-compose exec booking_client sh

# Shell en admin_server
docker-compose exec admin_server sh

# Shell en frontend
docker-compose exec frontend sh

# Ejecutar comando sin entrar
docker-compose exec booking_client node -v
docker-compose exec booking_client npm list
```

### Bases de Datos
```bash
# MongoDB shell
docker-compose exec mongo mongosh -u admin -p admin123 --authenticationDatabase admin

# Ver bases de datos MongoDB
docker-compose exec mongo mongosh -u admin -p admin123 --eval "show dbs"

# MySQL shell
docker-compose exec mysql mysql -u enterprise -penterprise123 enterprise_db

# Ver bases de datos MySQL
docker-compose exec mysql mysql -u root -proot123 -e "SHOW DATABASES;"
```

### Prisma
```bash
# Regenerar Prisma Client en admin_server
docker-compose exec admin_server npx prisma generate

# Ver schema de Prisma
docker-compose exec admin_server cat prisma/schema.prisma

# Aplicar migraciones
docker-compose exec admin_server npx prisma db push

# Seed database
docker-compose exec admin_server npm run seed
```

---

## 🔧 Reconstruir y Actualizar

### Rebuild Completo
```bash
# Detener todo
docker-compose down

# Reconstruir sin caché
docker-compose build --no-cache

# Levantar
docker-compose up -d
```

### Rebuild Individual
```bash
# Un servicio específico
docker-compose build booking_client
docker-compose up -d booking_client

# Frontend con cambios
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Actualizar Imágenes Base
```bash
# Descargar últimas versiones
docker-compose pull

# Reconstruir con nuevas bases
docker-compose build --pull
docker-compose up -d
```

---

## 🧹 Limpieza

### Limpieza Básica
```bash
# Detener contenedores
docker-compose down

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar imágenes sin usar
docker image prune -f

# Limpiar volúmenes sin usar
docker volume prune -f
```

### Limpieza Completa
```bash
# Detener y eliminar todo (incluyendo volúmenes)
docker-compose down -v

# Limpiar todas las imágenes
docker image prune -a -f

# Limpiar todo el sistema Docker
docker system prune -a --volumes -f
```

### Limpieza Selectiva
```bash
# Ver uso de espacio
docker system df

# Limpiar build cache
docker builder prune -f

# Eliminar red específica
docker network rm encore_network
```

---

## 📦 Gestión de Volúmenes

### Información
```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect encore_mongo_data

# Ver tamaño de volúmenes
docker system df -v
```

### Backup
```bash
# Backup MongoDB
docker-compose exec -T mongo mongodump --uri="mongodb://admin:admin123@localhost:27017" --authenticationDatabase=admin --archive > mongo_backup_$(date +%Y%m%d).dump

# Backup MySQL
docker-compose exec -T mysql mysqldump -u root -proot123 --all-databases > mysql_backup_$(date +%Y%m%d).sql
```

### Restore
```bash
# Restore MongoDB
docker-compose exec -T mongo mongorestore --uri="mongodb://admin:admin123@localhost:27017" --authenticationDatabase=admin --archive < mongo_backup_20231210.dump

# Restore MySQL
docker-compose exec -T mysql mysql -u root -proot123 < mysql_backup_20231210.sql
```

---

## 🌐 Red y Conectividad

### Información de Red
```bash
# Listar redes
docker network ls

# Inspeccionar red
docker network inspect encore_network

# Ver IPs de contenedores
docker-compose exec booking_client hostname -i
```

### Probar Conectividad
```bash
# Desde booking_client a mongo
docker-compose exec booking_client ping mongo

# Puerto abierto
docker-compose exec booking_client nc -zv mongo 27017

# Curl interno
docker-compose exec booking_client wget --spider http://admin_server:3000
```

---

## 🔍 Diagnóstico

### Verificar Configuración
```bash
# Validar docker-compose.yml
docker-compose config

# Ver variables de entorno
docker-compose exec booking_client env

# Ver archivo .env dentro del contenedor
docker-compose exec booking_client cat .env
```

### Health Checks
```bash
# Ver salud de servicios
docker-compose ps

# Logs de health checks
docker inspect --format='{{json .State.Health}}' encore_booking_client | jq
```

### Performance
```bash
# CPU y memoria de todos
docker stats --no-stream

# CPU y memoria de uno
docker stats --no-stream encore_booking_client

# Ver procesos
docker-compose top
```

---

## 🎨 Scripts PowerShell

### Con docker-manager.ps1
```powershell
# Levantar
.\docker-manager.ps1 up

# Detener
.\docker-manager.ps1 down

# Logs
.\docker-manager.ps1 logs

# Estado
.\docker-manager.ps1 ps

# Limpiar
.\docker-manager.ps1 clean

# Modo desarrollo
.\docker-manager.ps1 dev

# MongoDB shell
.\docker-manager.ps1 mongo

# MySQL shell
.\docker-manager.ps1 mysql
```

### Verificación
```powershell
# Verificar setup antes de empezar
.\verify-docker-setup.ps1
```

---

## 🐧 Makefile (Linux/Mac)

```bash
# Levantar
make up

# Detener
make down

# Logs
make logs

# Estado
make ps

# Limpiar
make clean

# Reconstruir
make rebuild

# MongoDB shell
make mongo-shell

# MySQL shell
make mysql-shell

# Modo desarrollo
make dev
```

---

## 🎯 Casos de Uso Frecuentes

### Caso 1: Ver por qué un servicio falla
```bash
# 1. Ver estado
docker-compose ps

# 2. Ver logs recientes
docker-compose logs --tail=50 booking_client

# 3. Ver logs en vivo
docker-compose logs -f booking_client

# 4. Reintentar
docker-compose restart booking_client
```

### Caso 2: Cambié código y necesito ver cambios
```bash
# Backend
docker-compose build booking_client
docker-compose up -d booking_client

# Frontend
docker-compose build frontend
docker-compose up -d frontend

# Todo
docker-compose up -d --build
```

### Caso 3: MongoDB no conecta
```bash
# 1. Ver logs de mongo
docker-compose logs mongo mongo-init

# 2. Verificar Replica Set
docker-compose exec mongo mongosh -u admin -p admin123 --eval "rs.status()"

# 3. Reiniciar mongo-init
docker-compose up -d mongo-init

# 4. Esperar 10 segundos
Start-Sleep -Seconds 10

# 5. Reiniciar servicios
docker-compose restart booking_client admin_server
```

### Caso 4: Puerto ya en uso
```powershell
# 1. Ver qué usa el puerto
netstat -ano | findstr :80

# 2. Detener proceso
Stop-Process -Id <PID> -Force

# 3. O cambiar puerto en .env
# FRONTEND_PORT=8080

# 4. Reiniciar
docker-compose up -d
```

### Caso 5: Empezar limpio
```bash
# Detener y borrar todo
docker-compose down -v

# Limpiar Docker
docker system prune -f

# Levantar de nuevo
docker-compose up -d
```

---

## 📱 URLs de Acceso

```
Frontend:              http://localhost
Admin API:             http://localhost:3000
Booking API:           http://localhost:4000
Enterprise Gateway:    http://localhost:5000
Enterprise Service:    http://localhost:5001
Category Service:      http://localhost:5002
Product Service:       http://localhost:5003

MongoDB:              mongodb://admin:admin123@localhost:27017
MySQL:                mysql://enterprise:enterprise123@localhost:3306
```

---

## 🚨 Comandos de Emergencia

```bash
# Todo está roto - empezar de cero
docker-compose down -v
docker system prune -a --volumes -f
docker-compose up -d --build

# Contenedor en loop de restart
docker-compose stop <servicio>
docker-compose logs --tail=200 <servicio>
# (leer error, arreglar, reiniciar)

# Sin espacio en disco
docker system prune -a --volumes -f
docker builder prune -a -f

# Regenerar todo de Prisma
docker-compose exec admin_server npx prisma generate
docker-compose exec admin_server npx prisma db push
docker-compose restart admin_server
```

---

**💡 Tip:** Guarda este archivo en favoritos para acceso rápido a comandos comunes.
