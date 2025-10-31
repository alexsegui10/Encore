import fp from 'fastify-plugin'
import bcrypt from 'bcrypt'

async function bcryptPlugin(app) {
  const rounds = Number(process.env.BCRYPT_ROUNDS || 10)

  if (rounds < 10 || rounds > 15) {
    throw new Error('BCRYPT_ROUNDS must be between 10 and 15')
  }

  app.decorate('hash', (plainText) => {
    if (!plainText) {
      throw new Error('Plain text is required for hashing')
    }
    return bcrypt.hash(plainText, rounds)
  })

  app.decorate('hashCompare', (plainText, hash) => {
    if (!plainText || !hash) {
      throw new Error('Both plain text and hash are required for comparison')
    }
    return bcrypt.compare(plainText, hash)
  })

  app.log.info(`Bcrypt plugin loaded with ${rounds} rounds`)
}

export default fp(bcryptPlugin)
