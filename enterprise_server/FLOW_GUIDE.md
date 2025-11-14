# 🔄 Flujo de Ejecución - Enterprise Microservices

Este documento explica **paso a paso** cómo funciona el sistema desde que inicias los servicios hasta que se procesa una petición.

---

## 📋 Índice

1. [Estructura de Archivos](#estructura-de-archivos)
2. [Flujo de Inicio](#flujo-de-inicio)
3. [Flujo de una Petición](#flujo-de-una-petición)
4. [Componentes Clave](#componentes-clave)
5. [Diagrama de Secuencia](#diagrama-de-secuencia)

---

## 📂 Estructura de Archivos

```
enterprise_server/
├── src/                          # Código del GATEWAY
│   ├── main.ts                   # ⭐ Arranque + Configuración de proxies
│   ├── app.module.ts             # Módulo raíz (carga .env)
│   └── app.controller.ts         # Health check (GET /)
│
├── microservices/                # Código de MICROSERVICIOS
│   ├── enterprise-service/       # Gestión de empresas (5001)
│   │   └── src/
│   │       ├── main.ts          # Arranca el servicio en 5001
│   │       ├── app.module.ts    # Importa EnterpriseModule + Prisma
│   │       └── enterprise/
│   │           ├── enterprise.controller.ts  # Endpoints CRUD
│   │           ├── enterprise.service.ts     # Lógica de negocio
│   │           └── dto/         # Validación de datos
│   │
│   ├── product-service/          # Gestión de productos (5002)
│   └── category-service/         # Gestión de categorías (5003)
│
├── package.json                  # Scripts: start:all, install:all, etc.
├── .env                          # Variables: PORT, HOST, CORS
└── README.md                     # Documentación de uso
```

---

## 🚀 Flujo de Inicio

### Cuando ejecutas: `npm run start:all`

```
1. package.json ejecuta "concurrently"
   │
   ├─→ npm run start:gateway
   │   └─→ cd . && npm run start:dev
   │       └─→ nest start --watch
   │           └─→ Compila src/ con TypeScript
   │               └─→ Ejecuta src/main.ts
   │                   ├─→ Carga .env (via ConfigModule)
   │                   ├─→ Crea app NestJS
   │                   ├─→ Configura CORS
   │                   ├─→ Configura PROXIES ⭐
   │                   │   ├─→ /enterprise → 5001
   │                   │   ├─→ /product → 5002
   │                   │   └─→ /category → 5003
   │                   ├─→ Configura Swagger (/api)
   │                   └─→ Escucha en 0.0.0.0:5000
   │
   ├─→ npm run start:enterprise
   │   └─→ cd microservices/enterprise-service && npm run start:dev
   │       └─→ Carga microservices/enterprise-service/.env
   │           └─→ Ejecuta microservices/enterprise-service/src/main.ts
   │               ├─→ Conecta a MongoDB
   │               ├─→ Genera Prisma Client
   │               ├─→ Carga EnterpriseModule
   │               ├─→ Registra EnterpriseController
   │               ├─→ Configura Swagger
   │               └─→ Escucha en localhost:5001
   │
   ├─→ npm run start:product
   │   └─→ Similar a enterprise, escucha en 5002
   │
   └─→ npm run start:category
       └─→ Similar a enterprise, escucha en 5003
```

### Resultado:
```
✅ Gateway corriendo en http://localhost:5000
✅ Enterprise Service en http://localhost:5001
✅ Product Service en http://localhost:5002
✅ Category Service en http://localhost:5003
```

---

## 🔄 Flujo de una Petición

### Ejemplo: `POST http://localhost:5000/enterprise`

```
1. Cliente (Postman/Frontend)
   │
   │  POST http://localhost:5000/enterprise
   │  Body: { "name": "Mi Empresa", "uid": "empresa-001" }
   │
   ▼
2. Gateway (Puerto 5000) - main.ts
   │
   │  → Express recibe la petición
   │  → Middleware de proxy detecta: req.path === "/enterprise"
   │  → createProxyMiddleware() configurado para /enterprise
   │      target: 'http://localhost:5001'
   │      pathRewrite: { '^/enterprise': '' }
   │
   │  📝 Transformación:
   │     De: POST /enterprise
   │     A:  POST http://localhost:5001/
   │
   ▼
3. Enterprise Service (Puerto 5001)
   │
   │  → NestJS recibe POST /
   │  → Busca en EnterpriseController el método decorado con @Post()
   │  → Encuentra: create(@Body() createEnterpriseDto)
   │
   ▼
4. EnterpriseController.create()
   │
   │  → Valida el DTO con class-validator
   │  → Llama a: enterpriseService.create(createEnterpriseDto)
   │
   ▼
5. EnterpriseService.create()
   │
   │  → Verifica que el UID no exista: prisma.enterprise.findUnique()
   │  → Si existe, lanza ConflictException
   │  → Si no existe, crea: prisma.enterprise.create()
   │      ├─→ Prisma genera query MongoDB
   │      └─→ MongoDB inserta documento
   │
   ▼
6. MongoDB
   │
   │  → Guarda en colección "Enterprise"
   │  → Retorna documento creado con _id
   │
   ▼
7. Respuesta (de vuelta)
   │
   │  Enterprise Service → Gateway → Cliente
   │  
   │  Response: 201 Created
   │  Body: {
   │    "id": "673a1234567890abcdef1234",
   │    "name": "Mi Empresa",
   │    "uid": "empresa-001",
   │    "status": "active",
   │    "createdAt": "2025-11-13T20:00:00.000Z"
   │  }
```

---

## 🧩 Componentes Clave

### 1. **main.ts (Gateway)**
**Archivo:** `src/main.ts`  
**Función:** Punto de entrada del Gateway

```typescript
// Lo que hace:
1. Carga variables de entorno (.env)
2. Crea aplicación NestJS
3. Configura CORS
4. ⭐ CONFIGURA PROXIES con createProxyMiddleware():
   - /enterprise → http://localhost:5001
   - /product → http://localhost:5002
   - /category → http://localhost:5003
5. Configura Swagger en /api
6. Inicia servidor en puerto 5000
```

**Código clave:**
```typescript
expressApp.use('/enterprise', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: { '^/enterprise': '' }, // Elimina /enterprise del path
}));
```

---

### 2. **app.module.ts (Gateway)**
**Archivo:** `src/app.module.ts`  
**Función:** Módulo raíz del Gateway

```typescript
// Lo que hace:
1. Importa ConfigModule para cargar .env
2. Registra AppController (health check)
3. NO tiene lógica de negocio (solo configuración)
```

---

### 3. **app.controller.ts (Gateway)**
**Archivo:** `src/app.controller.ts`  
**Función:** Health check del Gateway

```typescript
// Lo que hace:
1. Expone GET / para verificar que el gateway funciona
2. Retorna JSON con:
   - Status del gateway
   - URLs de microservicios
   - Timestamp actual
```

---

### 4. **main.ts (Microservicios)**
**Archivo:** `microservices/*/src/main.ts`  
**Función:** Punto de entrada de cada microservicio

```typescript
// Lo que hace cada microservicio:
1. Carga .env del microservicio
2. Crea aplicación NestJS
3. Conecta a MongoDB via Prisma
4. Registra módulos (Enterprise, Product, Category)
5. Configura Swagger
6. Inicia servidor en su puerto (5001, 5002, 5003)
```

---

### 5. ***.controller.ts (Microservicios)**
**Ejemplo:** `microservices/enterprise-service/src/enterprise/enterprise.controller.ts`  
**Función:** Define endpoints HTTP

```typescript
// Lo que hace:
1. Define rutas con decoradores:
   @Post()    → POST /
   @Get()     → GET /
   @Get(':id') → GET /:id
   @Put(':id') → PUT /:id
   @Delete(':id') → DELETE /:id

2. Recibe peticiones HTTP
3. Valida datos con DTOs
4. Llama al service correspondiente
5. Retorna respuesta
```

---

### 6. ***.service.ts (Microservicios)**
**Ejemplo:** `microservices/enterprise-service/src/enterprise/enterprise.service.ts`  
**Función:** Lógica de negocio

```typescript
// Lo que hace:
1. Contiene la lógica de negocio
2. Interactúa con Prisma para acceder a MongoDB
3. Valida reglas de negocio:
   - UID único
   - No eliminar si tiene relaciones
   - Actualizar timestamps
4. Lanza excepciones cuando algo falla
```

---

### 7. **prisma.service.ts (Microservicios)**
**Archivo:** `microservices/*/src/prisma/prisma.service.ts`  
**Función:** Conexión a MongoDB

```typescript
// Lo que hace:
1. Extiende PrismaClient
2. Conecta a MongoDB al iniciar
3. Desconecta al cerrar la app
4. Proporciona acceso a las colecciones:
   prisma.enterprise.create()
   prisma.product.findMany()
   prisma.productCategory.update()
```

---

## 📊 Diagrama de Secuencia Completo

```
Cliente          Gateway         Enterprise Service    MongoDB
  │                 │                     │               │
  │  POST /enterprise                    │               │
  ├────────────────>│                     │               │
  │                 │                     │               │
  │                 │  Proxy: POST /      │               │
  │                 ├────────────────────>│               │
  │                 │                     │               │
  │                 │                     │  findUnique   │
  │                 │                     ├──────────────>│
  │                 │                     │               │
  │                 │                     │  null (no existe)
  │                 │                     │<──────────────┤
  │                 │                     │               │
  │                 │                     │  create()     │
  │                 │                     ├──────────────>│
  │                 │                     │               │
  │                 │                     │  documento    │
  │                 │                     │<──────────────┤
  │                 │                     │               │
  │                 │  201 + JSON         │               │
  │                 │<────────────────────┤               │
  │                 │                     │               │
  │  201 + JSON     │                     │               │
  │<────────────────┤                     │               │
  │                 │                     │               │
```

---

## 🎯 Conceptos Importantes

### ¿Qué es un Proxy?
**Definición:** Un proxy redirige peticiones de un servidor a otro.

**En este sistema:**
- El Gateway actúa como proxy
- Cliente hace petición al Gateway (5000)
- Gateway redirige a microservicio (5001, 5002, 5003)
- Cliente no sabe que hay microservicios detrás

**Ventajas:**
- ✅ Un solo punto de entrada
- ✅ Cliente no necesita conocer puertos de microservicios
- ✅ Fácil agregar autenticación en el Gateway
- ✅ Fácil cambiar la IP de un microservicio

---

### ¿Qué es pathRewrite?
**Definición:** Transforma la URL antes de redirigirla.

**Ejemplo:**
```javascript
pathRewrite: { '^/enterprise': '' }
```

**Transformación:**
```
Cliente hace:     POST http://localhost:5000/enterprise/uid/empresa-001
Gateway recibe:   POST /enterprise/uid/empresa-001
pathRewrite:      Elimina '/enterprise'
Servicio recibe:  POST http://localhost:5001/uid/empresa-001
                                               ↑ Sin /enterprise
```

**Sin pathRewrite:**
```
Servicio recibiría: POST /enterprise/uid/empresa-001
                         ↑ Con /enterprise (ERROR: ruta no existe)
```

---

### ¿Qué es Prisma?
**Definición:** ORM (Object-Relational Mapping) para bases de datos.

**Lo que hace:**
```typescript
// En lugar de escribir MongoDB queries:
db.collection('Enterprise').insertOne({ name: 'Mi Empresa' })

// Escribes TypeScript tipado:
prisma.enterprise.create({ data: { name: 'Mi Empresa' } })
```

**Ventajas:**
- ✅ Tipado automático (autocomplete en VSCode)
- ✅ Validación en tiempo de compilación
- ✅ Migraciones de base de datos
- ✅ Soporta múltiples bases de datos

---

### ¿Qué es un DTO?
**Definición:** Data Transfer Object - Objeto para transferir datos.

**Propósito:** Validar y tipar datos que entran/salen de la API.

**Ejemplo:**
```typescript
// create-enterprise.dto.ts
export class CreateEnterpriseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

// Si el cliente envía:
{ "name": 123 }  // ❌ ERROR: name debe ser string
{ }              // ❌ ERROR: name es requerido
{ "name": "OK" } // ✅ VÁLIDO
```

---

### ¿Qué es NestJS Module?
**Definición:** Contenedor de componentes relacionados.

**Estructura:**
```typescript
@Module({
  imports: [],      // Otros módulos que necesito
  controllers: [],  // Mis endpoints HTTP
  providers: [],    // Mis servicios (lógica)
  exports: [],      // Qué expongo a otros módulos
})
```

**En este proyecto:**
```
AppModule (Gateway)
├── ConfigModule (variables .env)
└── AppController (health check)

AppModule (Enterprise Service)
├── ConfigModule
├── PrismaModule
└── EnterpriseModule
    ├── EnterpriseController (endpoints)
    └── EnterpriseService (lógica)
```

---

## 🔧 Troubleshooting por Componente

### Gateway no inicia
**Problema:** `Error: listen EADDRINUSE 0.0.0.0:5000`  
**Causa:** Puerto 5000 ya está en uso  
**Solución:**
```powershell
Stop-Process -Id $(Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

---

### Proxy no redirige
**Problema:** `Cannot GET /enterprise`  
**Causa:** Proxy no está configurado o microservicio no está corriendo  
**Solución:**
1. Verifica que el microservicio esté corriendo: `curl http://localhost:5001`
2. Revisa `main.ts` que el proxy esté configurado
3. Reinicia el gateway

---

### Microservicio no conecta a MongoDB
**Problema:** `Error: Can't reach database server`  
**Causa:** MongoDB no está corriendo  
**Solución:**
```bash
net start MongoDB
```

---

### Prisma no encuentra modelos
**Problema:** `Property 'enterprise' does not exist on type 'PrismaClient'`  
**Causa:** Prisma Client no está generado  
**Solución:**
```bash
npm run prisma:generate:all
```

---

## 📚 Recursos Adicionales

- **NestJS Docs:** https://docs.nestjs.com
- **Prisma Docs:** https://www.prisma.io/docs
- **http-proxy-middleware:** https://github.com/chimurai/http-proxy-middleware

---

**¿Más dudas?** Revisa el código con los comentarios que agregué en cada archivo.
