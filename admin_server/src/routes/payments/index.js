import crypto from 'crypto';
import { createPaymentIntentSchema } from './schema.js';

/**
 * Payment routes for handling Stripe payment intents
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {Object} opts 
 */
export default async function paymentRoutes(fastify, opts) {
    const { prisma, stripe } = fastify;

    /**
     * POST /api/create-payment-intent
     * Creates a new order and Stripe PaymentIntent
     */
    fastify.post('/api/create-payment-intent', {
        schema: createPaymentIntentSchema,
    }, async (request, reply) => {
        const { userId, currency = 'eur', items = [], products = [] } = request.body;

        try {
            // Validate that we have items to purchase
            if (items.length === 0 && products.length === 0) {
                return reply.code(400).send({ error: 'No items or products to purchase' });
            }

            // Verify user exists
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return reply.code(400).send({ error: 'User not found' });
            }

            // Validate events and check stock
            const eventIds = items.map(item => item.eventId);
            const events = await prisma.events.findMany({
                where: { id: { in: eventIds } }
            });

            if (events.length !== eventIds.length) {
                return reply.code(400).send({ error: 'One or more events not found' });
            }

            // Validate products and check stock
            const productIds = products.map(p => p.productId);
            let productRecords = [];
            if (productIds.length > 0) {
                productRecords = await prisma.product.findMany({
                    where: { id: { in: productIds } }
                });

                if (productRecords.length !== productIds.length) {
                    return reply.code(400).send({ error: 'One or more products not found' });
                }

                // Check product stock
                for (const productItem of products) {
                    const product = productRecords.find(p => p.id === productItem.productId);
                    if (product.stockAvailable < productItem.quantity) {
                        return reply.code(400).send({
                            error: `Insufficient stock for product ${product.name}. Available: ${product.stockAvailable}, Requested: ${productItem.quantity}`
                        });
                    }
                }
            }

            // Calculate total amount
            let totalAmount = 0;
            items.forEach(item => {
                totalAmount += item.unitPrice * item.quantity;
            });
            products.forEach(product => {
                totalAmount += product.unitPrice * product.quantity;
            });

            // Create unique order UID
            const orderUid = `order-${crypto.randomUUID()}`;

            // Create order with PENDING status
            const order = await prisma.order.create({
                data: {
                    uid: orderUid,
                    totalAmount,
                    currency: currency.toUpperCase(),
                    status: 'pending',
                    userId,
                    items: {
                        create: [
                            ...items.map(item => ({
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                itemType: 'event',
                                eventId: item.eventId,
                            })),
                            ...products.map(product => ({
                                quantity: product.quantity,
                                unitPrice: product.unitPrice,
                                itemType: 'product',
                                productId: product.productId,
                            }))
                        ]
                    }
                },
                include: {
                    items: true
                }
            });

            // Create Payment record with PENDING status
            // We'll update transactionRef after creating PaymentIntent
            const payment = await prisma.payment.create({
                data: {
                    amount: totalAmount,
                    method: 'stripe',
                    currency: currency.toUpperCase(),
                    status: 'pending',
                    orderId: order.id,
                }
            });

            // Create Stripe PaymentIntent
            // Use order UID as idempotency key to prevent duplicate charges
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Stripe expects amount in cents
                currency: currency.toLowerCase(),
                metadata: {
                    orderId: order.id,
                    orderUid: order.uid,
                    userId,
                },
                description: `Order ${order.uid}`,
            }, {
                idempotencyKey: orderUid, // Ensures idempotency
            });

            // Update payment with Stripe PaymentIntent ID
            await prisma.payment.update({
                where: { id: payment.id },
                data: { transactionRef: paymentIntent.id }
            });

            fastify.log.info(`PaymentIntent created for order ${order.uid}: ${paymentIntent.id}`);

            return reply.send({
                clientSecret: paymentIntent.client_secret,
                orderId: order.id,
                orderUid: order.uid,
                amount: totalAmount,
            });

        } catch (error) {
            fastify.log.error('Error creating payment intent:', error);
            return reply.code(500).send({ error: error.message || 'Failed to create payment intent' });
        }
    });
}
