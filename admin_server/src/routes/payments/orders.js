// Fetch product from enterprise server (same pattern as fetchRandomMerchandising in events)
async function fetchProductFromEnterprise(productId) {
    try {
        const response = await fetch(`http://localhost:5000/product/${productId}`);

        if (!response.ok) {
            console.warn(`Failed to fetch product ${productId}: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        return data.product || null;
    } catch (error) {
        console.warn(`Error fetching product ${productId}:`, error.message);
        return null;
    }
}

/**
 * Public order routes for authenticated clients (not admin-only)
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {Object} opts 
 */
export default async function publicOrderRoutes(fastify, opts) {
    const { prisma } = fastify;

    /**
     * GET /api/orders/by-uid/:userUid
     * Get all orders for a user by UID (for authenticated clients via booking_client)
     */
    fastify.get('/api/orders/by-uid/:userUid', async (request, reply) => {
        const { userUid } = request.params;

        try {
            // First find the user by uid
            const user = await prisma.users.findUnique({
                where: { uid: userUid },
                select: { id: true }
            });

            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }

            const orders = await prisma.order.findMany({
                where: { userId: user.id },
                include: {
                    items: {
                        include: {
                            event: {
                                select: {
                                    id: true,
                                    slug: true,
                                    title: true,
                                    mainImage: true,
                                    location: true,
                                    date: true,
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

            // Enrich product items with data from enterprise server
            const enrichedOrders = await Promise.all(
                orders.map(async (order) => {
                    const enrichedItems = await Promise.all(
                        order.items.map(async (item) => {
                            // If it's a product item with productId (enterprise product), fetch data
                            if (item.itemType === 'product' && item.productId) {
                                const productData = await fetchProductFromEnterprise(item.productId);
                                return { ...item, productData };
                            }
                            return item;
                        })
                    );
                    return { ...order, items: enrichedItems };
                })
            );

            return reply.send({ orders: enrichedOrders });

        } catch (error) {
            fastify.log.error('Error fetching user orders:', error);
            return reply.code(500).send({ error: 'Failed to fetch orders' });
        }
    });
}
