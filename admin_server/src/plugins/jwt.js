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

  app.log.info('JWT plugin loaded successfully')
}

export default fp(jwtPlugin)
