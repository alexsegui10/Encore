import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

const prisma = new PrismaClient();

app.get('/usuarios', async () => {
  return prisma.usuario.findMany({ orderBy: { createdAt: 'desc' } });
});

app.post('/usuarios', async (req, reply) => {
  const { name, email } = req.body ?? {};
  if (!name || !email) return reply.code(400).send({ error: 'name y email obligatorios' });
  const created = await prisma.usuario.create({ data: { name, email } });
  reply.code(201).send(created);
});

app.put('/usuarios/:id', async (req, reply) => {
  const { id } = req.params;
  const { name, email } = req.body ?? {};
  try {
    const updated = await prisma.usuario.update({
      where: { id },
      data: { ...(name && { name }), ...(email && { email }) }
    });
    reply.send(updated);
  } catch {
    reply.code(404).send({ error: 'Usuario no encontrado' });
  }
});

app.delete('/usuarios/:id', async (req, reply) => {
  const { id } = req.params;
  try {
    await prisma.usuario.delete({ where: { id } });
    reply.code(204).send();
  } catch {
    reply.code(404).send({ error: 'Usuario no encontrado' });
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen({ port: PORT, host: '0.0.0.0' });
