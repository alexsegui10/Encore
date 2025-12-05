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


export default async function publicOrderRoutes(fastify, opts) {
    const { prisma } = fastify;

    fastify.get('/api/orders/by-uid/:userUid', async (request, reply) => {
        const { userUid } = request.params;

        try {
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

            const enrichedOrders = await Promise.all(
                orders.map(async (order) => {
                    const enrichedItems = await Promise.all(
                        order.items.map(async (item) => {
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
