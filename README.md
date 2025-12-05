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

### Requisitos Previos
- Node.js (v18+)
- MongoDB
- MySQL
- Stripe CLI
- Angular CLI

### Instalación

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

4. **Iniciar todos los servidores**
   ```bash
   # Windows
   .\start-all.bat
   
   # PowerShell
   .\start-all.ps1
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
├── admin_server/         # Servidor principal de administración
├── booking_client/       # API de compras para clientes
├── enterprise_server/    # Microservicios de merchandising
├── frontend/             # Aplicación Angular
├── start-all.bat         # Script de inicio Windows
└── start-all.ps1         # Script de inicio PowerShell
```

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
