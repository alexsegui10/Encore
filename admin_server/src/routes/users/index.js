import * as schema from './schema.js'

function normalizeUsername(text) {
  if (!text) return ''
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function generateUid(prefix = 'client') {
  const randomNum = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}_${randomNum}`
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default async function usersRoutes(server) {
  if (!server.prisma) {
    throw new Error('Prisma plugin not loaded')
  }

  server.route({
    method: 'POST',
    url: '/users/login',
    schema: schema.login,
    handler: async (req, reply) => {
      try {
        const { email, password } = req.body.user

        if (!email || !password) {
          return reply.code(400).send({ message: 'Email and password are required' })
        }

        if (!validateEmail(email)) {
          return reply.code(400).send({ message: 'Invalid email format' })
        }

        const normalizedEmail = String(email).toLowerCase().trim()
        const user = await server.prisma.usuario.findUnique({ 
          where: { email: normalizedEmail } 
        })

        if (!user) {
          return reply.code(401).send({ message: 'Invalid credentials' })
        }

        const isPasswordValid = await server.hashCompare(password, user.password)
        if (!isPasswordValid) {
          return reply.code(401).send({ message: 'Invalid credentials' })
        }

        const token = await reply.jwtSign({ 
          id: user.id, 
          username: user.username, 
          uid: user.uid 
        })

        return { 
          user: { 
            email: user.email, 
            token, 
            username: user.username, 
            bio: user.bio, 
            image: user.image || '' 
          } 
        }
      } catch (error) {
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })

  server.route({
    method: 'POST',
    url: '/users',
    schema: schema.register,
    handler: async (req, reply) => {
      try {
        const { username, email, password } = req.body.user

        if (!username || !email || !password) {
          return reply.code(400).send({ message: 'Username, email and password are required' })
        }

        if (!validateEmail(email)) {
          return reply.code(400).send({ message: 'Invalid email format' })
        }

        if (password.length < 6) {
          return reply.code(400).send({ message: 'Password must be at least 6 characters' })
        }

        if (username.length < 3) {
          return reply.code(400).send({ message: 'Username must be at least 3 characters' })
        }

        const normalizedUsername = normalizeUsername(username)
        const normalizedEmail = String(email).toLowerCase().trim()

        const [existingUser, existingEmail] = await Promise.all([
          server.prisma.usuario.findUnique({ where: { username: normalizedUsername } }),
          server.prisma.usuario.findUnique({ where: { email: normalizedEmail } })
        ])

        if (existingUser) {
          return reply.code(409).send({ message: 'Username already exists' })
        }

        if (existingEmail) {
          return reply.code(409).send({ message: 'Email already exists' })
        }

        const hashedPassword = await server.hash(password)
        const created = await server.prisma.usuario.create({
          data: {
            uid: generateUid('client'),
            slug: normalizedUsername,
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            favouriteEvents: [],
            followingUsers: []
          }
        })

        const token = await reply.jwtSign({ 
          id: created.id, 
          username: created.username, 
          uid: created.uid 
        })

        return { 
          user: { 
            email: created.email, 
            token, 
            username: created.username, 
            bio: created.bio, 
            image: created.image || '' 
          } 
        }
      } catch (error) {
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })

  server.route({
    method: 'GET',
    url: '/user',
    onRequest: [server.authenticate],
    schema: schema.get,
    handler: async (req, reply) => {
      try {
        const user = await server.prisma.usuario.findUnique({ 
          where: { id: req.user.id } 
        })

        if (!user) {
          return reply.code(404).send({ message: 'User not found' })
        }

        const token = await server.jwt.lookupToken(req)

        return { 
          user: { 
            email: user.email, 
            token, 
            username: user.username, 
            bio: user.bio, 
            image: user.image || '' 
          } 
        }
      } catch (error) {
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })

  server.route({
    method: 'PUT',
    url: '/user',
    onRequest: [server.authenticate],
    schema: schema.update,
    handler: async (req, reply) => {
      try {
        const userId = req.user.id
        const input = req.body.user
        const updateData = {}

        if (input.email) {
          if (!validateEmail(input.email)) {
            return reply.code(400).send({ message: 'Invalid email format' })
          }
          updateData.email = String(input.email).toLowerCase().trim()
        }

        if (input.username) {
          if (input.username.length < 3) {
            return reply.code(400).send({ message: 'Username must be at least 3 characters' })
          }
          const normalized = normalizeUsername(input.username)
          updateData.username = normalized
          updateData.slug = normalized
        }

        if (input.bio !== undefined) {
          if (input.bio.length > 500) {
            return reply.code(400).send({ message: 'Bio must be less than 500 characters' })
          }
          updateData.bio = input.bio
        }

        if (input.image !== undefined) {
          updateData.image = input.image
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

        const updatedUser = await server.prisma.usuario.update({ 
          where: { id: userId }, 
          data: updateData 
        })

        const token = await reply.jwtSign({ 
          id: updatedUser.id, 
          username: updatedUser.username, 
          uid: updatedUser.uid 
        })

        return { 
          user: { 
            email: updatedUser.email, 
            token, 
            username: updatedUser.username, 
            bio: updatedUser.bio, 
            image: updatedUser.image || '' 
          } 
        }
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.code(404).send({ message: 'User not found' })
        }
        if (error.code === 'P2002') {
          return reply.code(409).send({ message: 'Username or email already exists' })
        }
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })
}
