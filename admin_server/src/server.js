import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import prismaPlugin from './plugins/prisma.js'
import bcryptPlugin from './plugins/bcrypt.js'
import jwtPlugin from './plugins/jwt.js'
import authRoutes from './routes/auth/index.js'
import usersRoutes from './routes/users/index.js'
import categoriesRoutes from './routes/category/index.js'
import eventsRoutes from './routes/events/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = Fastify({ 
  logger: {
    level: process.env.LOG_LEVEL || 'info'
  }
})

await app.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
})

await app.register(swagger, {
  openapi: { 
    info: { 
      title: 'Encore Admin API', 
      version: '1.0.0',
      description: 'Admin API for Encore platform'
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 3000}`, description: 'Development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  }
})

await app.register(swaggerUI, { 
  routePrefix: '/docs', 
  staticCSP: true,
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  }
})

await app.register(prismaPlugin)
await app.register(bcryptPlugin)
await app.register(jwtPlugin)
await app.register(authRoutes, { prefix: '/api' })
await app.register(usersRoutes, { prefix: '/api' })
await app.register(categoriesRoutes, { prefix: '/api' })
await app.register(eventsRoutes, { prefix: '/api' })

app.setErrorHandler((error, req, reply) => {
  req.log.error(error)

  if (error.validation) {
    return reply.code(400).send({
      message: 'Validation error',
      errors: error.validation
    })
  }

  if (error.statusCode) {
    return reply.code(error.statusCode).send({
      message: error.message
    })
  }

  return reply.code(500).send({
    message: 'Internal server error'
  })
})

app.setNotFoundHandler((req, reply) => {
  reply.code(404).send({
    message: 'Route not found',
    path: req.url
  })
})

app.addHook('onRequest', async (req, reply) => {
  if (req.headers['content-type'] === 'application/json' && 
      req.headers['content-length'] === '0') {
    req.headers['content-type'] = 'empty'
  }
})

app.addContentTypeParser('empty', (request, body, done) => {
  done(null, {})
})

const PORT = Number(process.env.PORT || 3000)
const HOST = process.env.HOST || '0.0.0.0'

app.listen({ port: PORT, host: HOST })
  .then(() => {
    app.log.info(`Server running at http://localhost:${PORT}`)
    app.log.info(`Documentation at http://localhost:${PORT}/docs`)
  })
  .catch(error => {
    app.log.error(error)
    process.exit(1)
  })
