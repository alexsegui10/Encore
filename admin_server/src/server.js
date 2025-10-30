import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const app = Fastify({ logger: true })
await app.register(cors, { origin: true })

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

function genUid(prefix = 'client') {
  const rnd = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}_${rnd}`
}

function normalizeUsername(s = '') {
  return String(s)
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const userCreateSchema = {
  type: 'object',
  required: ['username', 'email', 'password'],
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 40 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 4, maxLength: 200 },
    uidPrefix: { type: 'string' }
  }
}

const userUpdateSchema = {
  type: 'object',
  properties: {
    username: { type: 'string', minLength: 3, maxLength: 40 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 4, maxLength: 200 },
    bio: { type: 'string', maxLength: 5000 },
    image: { type: 'string' },
    isActive: { type: 'boolean' },
    status: { type: 'string', enum: ['active', 'blocked', 'pending'] }
  },
  additionalProperties: true
}

app.get('/usuarios', async (req, reply) => {
  const q = req.query?.q
  const where = q ? {
    OR: [
      { username: { contains: normalizeUsername(q), mode: 'insensitive' } },
      { email: { contains: String(q).toLowerCase(), mode: 'insensitive' } },
      { uid: { contains: String(q), mode: 'insensitive' } }
    ]
  } : undefined

  const users = await prisma.usuario.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, uid: true, username: true, email: true,
      bio: true, image: true, isActive: true, status: true,
      createdAt: true, updatedAt: true
    }
  })
  reply.send(users)
})

app.get('/usuarios/:username', async (req, reply) => {
  const username = normalizeUsername(req.params.username)
  const user = await prisma.usuario.findUnique({
    where: { username },
    select: {
      id: true, uid: true, username: true, email: true,
      bio: true, image: true, isActive: true, status: true,
      createdAt: true, updatedAt: true
    }
  })
  if (!user) return reply.code(404).send({ error: 'Usuario no encontrado' })
  reply.send(user)
})

app.post('/usuarios', { schema: { body: userCreateSchema } }, async (req, reply) => {
  const username = normalizeUsername(req.body.username)
  const email = String(req.body.email).toLowerCase()
  const password = req.body.password
  const uid = genUid(req.body.uidPrefix || 'client')

  try {
    const created = await prisma.usuario.create({
      data: {
        uid,
        username,
        email,
        password,
        favouriteEvents: [],
        followingUsers: []
      },
      select: { id: true, uid: true, username: true, email: true, createdAt: true }
    })
    reply.code(201).send(created)
  } catch (err) {
    const msg = String(err?.message || err)
    if (msg.includes('Unique') || msg.includes('unique')) {
      return reply.code(409).send({ error: 'uid, username o email ya existe' })
    }
    req.log.error(err)
    reply.code(500).send({ error: 'Error interno' })
  }
})

app.put('/usuarios/:username', { schema: { body: userUpdateSchema } }, async (req, reply) => {
  const currentUsername = normalizeUsername(req.params.username)
  const data = { ...(req.body ?? {}) }
  if (data.username) data.username = normalizeUsername(data.username)
  if (data.email) data.email = String(data.email).toLowerCase()

  try {
    const updated = await prisma.usuario.update({
      where: { username: currentUsername },
      data,
      select: {
        id: true, uid: true, username: true, email: true,
        bio: true, image: true, isActive: true, status: true, updatedAt: true
      }
    })
    reply.send(updated)
  } catch (err) {
    const msg = String(err?.message || err)
    if (msg.includes('Record to update not found')) {
      return reply.code(404).send({ error: 'Usuario no encontrado' })
    }
    if (msg.includes('Unique') || msg.includes('unique')) {
      return reply.code(409).send({ error: 'username o email ya existe' })
    }
    req.log.error(err)
    reply.code(500).send({ error: 'Error interno' })
  }
})

app.delete('/usuarios/:username', async (req, reply) => {
  const username = normalizeUsername(req.params.username)
  try {
    await prisma.usuario.delete({ where: { username } })
    reply.code(204).send()
  } catch (err) {
    const msg = String(err?.message || err)
    if (msg.includes('Record to delete does not exist')) {
      return reply.code(404).send({ error: 'Usuario no encontrado' })
    }
    req.log.error(err)
    reply.code(500).send({ error: 'Error interno' })
  }
})

const PORT = Number(process.env.PORT || 3000)
app.listen({ port: PORT, host: '0.0.0.0' })
  .then(() => console.log(`API Users http://localhost:${PORT}`))
  .catch(err => { console.error(err); process.exit(1) })
