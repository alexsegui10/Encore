# 🐳 Encore - Guía de Docker

Esta guía explica cómo ejecutar la aplicación completa usando Docker y Docker Compose.

## 📋 Prerrequisitos

- Docker Desktop instalado (incluye Docker Compose)
- Al menos 4GB de RAM disponible
- Puertos disponibles: 80, 3000, 4000, 5000-5003, 27017, 3306

## 🏗️ Arquitectura

La aplicación está compuesta por:

- **MongoDB**: Base de datos principal (con Replica Set para Prisma)
- **MySQL**: Base de datos para Enterprise Server
- **Booking Client**: API Express + Mongoose (puerto 4000)
- **Admin Server**: API Fastify + Prisma (puerto 3000)
- **Enterprise Gateway**: NestJS Gateway (puerto 5000)
  - Enterprise Service (puerto 5001)
  - Category Service (puerto 5002)
  - Product Service (puerto 5003)
- **Frontend**: Angular + Nginx (puerto 80)

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y edita los valores:

```bash
cp .env.example .env
```

**Importante**: Cambia los siguientes valores en `.env`:
- `JWT_SECRET` y `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY` y `STRIPE_PUBLISHABLE_KEY`
- Contraseñas de bases de datos para producción

### 2. Levantar Todos los Servicios

```bash
docker-compose up -d
```

Este comando:
- Descarga las imágenes necesarias
- Construye los contenedores de cada servicio
- Inicializa MongoDB con Replica Set
- Ejecuta migraciones de Prisma
- Inicia todos los servicios en orden

### 3. Ver Logs

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f frontend
docker-compose logs -f booking_client
docker-compose logs -f admin_server
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost
- **Booking API**: http://localhost:4000
- **Admin API**: http://localhost:3000
- **Enterprise Gateway**: http://localhost:5000

## 🛠️ Comandos Útiles

### Detener Servicios

```bash
docker-compose down
```

### Detener y Eliminar Volúmenes (⚠️ Borra las bases de datos)

```bash
docker-compose down -v
```

### Reconstruir Servicios

```bash
# Reconstruir todos
docker-compose up -d --build

# Reconstruir uno específico
docker-compose up -d --build frontend
```

### Ver Estado de Contenedores

```bash
docker-compose ps
```

### Ejecutar Comandos en Contenedores

```bash
# Shell en booking_client
docker-compose exec booking_client sh

# Shell en admin_server
docker-compose exec admin_server sh

# Prisma generate en admin_server
docker-compose exec admin_server npx prisma generate
```

## 🔧 Desarrollo

### Modo Desarrollo con Hot Reload

Para desarrollo local, es recomendable ejecutar los servicios individualmente:

```bash
# Terminal 1 - MongoDB
docker-compose up mongo mongo-init

# Terminal 2 - Booking Client
cd booking_client
npm run dev

# Terminal 3 - Admin Server
cd admin_server
npm run dev

# Terminal 4 - Frontend
cd frontend
npm start
```

### Acceder a las Bases de Datos

**MongoDB**:
```bash
docker-compose exec mongo mongosh -u admin -p admin123 --authenticationDatabase admin
```

**MySQL**:
```bash
docker-compose exec mysql mysql -u enterprise -penterprise123 enterprise_db
```

## 🐛 Solución de Problemas

### Error: Puerto ya en uso

```bash
# Ver qué está usando el puerto
netstat -ano | findstr :80
netstat -ano | findstr :3000

# En PowerShell, detener proceso
Stop-Process -Id <PID> -Force
```

### MongoDB no inicia correctamente

```bash
# Ver logs detallados
docker-compose logs mongo mongo-init

# Reiniciar solo MongoDB
docker-compose restart mongo mongo-init
```

### Error de Prisma Client

```bash
# Regenerar Prisma Client
docker-compose exec admin_server npx prisma generate
docker-compose restart admin_server
```

### Limpiar Todo y Empezar de Cero

```bash
# Detener todo
docker-compose down -v

# Limpiar imágenes huérfanas
docker image prune -f

# Limpiar contenedores detenidos
docker container prune -f

# Reconstruir y levantar
docker-compose up -d --build
```

## 📦 Estructura de Archivos Docker

```
Encore/
├── docker-compose.yml           # Orquestación de servicios
├── .env.example                 # Template de variables
├── .dockerignore               # Archivos ignorados
├── booking_client/
│   ├── Dockerfile
│   └── wait-for-it.sh
├── admin_server/
│   ├── Dockerfile
│   ├── wait-for-it.sh
│   └── prisma-start.sh
├── enterprise_server/
│   ├── Dockerfile.gateway
│   └── microservices/
│       ├── enterprise-service/
│       │   ├── Dockerfile
│       │   ├── wait-for-it.sh
│       │   └── prisma-start.sh
│       ├── category-service/
│       │   ├── Dockerfile
│       │   ├── wait-for-it.sh
│       │   └── prisma-start.sh
│       └── product-service/
│           ├── Dockerfile
│           ├── wait-for-it.sh
│           └── prisma-start.sh
└── frontend/
    ├── Dockerfile
    └── nginx.conf
```

## 🔒 Seguridad

**Antes de desplegar en producción**:

1. ✅ Cambia todas las contraseñas en `.env`
2. ✅ Usa secretos seguros para JWT
3. ✅ Configura CORS correctamente
4. ✅ Habilita HTTPS con certificados SSL
5. ✅ Restringe puertos expuestos
6. ✅ Configura firewall y security groups
7. ✅ Habilita logs de auditoría

## 📊 Monitoreo

Para producción, considera agregar:

- **Logs centralizados**: ELK Stack, Loki
- **Métricas**: Prometheus + Grafana
- **Health checks**: Configurar en docker-compose
- **Backup automático**: Volúmenes de datos

## 🤝 Contribuir

Si encuentras problemas o mejoras, abre un issue o PR.

## 📄 Licencia

[Tu licencia aquí]
