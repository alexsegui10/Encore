import {
  getAllOrdersSchema,
  getOrderByIdSchema
} from './schema.js';

// Function to fetch product data from enterprise server
async function fetchProductFromEnterprise(productId) {
  try {
    const response = await fetch(`http://localhost:5000/product/${productId}`);

    if (!response.ok) {

      return null;
    }

    const data = await response.json();
    return data.product || null;
  } catch (error) {

    return null;
  }
}

// Function to enrich order items with product data from enterprise server
async function enrichOrderItems(items) {
  return Promise.all(
    items.map(async (item) => {
      // If it's a product without productData, try to fetch it
      if (item.itemType === 'product' && item.productId && !item.productData) {
        const productData = await fetchProductFromEnterprise(item.productId);
        if (productData) {
          return {
            ...item,
            productData: {
              id: productData.id,
              name: productData.name,
              image: productData.image || productData.images?.[0] || null,
              price: productData.price
            }
          };
        }
      }
      return item;
    })
  );
}

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
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              itemType: true,
              productId: true,
              productData: true,
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

      // Enrich orders with external product data
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          const enrichedItems = await enrichOrderItems(order.items);
          return { ...order, items: enrichedItems };
        })
      );

      return reply.send({
        orders: enrichedOrders,
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
            select: {
              id: true,
              quantity: true,
              unitPrice: true,
              itemType: true,
              productId: true,
              productData: true,
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

      // Enrich order items with external product data
      const enrichedItems = await enrichOrderItems(order.items);
      const enrichedOrder = { ...order, items: enrichedItems };

      return reply.send(enrichedOrder);
    } catch (error) {
      fastify.log.error('Error fetching order:', error);
      return reply.code(500).send({ error: 'Failed to fetch order' });
    }
  });
}
