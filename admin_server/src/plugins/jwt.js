import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'

async function jwtPlugin(app) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }

  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }

  await app.register(jwt, {
    secret,
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'encore-admin'
    }
  })

  app.decorate('authenticate', async function(req, reply) {
    try {
      const authHeader = req.headers.authorization

      if (!authHeader) {
        return reply.code(401).send({ 
          message: 'Missing authorization header' 
        })
      }

      const token = authHeader.startsWith('Token ')
        ? authHeader.slice(6)
        : authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader

      if (!token) {
        return reply.code(401).send({ 
          message: 'Invalid authorization format' 
        })
      }

      await req.jwtVerify({ token })
    } catch (error) {
      return reply.code(401).send({ 
        message: 'Invalid or expired token' 
      })
    }
  })

  app.log.info('JWT plugin loaded successfully')
}

export default fp(jwtPlugin)
