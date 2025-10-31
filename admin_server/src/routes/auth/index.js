import * as schema from './schema.js'

function generateUid(prefix = 'adm') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 7)
  return `${prefix}_${timestamp}${random}`
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export default async function authRoutes(server) {
  if (!server.prisma) {
    throw new Error('Prisma plugin not loaded')
  }

  server.route({
    method: 'POST',
    url: '/auth/login',
    schema: schema.login,
    handler: async (req, reply) => {
      try {
        const { email, password } = req.body.admin

        if (!email || !password) {
          return reply.code(400).send({ message: 'Email and password are required' })
        }

        if (!validateEmail(email)) {
          return reply.code(400).send({ message: 'Invalid email format' })
        }

        const admin = await server.prisma.admin.findUnique({
          where: { email: email.toLowerCase() }
        })

        if (!admin) {
          return reply.code(401).send({ message: 'Invalid credentials' })
        }

        if (!admin.isActive) {
          return reply.code(401).send({ message: 'Account is deactivated' })
        }

        const isValidPassword = await server.hashCompare(password, admin.password)

        if (!isValidPassword) {
          return reply.code(401).send({ message: 'Invalid credentials' })
        }

        const token = server.jwt.sign({ 
          id: admin.id,
          uid: admin.uid
        })

        const { password: _, ...adminData } = admin

        return { admin: adminData, token }
      } catch (error) {
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })

  server.route({
    method: 'GET',
    url: '/auth/me',
    onRequest: [server.authenticate],
    schema: schema.getMe,
    handler: async (req, reply) => {
      try {
        console.log('🔍 GET /auth/me - req.user:', req.user);
        
        const admin = await server.prisma.admin.findUnique({
          where: { id: req.user.id }
        })

        console.log('🔍 Admin encontrado:', admin ? 'SÍ' : 'NO');

        if (!admin) {
          return reply.code(404).send({ message: 'Admin not found' })
        }

        const { password: _, ...adminData } = admin

        return { admin: adminData }
      } catch (error) {
        console.error('❌ Error en /auth/me:', error);
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })

  server.route({
    method: 'PUT',
    url: '/auth/me',
    onRequest: [server.authenticate],
    schema: schema.updateMe,
    handler: async (req, reply) => {
      try {
        const input = req.body.admin
        const updateData = {}

        if (input.username) {
          if (input.username.length < 3) {
            return reply.code(400).send({ message: 'Username must be at least 3 characters' })
          }

          const existing = await server.prisma.admin.findUnique({
            where: { username: input.username.toLowerCase() }
          })

          if (existing && existing.id !== req.user.id) {
            return reply.code(409).send({ message: 'Username already taken' })
          }

          updateData.username = input.username.toLowerCase()
        }

        if (input.email) {
          if (!validateEmail(input.email)) {
            return reply.code(400).send({ message: 'Invalid email format' })
          }

          const existing = await server.prisma.admin.findUnique({
            where: { email: input.email.toLowerCase() }
          })

          if (existing && existing.id !== req.user.id) {
            return reply.code(409).send({ message: 'Email already registered' })
          }

          updateData.email = input.email.toLowerCase()
        }

        if (input.password) {
          if (input.password.length < 6) {
            return reply.code(400).send({ message: 'Password must be at least 6 characters' })
          }
          updateData.password = await server.hash(input.password)
        }

        if (Object.keys(updateData).length === 0) {
          return reply.code(400).send({ message: 'No fields to update' })
        }

        const admin = await server.prisma.admin.update({
          where: { id: req.user.id },
          data: updateData
        })

        const { password: _, ...adminData } = admin

        return { admin: adminData }
      } catch (error) {
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })
}
