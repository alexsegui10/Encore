import crypto from 'crypto';
import { webhookSchema } from './schema.js';

export default async function webhookRoute(fastify, opts) {
    const { prisma, stripe } = fastify;

    fastify.post('/webhook', {
        schema: webhookSchema,
        config: {
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
            const rawBody = request.rawBody || Buffer.from(JSON.stringify(request.body));
            event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
        } catch (err) {
            fastify.log.error(`Webhook signature verification failed: ${err.message}`);
            return reply.code(400).send({ error: `Webhook Error: ${err.message}` });
        }

        fastify.log.info(`Received webhook event: ${event.type}`);

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

async function handlePaymentIntentSucceeded(fastify, paymentIntent) {
    const { prisma } = fastify;
    const transactionRef = paymentIntent.id;

    fastify.log.info(`Processing payment_intent.succeeded for ${transactionRef}`);

    try {
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
            return;
        }

        await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
                status: 'completed',
                paidAt: new Date(),
            }
        });

        const order = await prisma.order.findUnique({
            where: { id: existingPayment.orderId },
            include: {
                items: {
                    include: {
                        event: true,
                        localProduct: true,
                    }
                },
                user: true,
            }
        });

        if (!order) {
            throw new Error(`Order not found for payment ${transactionRef}`);
        }

        for (const item of order.items) {
            if (item.itemType === 'product') {
                if (item.localProductId) {
                    const product = await prisma.product.findUnique({
                        where: { id: item.localProductId }
                    });

                    if (!product) {
                        throw new Error(`Local product ${item.localProductId} not found`);
                    }

                    if (product.stockAvailable < item.quantity) {
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

                    await prisma.product.update({
                        where: { id: item.localProductId },
                        data: {
                            stockAvailable: {
                                decrement: item.quantity
                            }
                        }
                    });

                    fastify.log.info(`Deducted ${item.quantity} stock from local product ${product.name}`);
                } else if (item.productId) {
                    fastify.log.info(`External enterprise product ${item.productId} - stock managed by enterprise_server`);
                }
            }

            if (item.itemType === 'event' && item.eventId) {
                fastify.log.info(`Event ${item.eventId} stock was reserved during order creation`);

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

                await prisma.ticket.createMany({
                    data: tickets
                });

                fastify.log.info(`Generated ${tickets.length} tickets for event ${item.id}`);
            }
        }

        await prisma.order.update({
            where: { id: order.id },
            data: { status: 'paid' }
        });

        fastify.log.info(`Order ${order.uid} completed successfully`);

    } catch (error) {
        fastify.log.error(`Error processing payment_intent.succeeded: ${error.message}`);
        throw error;
    }
}

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

        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'failed' }
        });

        await prisma.order.update({
            where: { id: payment.orderId },
            data: { status: 'failed' }
        });

        for (const item of payment.order.items) {
            if (item.itemType === 'event' && item.eventId) {
                const event = await prisma.events.findUnique({
                    where: { id: item.eventId }
                });

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

        fastify.log.info(`Order marked as failed and stock returned for payment ${transactionRef}`);

    } catch (error) {
        fastify.log.error(`Error processing payment_intent.payment_failed: ${error.message}`);
        throw error;
    }
}
