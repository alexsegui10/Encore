import {
  getAllOrdersSchema,
  getOrderByIdSchema
} from './schema.js';

export default async function orderRoutes(fastify, opts) {
  const { prisma } = fastify;

  // GET /api/orders - Get all orders with pagination and filters
  fastify.get('/api/orders', {
    schema: getAllOrdersSchema
  }, async (request, reply) => {
    const {
      page = 1,
      limit = 20,
      status,
      userId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = request.query;

    try {
      const skip = (page - 1) * limit;
      const where = {};

      // Filter by status
      if (status && status !== 'all') {
        where.status = status;
      }

      // Filter by userId
      if (userId) {
        where.userId = userId;
      }

      // Search by UID, username, or email
      if (search) {
        where.OR = [
          { uid: { contains: search, mode: 'insensitive' } },
          { user: { username: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } }
        ];
      }

      // Get total count
      const total = await prisma.order.count({ where });

      // Get orders with relations
      const orders = await prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          items: {
            include: {
              event: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  date: true,
                  mainImage: true
                }
              },
              localProduct: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            }
          },
          payment: true
        }
      });

      return reply.send({
        orders,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      fastify.log.error('Error fetching orders:', error);
      return reply.code(500).send({ error: 'Failed to fetch orders' });
    }
  });

  // GET /api/orders/:id - Get order by ID
  fastify.get('/api/orders/:id', {
    schema: getOrderByIdSchema
  }, async (request, reply) => {
    const { id } = request.params;

    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          items: {
            include: {
              event: {
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  date: true,
                  mainImage: true
                }
              },
              localProduct: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              },
              tickets: true
            }
          },
          payment: true
        }
      });

      if (!order) {
        return reply.code(404).send({ error: 'Order not found' });
      }

      return reply.send(order);
    } catch (error) {
      fastify.log.error('Error fetching order:', error);
      return reply.code(500).send({ error: 'Failed to fetch order' });
    }
  });
}
