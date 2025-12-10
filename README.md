# 🎫 Encore - Sistema de Gestión de Eventos

> Proyecto de aprendizaje desarrollado para practicar microservicios, integración de pagos y arquitecturas distribuidas.

## 📋 Descripción

Encore es una plataforma completa para gestión de eventos que incluye:
- Sistema de administración de eventos
- Pasarela de pagos con Stripe
- Gestión de merchandising empresarial
- Frontend de usuario con Angular

## 🏗️ Arquitectura

El proyecto está dividido en 4 servidores principales:

| Servidor | Puerto | Descripción |
|----------|--------|-------------|
| **Admin Server** | 3000 | API principal para gestión de eventos y pagos (Fastify + MongoDB) |
| **Booking Client** | 4000 | API de compras para clientes (Express) |
| **Enterprise Server** | 5000-5003 | Microservicios de merchandising (NestJS + MySQL) |
| **Frontend** | 4200 | Interfaz de usuario (Angular) |

## 🚀 Inicio Rápido

### Opción 1: Con Docker (Recomendado) 🐳

**Requisitos:**
- Docker Desktop instalado
- Al menos 4GB de RAM para Docker

**Instalación:**

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/alexsegui10/Encore.git
   cd Encore
   ```

2. **Configurar variables de entorno**
   ```bash
   # Copiar el archivo de ejemplo
   cp .env.example .env
   
   # PowerShell
   Copy-Item .env.example .env
   ```
   
   Editar `.env` con tus configuraciones (JWT secrets, Stripe keys, etc.)

3. **Iniciar con Docker Compose**
   ```bash
   # Construir e iniciar todos los servicios
   docker-compose up --build
   
   # O usar los scripts de ayuda
   .\start-all.ps1    # PowerShell
   .\start-all.bat    # Windows Batch
   ```

4. **Acceder a la aplicación**
   - Frontend: http://localhost:4200
   - Admin Server: http://localhost:3003
   - Booking Client: http://localhost:4000
   - Enterprise Server: http://localhost:3001

📖 **Ver documentación completa de Docker**: [DOCKER.md](./DOCKER.md)

### Opción 2: Instalación Local (Desarrollo)

**Requisitos:**
- Node.js (v18+)
- MongoDB
- Stripe CLI (opcional)
- Angular CLI

**Instalación:**

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/alexsegui10/Encore.git
   cd Encore
   ```

2. **Configurar variables de entorno**
   
   Crear archivos `.env` en cada servidor basándose en los ejemplos proporcionados.

3. **Instalar dependencias**
   ```bash
   # En cada directorio (admin_server, booking_client, enterprise_server, frontend)
   npm install
   ```

4. **Iniciar MongoDB**
   ```bash
   # Asegúrate de tener MongoDB corriendo localmente
   mongod
   ```

5. **Iniciar cada servidor manualmente**
   ```bash
   # Terminal 1 - Admin Server
   cd admin_server
   npm run dev
   
   # Terminal 2 - Booking Client
   cd booking_client
   npm run dev
   
   # Terminal 3 - Enterprise Server
   cd enterprise_server
   npm run start:all
   
   # Terminal 4 - Frontend
   cd frontend
   npm start
   ```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Admin Server**: Fastify, Prisma, MongoDB, Stripe
- **Booking Client**: Express.js
- **Enterprise Server**: NestJS, TypeORM, MySQL

### Frontend
- Angular 18
- Bootstrap 5
- RxJS

### Otros
- Stripe (Pagos)
- JWT (Autenticación)
- WebSockets (Tiempo real)

## 📦 Estructura del Proyecto

```
Encore/
├── admin_server/         # Servidor principal de administración (Fastify + Prisma)
├── booking_client/       # API de compras para clientes (Express + Mongoose)
├── enterprise_server/    # Microservicios de merchandising (NestJS + Prisma)
│   └── microservices/   # Enterprise, Product, Category services
├── frontend/             # Aplicación Angular
├── docker-compose.yml    # Configuración de Docker Compose
├── .env.example          # Variables de entorno de ejemplo
├── DOCKER.md             # Documentación completa de Docker
├── start-all.bat         # Script de inicio Windows (Docker)
└── start-all.ps1         # Script de inicio PowerShell (Docker)
```

## 🐳 Docker

El proyecto incluye configuración completa de Docker con:
- MongoDB con Replica Set
- 4 servicios backend
- Frontend con Nginx
- Scripts de inicialización automática

Ver [DOCKER.md](./DOCKER.md) para más detalles.

## 🧪 Pruebas de Pago

Para realizar pruebas de pago con Stripe, usa la siguiente tarjeta de prueba:

- **Número**: 4242 4242 4242 4242
- **Fecha**: Cualquier fecha futura
- **CVC**: Cualquier 3 dígitos

## 🎓 Aprendizajes Clave

Este proyecto me permitió aprender y practicar:
- Arquitectura de microservicios
- Integración de pasarelas de pago (Stripe)
- Gestión de webhooks
- Patrón SAGA para transacciones distribuidas
- Comunicación entre servidores
- Manejo de bases de datos relacionales (MySQL) y no relacionales (MongoDB)

## 📝 Notas

Este es un proyecto educativo creado con fines de aprendizaje. No está diseñado para uso en producción.

## 👤 Autores

**Alex Seguí**
- GitHub: [@alexsegui10](https://github.com/alexsegui10)

**Dani Sanz**
- GitHub: [@dasaga26](https://github.com/dasaga26)
