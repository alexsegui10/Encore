import { createPaymentIntentSchema } from './schema.js';

/**
 * Order management routes
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {Object} opts 
 */
export default async function orderRoutes(fastify, opts) {
    const { prisma } = fastify;

    /**
     * GET /api/orders/:orderId
     * Get order details and status
     */
    fastify.get('/api/orders/:orderId', async (request, reply) => {
        const { orderId } = request.params;

        try {
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    items: {
                        include: {
                            event: true,
                            product: true,
                            tickets: true,
                        }
                    },
                    payment: true,
                    user: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        }
                    }
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

    /**
     * GET /api/orders/user/:userId
     * Get all orders for a user
     */
    fastify.get('/api/orders/user/:userId', async (request, reply) => {
        const { userId } = request.params;

        try {
            const orders = await prisma.order.findMany({
                where: { userId },
                include: {
                    items: {
                        include: {
                            event: {
                                select: {
                                    id: true,
                                    title: true,
                                    mainImage: true,
                                }
                            },
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    image: true,
                                }
                            },
                        }
                    },
                    payment: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return reply.send(orders);

        } catch (error) {
            fastify.log.error('Error fetching user orders:', error);
            return reply.code(500).send({ error: 'Failed to fetch orders' });
        }
    });
}
