import crypto from 'crypto';
import { webhookSchema } from './schema.js';

/**
 * Webhook route for handling Stripe events
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {Object} opts 
 */
export default async function webhookRoute(fastify, opts) {
    const { prisma, stripe } = fastify;

    /**
     * POST /webhook
     * Handles Stripe webhook events, particularly payment_intent.succeeded
     */
    fastify.post('/webhook', {
        schema: webhookSchema,
        config: {
            // Disable default JSON body parser to access raw body
            rawBody: true
        }
    }, async (request, reply) => {
        const sig = request.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            fastify.log.error('STRIPE_WEBHOOK_SECRET not configured');
            return reply.code(500).send({ error: 'Webhook secret not configured' });
        }

        let event;

        try {
            // Verify webhook signature
            const rawBody = request.rawBody || Buffer.from(JSON.stringify(request.body));
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (err) {
            fastify.log.error(`Webhook signature verification failed: ${err.message}`);
            return reply.code(400).send({ error: `Webhook Error: ${err.message}` });
        }

        fastify.log.info(`Received webhook event: ${event.type}`);

        // Handle the event
        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    await handlePaymentIntentSucceeded(fastify, event.data.object);
                    break;

                case 'payment_intent.payment_failed':
                    await handlePaymentIntentFailed(fastify, event.data.object);
                    break;

                default:
                    fastify.log.info(`Unhandled event type: ${event.type}`);
            }

            return reply.send({ received: true });
        } catch (error) {
            fastify.log.error('Error processing webhook:', error);
            return reply.code(500).send({ error: 'Webhook processing failed' });
        }
    });
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(fastify, paymentIntent) {
    const { prisma } = fastify;
    const transactionRef = paymentIntent.id;

    fastify.log.info(`Processing payment_intent.succeeded for ${transactionRef}`);

    try {
        // Check if payment was already processed (idempotency)
        const existingPayment = await prisma.payment.findUnique({
            where: { transactionRef },
            include: { order: true }
        });

        if (!existingPayment) {
            fastify.log.warn(`Payment not found for transactionRef: ${transactionRef}`);
            return;
        }

        if (existingPayment.status === 'completed') {
            fastify.log.info(`Payment ${transactionRef} already processed, skipping`);
            return; // Already processed, idempotent
        }

        // Update payment status to COMPLETED
        await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
                status: 'completed',
                paidAt: new Date(),
            }
        });

        // Get order with items
        const order = await prisma.order.findUnique({
            where: { id: existingPayment.orderId },
            include: {
                items: {
                    include: {
                        event: true,
                        product: true,
                    }
                },
                user: true,
            }
        });

        if (!order) {
            throw new Error(`Order not found for payment ${transactionRef}`);
        }

        // Process each order item
        for (const item of order.items) {
            // Deduct stock for products
            if (item.itemType === 'product' && item.productId) {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId }
                });

                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                // Check stock availability
                if (product.stockAvailable < item.quantity) {
                    // Mark order as FAILED due to insufficient stock
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { status: 'failed' }
                    });

                    await prisma.payment.update({
                        where: { id: existingPayment.id },
                        data: { status: 'failed' }
                    });

                    throw new Error(
                        `Insufficient stock for product ${product.name}. Available: ${product.stockAvailable}, Required: ${item.quantity}`
                    );
                }

                // Deduct stock
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stockAvailable: {
                            decrement: item.quantity
                        }
                    }
                });

                fastify.log.info(`Deducted ${item.quantity} stock from product ${product.name}`);
            }

            // Stock for events was already reserved during order creation (SAGA pattern)
            // No need to deduct here, but we log it for tracking
            if (item.itemType === 'event' && item.eventId) {
                fastify.log.info(`Event ${item.eventId} stock was reserved during order creation`);
            }

            // Generate tickets for this order item
            const tickets = [];
            for (let i = 0; i < item.quantity; i++) {
                const uniqueCode = `TICKET-${crypto.randomUUID().toUpperCase()}`;
                tickets.push({
                    uniqueCode,
                    status: 'valid',
                    orderItemId: item.id,
                    userId: order.userId,
                });
            }

            // Create all tickets
            await prisma.ticket.createMany({
                data: tickets
            });

            fastify.log.info(`Generated ${tickets.length} tickets for order item ${item.id}`);
        }

        // Update order status to PAID
        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'paid' }
        });

        fastify.log.info(`✅ Order ${order.uid} completed successfully`);

    } catch (error) {
        fastify.log.error(`Error processing payment_intent.succeeded: ${error.message}`);
        throw error;
    }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(fastify, paymentIntent) {
    const { prisma } = fastify;
    const transactionRef = paymentIntent.id;

    fastify.log.info(`Processing payment_intent.payment_failed for ${transactionRef}`);

    try {
        const payment = await prisma.payment.findUnique({
            where: { transactionRef },
            include: {
                order: {
                    include: {
                        items: true
                    }
                }
            }
        });

        if (!payment) {
            fastify.log.warn(`Payment not found for transactionRef: ${transactionRef}`);
            return;
        }

        // Update payment status to FAILED
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'failed' }
        });

        // Update order status to FAILED
        await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'failed' }
        });

        // SAGA COMPENSATION: Return reserved stock to inventory
        for (const item of payment.order.items) {
            if (item.itemType === 'event' && item.eventId) {
                const event = await prisma.events.findUnique({
                    where: { id: item.eventId }
                });

                // Return stock only if event has stock tracking
                if (event && event.stock !== null) {
                    await prisma.events.update({
                        where: { id: item.eventId },
                        data: {
                            stock: {
                                increment: item.quantity
                            }
                        }
                    });
                    fastify.log.info(`Returned ${item.quantity} tickets to event ${event.title} due to payment failure`);
                }
            }
        }

        fastify.log.info(`✅ Order marked as failed and stock returned for payment ${transactionRef}`);

    } catch (error) {
        fastify.log.error(`Error processing payment_intent.payment_failed: ${error.message}`);
        throw error;
    }
}
