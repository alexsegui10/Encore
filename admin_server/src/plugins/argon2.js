import fp from 'fastify-plugin'
import argon2 from 'argon2'

async function argon2Plugin(app) {
  app.decorate('hash', (plainText) => {
    if (!plainText) {
      throw new Error('Plain text is required for hashing')
    }
    return argon2.hash(plainText)
  })

  app.decorate('hashCompare', (plainText, hash) => {
    if (!plainText || !hash) {
      throw new Error('Both plain text and hash are required for comparison')
    }
    return argon2.verify(hash, plainText)
  })

  app.log.info('Argon2 plugin loaded successfully')
}

export default fp(argon2Plugin)
