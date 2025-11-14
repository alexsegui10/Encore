# 🏗️ Enterprise Microservices Platform<p align="center">

  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>

Sistema modular basado en microservicios con **API Gateway** como punto de entrada único.</p>



---[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

## 📊 Arquitectura

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

```    <p align="center">

                    ┌─────────────────────┐<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>

                    │   API GATEWAY       │<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

                    │   Puerto: 5000      │<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>

                    └─────────────────────┘<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>

                            │<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>

        ┌───────────────────┼───────────────────┐<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>

        │                   │                   │<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>

        ▼                   ▼                   ▼  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>

│  ENTERPRISE  │    │   PRODUCT    │    │   CATEGORY   │  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>

│  SERVICE     │    │   SERVICE    │    │   SERVICE    │</p>

│  Puerto:5001 │    │  Puerto:5002 │    │  Puerto:5003 │  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)

└──────────────┘    └──────────────┘    └──────────────┘  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

        │                   │                   │

        └───────────────────┴───────────────────┘## Description

                            │

                    ┌───────────────┐[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

                    │   MONGODB     │

                    │  localhost    │## Project setup

                    └───────────────┘

``````bash

$ npm install

---```



## 🚀 Inicio Rápido## Compile and run the project



### 1️⃣ Instalar dependencias```bash

# development

```bash$ npm run start

cd enterprise_server

npm run install:all# watch mode

```$ npm run start:dev



### 2️⃣ Generar Prisma Clients# production mode

$ npm run start:prod

```bash```

npm run prisma:generate:all

```## Run tests



### 3️⃣ Iniciar todos los servicios```bash

# unit tests

```bash$ npm run test

npm run start:all

```# e2e tests

$ npm run test:e2e

Verás:

```# test coverage

[gateway]     🚀 Gateway running on http://localhost:5000$ npm run test:cov

[enterprise]  🚀 Enterprise Service running on http://localhost:5001```

[product]     🚀 Product Service running on http://localhost:5002

[category]    🚀 Category Service running on http://localhost:5003## Deployment

```

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

---

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

## 📡 Cómo Funciona

```bash

### Gateway (Puerto 5000)$ npm install -g @nestjs/mau

El **Gateway** es el punto de entrada único. Todas las peticiones pasan por aquí y se redirigen automáticamente al microservicio correcto.$ mau deploy

```

**Ejemplo:**

- Haces: `POST http://localhost:5000/enterprise`With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

- Gateway redirige a: `http://localhost:5001/` (Enterprise Service)

## Resources

**Endpoints del Gateway:**

- `GET /` - Health checkCheck out a few resources that may come in handy when working with NestJS:

- `/enterprise/*` → Enterprise Service (5001)

- `/product/*` → Product Service (5002)- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.

- `/category/*` → Category Service (5003)- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).

- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).

---- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.

- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

## 📝 Uso con Postman- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).

- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).

Importa `Postman_Collection_Enterprise_Microservices.json` y prueba:- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).



### 1. Crear categoría## Support

```http

POST http://localhost:5000/categoryNest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

Content-Type: application/json

## Stay in touch

{

  "name": "Electrónica",- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)

  "description": "Productos electrónicos",- Website - [https://nestjs.com](https://nestjs.com/)

  "isActive": true- Twitter - [@nestframework](https://twitter.com/nestframework)

}

```## License



### 2. Crear productoNest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

```http
POST http://localhost:5000/product
Content-Type: application/json

{
  "name": "Laptop HP",
  "price": 1299.99,
  "stockTotal": 50,
  "categoryId": "PEGA_AQUI_EL_ID_DE_LA_CATEGORIA"
}
```

### 3. Listar productos
```http
GET http://localhost:5000/product
```

---

## 🗂️ Estructura

```
enterprise_server/
├── src/
│   ├── main.ts              # Gateway + Proxies
│   ├── app.module.ts        # Módulo raíz
│   └── app.controller.ts    # Health check
│
├── microservices/
│   ├── enterprise-service/  # Gestión de empresas
│   ├── product-service/     # Gestión de productos
│   └── category-service/    # Gestión de categorías
│
├── package.json             # Scripts
└── .env                     # Variables
```

---

## 🛠️ Scripts

| Script | Descripción |
|--------|-------------|
| `npm run start:all` | Iniciar todo (gateway + 3 servicios) |
| `npm run install:all` | Instalar dependencias en todos |
| `npm run prisma:generate:all` | Generar Prisma Clients |

---

## 🔍 Troubleshooting

**MongoDB no conecta:**
```bash
net start MongoDB
```

**Puerto ocupado:**
```powershell
Stop-Process -Id $(Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

**Prisma no generado:**
```bash
npm run prisma:generate:all
```

---

## 📚 Documentación

Cada servicio tiene Swagger:
- Gateway: http://localhost:5000/api
- Enterprise: http://localhost:5001/api  
- Product: http://localhost:5002/api
- Category: http://localhost:5003/api

---

## 💡 Para Programadores

### ¿Qué hace cada archivo?

**`src/main.ts`** - Arranca el gateway y configura los proxies
```typescript
// Ejemplo: Redirige /enterprise a localhost:5001
expressApp.use('/enterprise', createProxyMiddleware({
  target: 'http://localhost:5001',
  pathRewrite: { '^/enterprise': '' }
}));
```

**`src/app.controller.ts`** - Health check del gateway
```typescript
@Get()
getHealth() {
  return { status: 'ok', services: {...} };
}
```

**`microservices/*/src/main.ts`** - Arranca cada microservicio
**`microservices/*/src/*/*.controller.ts`** - Endpoints de cada servicio
**`microservices/*/src/*/*.service.ts`** - Lógica de negocio

### Agregar un endpoint nuevo

1. Ve al microservicio correspondiente
2. Edita el archivo `*.controller.ts`
3. Agrega tu endpoint con decoradores `@Get()`, `@Post()`, etc.
4. Implementa la lógica en `*.service.ts`

---

**Stack:** NestJS + Prisma + MongoDB + TypeScript
