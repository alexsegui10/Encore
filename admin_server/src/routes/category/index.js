import * as schema from './schema.js'

function generateSlug(text) {
  if (!text) return ''
  return String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default async function categoryRoutes(server) {
  if (!server.prisma) {
    throw new Error('Prisma plugin not loaded')
  }

  server.route({
    method: 'GET',
    url: '/categories',
    onRequest: [server.authenticate],
    schema: schema.list,
    handler: async (req, reply) => {
      try {
        const categories = await server.prisma.categories.findMany({
          orderBy: { createdAt: 'desc' }
        })

        return { categories }
      } catch (error) {
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })

  server.route({
    method: 'GET',
    url: '/categories/:slug',
    schema: schema.get,
    handler: async (req, reply) => {
      try {
        const { slug } = req.params

        const category = await server.prisma.categories.findUnique({
          where: { slug }
        })

        if (!category) {
          return reply.code(404).send({ message: 'Category not found' })
        }

        return { category }
      } catch (error) {
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })

  server.route({
    method: 'POST',
    url: '/categories',
    onRequest: [server.authenticate],
    schema: schema.create,
    handler: async (req, reply) => {
      try {
        const { name, description, image } = req.body.category

        if (!name) {
          return reply.code(400).send({ message: 'Name is required' })
        }

        if (name.length < 3) {
          return reply.code(400).send({ message: 'Name must be at least 3 characters' })
        }

        const slug = generateSlug(name)

        const existingCategory = await server.prisma.categories.findUnique({
          where: { slug }
        })

        if (existingCategory) {
          return reply.code(409).send({ message: 'Category with this name already exists' })
        }

        const category = await server.prisma.categories.create({
          data: {
            name,
            slug,
            description: description || null,
            image: image || null
          }
        })

        return reply.code(201).send({ category })
      } catch (error) {
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })

  server.route({
    method: 'PUT',
    url: '/categories/:slug',
    onRequest: [server.authenticate],
    schema: schema.update,
    handler: async (req, reply) => {
      try {
        const { slug } = req.params
        const input = req.body.category
        const updateData = {}

        if (input.name) {
          if (input.name.length < 3) {
            return reply.code(400).send({ message: 'Name must be at least 3 characters' })
          }
          updateData.name = input.name
          updateData.slug = generateSlug(input.name)
        }

        if (input.description !== undefined) {
          if (input.description && input.description.length > 500) {
            return reply.code(400).send({ message: 'Description must be less than 500 characters' })
          }
          updateData.description = input.description
        }

        if (input.image !== undefined) {
          updateData.image = input.image
        }

        if (input.isActive !== undefined) {
          updateData.isActive = input.isActive
        }

        if (input.status !== undefined) {
          if (!['active', 'hidden', 'archived'].includes(input.status)) {
            return reply.code(400).send({ message: 'Invalid status' })
          }
          updateData.status = input.status
        }

        if (Object.keys(updateData).length === 0) {
          return reply.code(400).send({ message: 'No fields to update' })
        }

        const category = await server.prisma.categories.update({
          where: { slug },
          data: updateData
        })

        return { category }
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.code(404).send({ message: 'Category not found' })
        }
        if (error.code === 'P2002') {
          return reply.code(409).send({ message: 'Category name already exists' })
        }
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })

  server.route({
    method: 'DELETE',
    url: '/categories/:slug',
    onRequest: [server.authenticate],
    schema: schema.remove,
    handler: async (req, reply) => {
      try {
        const { slug } = req.params

        await server.prisma.categories.delete({
          where: { slug }
        })

        return reply.code(204).send()
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.code(404).send({ message: 'Category not found' })
        }
        req.log.error(error)
        return reply.code(500).send({ message: 'Internal server error' })
      }
    }
  })
}
