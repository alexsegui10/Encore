import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

async function prismaPlugin(app) {
  const prisma = new PrismaClient({
    datasources: { 
      db: { url: process.env.DATABASE_URL } 
    },
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error']
  })

  try {
    await prisma.$connect()
    app.log.info('Database connected successfully')
  } catch (error) {
    app.log.error('Failed to connect to database:', error)
    throw error
  }

  app.decorate('prisma', prisma)

  app.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect()
    app.log.info('Database connection closed')
  })
}

export default fp(prismaPlugin)
