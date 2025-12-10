# 🚀 Quick Start - Encore con Docker

## ⚡ 5 minutos para ejecutar la aplicación completa

### Paso 1: Verificar Docker
```bash
docker --version
docker-compose --version
```

Si no tienes Docker instalado, descárgalo de: https://www.docker.com/products/docker-desktop

### Paso 2: Configurar Variables de Entorno

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

**Edita el archivo `.env` y cambia mínimo:**
- `JWT_SECRET` - Pon una clave segura
- `STRIPE_SECRET_KEY` - Tu clave de Stripe

### Paso 3: Levantar Todo

```bash
# Windows PowerShell
.\docker-manager.ps1 up

# O con Docker Compose directamente
docker-compose up -d
```

### Paso 4: Esperar a que todo inicie

```bash
# Ver el progreso
docker-compose logs -f
```

Espera a ver mensajes como:
- ✅ "MongoDB listo"
- ✅ "Prisma Client generado"
- ✅ "Servidor iniciado en puerto..."

### Paso 5: Acceder a la Aplicación

🌐 **Frontend**: http://localhost
📡 **Admin API**: http://localhost:3000
📡 **Booking API**: http://localhost:4000
📡 **Enterprise Gateway**: http://localhost:5000

---

## 🔥 Comandos Útiles

```bash
# Ver estado
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f booking_client
docker-compose logs -f admin_server
docker-compose logs -f frontend

# Detener todo
docker-compose down

# Detener y borrar datos (empezar limpio)
docker-compose down -v

# Reconstruir después de cambios en código
docker-compose up -d --build
```

---

## 🐛 Solución Rápida de Problemas

### Error: "Puerto ya en uso"
```bash
# Ver qué usa el puerto
netstat -ano | findstr :80
netstat -ano | findstr :3000

# Cambiar puerto en .env
FRONTEND_PORT=8080
```

### MongoDB no inicia
```bash
# Reiniciar solo MongoDB
docker-compose restart mongo mongo-init

# Ver logs detallados
docker-compose logs mongo
```

### Frontend no carga
```bash
# Verificar que construyó correctamente
docker-compose logs frontend

# Reconstruir frontend
docker-compose up -d --build frontend
```

### Prisma/Base de datos desactualizada
```bash
# Regenerar Prisma Client
docker-compose exec admin_server npx prisma generate

# Reiniciar servicio
docker-compose restart admin_server
```

---

## 🎯 Modo Desarrollo (Solo Bases de Datos)

Si quieres desarrollar localmente con hot-reload:

```bash
# Levantar solo MongoDB y MySQL
docker-compose -f docker-compose.dev.yml up -d

# Ahora ejecuta los servicios localmente:
cd booking_client && npm run dev
cd admin_server && npm run dev
cd frontend && npm start
```

---

## 📞 ¿Necesitas Ayuda?

1. Verifica que Docker Desktop está corriendo
2. Lee los logs: `docker-compose logs -f`
3. Verifica `.env` tiene todas las variables necesarias
4. Ejecuta: `.\verify-docker-setup.ps1` para diagnóstico completo

---

## 🎉 ¡Listo!

Tu aplicación Encore está corriendo en contenedores Docker.

**Siguiente paso:** Accede a http://localhost y explora la aplicación.
