import crypto from 'crypto';
import { createPaymentIntentSchema } from './schema.js';

export default async function paymentRoutes(fastify, opts) {
    const { prisma, stripe } = fastify;

    fastify.log.info(`Prisma available: ${Boolean(prisma)}`);
    fastify.log.info(`Stripe available: ${Boolean(stripe)}`);

    fastify.post('/api/create-payment-intent', {
        schema: createPaymentIntentSchema,
    }, async (request, reply) => {
        const { userUid, events = [], billingDetails } = request.body;

        // SAGA compensation tracking
        const compensationLog = {
            stockReserved: [],
            orderId: null,
            paymentId: null,
        };

        try {
            // Validate that we have events to purchase
            if (events.length === 0) {
                return reply.code(400).send({ error: 'No events to purchase' });
            }

            // Verify user exists by UID
            const user = await prisma.users.findUnique({
                where: { uid: userUid }
            });

            if (!user) {
                return reply.code(400).send({ error: 'User not found' });
            }

            // Validate events by slug
            const eventSlugs = events.map(item => item.eventSlug);
            const eventRecords = await prisma.events.findMany({
                where: { slug: { in: eventSlugs } }
            });

            if (eventRecords.length !== eventSlugs.length) {
                return reply.code(400).send({ error: 'One or more events not found' });
            }

            // Build event map for price lookup (by slug)
            const eventMap = {};
            eventRecords.forEach(event => {
                eventMap[event.slug] = event;
            });

            //IDEMPOTENCIA
            // Mismo usuario y mismo id = mismo UUID de orden
            const sortedItems = events
                .map(e => ({ eventSlug: e.eventSlug, quantity: e.quantity }))
                .sort((a, b) => a.eventSlug.localeCompare(b.eventSlug));
            const idempotencyKey = crypto
                .createHash('sha256')
                .update(`${userUid}-${JSON.stringify(sortedItems)}-${Date.now().toString().slice(0, -7)}`)
                .digest('hex')
                .substring(0, 32);
            const orderUid = `order-${idempotencyKey}`;

            // Check if order with this UID already exists (idempotency)
            const existingOrder = await prisma.order.findFirst({
                where: { uid: orderUid }
            });

            if (existingOrder) {
                fastify.log.info(`Order ${orderUid} already exists, returning existing payment intent`);
                const existingPayment = await prisma.payment.findFirst({
                    where: { orderId: existingOrder.id }
                });

                if (existingPayment && existingPayment.transactionRef) {
                    // Return existing PaymentIntent
                    const existingPaymentIntent = await stripe.paymentIntents.retrieve(
                        existingPayment.transactionRef
                    );

                    return reply.send({
                        clientSecret: existingPaymentIntent.client_secret,
                        orderId: existingOrder.id,
                        amount: existingPaymentIntent.amount,
                    });
                }
            }

            // SAGA STEP 1: Reserve stock and calculate total
            let totalAmount = 0;
            const items = [];

            for (const eventItem of events) {
                const event = eventMap[eventItem.eventSlug];

                // Check stock availability
                if (event.stock !== null && event.stock < eventItem.quantity) {
                    // Rollback any reserved stock
                    await rollbackStockReservation(prisma, compensationLog.stockReserved, fastify);
                    return reply.code(400).send({
                        error: `Insufficient stock for event "${event.title}". Available: ${event.stock}, Requested: ${eventItem.quantity}`
                    });
                }

                // Reserve stock (decrement)
                if (event.stock !== null) {
                    await prisma.events.update({
                        where: { id: event.id },
                        data: { stock: { decrement: eventItem.quantity } }
                    });
                    compensationLog.stockReserved.push({
                        eventId: event.id,
                        quantity: eventItem.quantity
                    });
                    fastify.log.info(`Reserved ${eventItem.quantity} tickets for event ${event.title}`);
                }

                const unitPrice = event.price || 0;
                totalAmount += unitPrice * eventItem.quantity;

                items.push({
                    eventId: event.id,
                    quantity: eventItem.quantity,
                    unitPrice
                });
            }

            // SAGA STEP 2: Create order with PENDING status
            const order = await prisma.order.create({
                data: {
                    uid: orderUid,
                    totalAmount,
                    currency: 'EUR',
                    status: 'pending',
                    userId: user.id, // Use the user.id from the query above
                    items: {
                        create: items.map(item => ({
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            itemType: 'event',
                            eventId: item.eventId,
                        }))
                    }
                },
                include: { items: true }
            });
            compensationLog.orderId = order.id;
            fastify.log.info(`Order created: ${order.uid}`);

            // SAGA STEP 3: Create Payment record
            const payment = await prisma.payment.create({
                data: {
                    amount: totalAmount,
                    method: 'stripe',
                    currency: 'EUR',
                    status: 'pending',
                    orderId: order.id,
                }
            });
            compensationLog.paymentId = payment.id;

            // SAGA STEP 4: Create Stripe PaymentIntent with idempotency
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Stripe expects cents
                currency: 'eur',
                metadata: {
                    orderId: order.id,
                    orderUid: order.uid,
                    userUid: user.uid,
                },
                description: `Order ${order.uid} - ${billingDetails?.name || user.username}`,
                receipt_email: billingDetails?.email || user.email,
            }, {
                idempotencyKey: orderUid, // Ensures idempotency in Stripe
            });

            // Update payment with Stripe PaymentIntent ID
            await prisma.payment.update({
                where: { id: payment.id },
                data: { transactionRef: paymentIntent.id }
            });

            fastify.log.info(`✅ SAGA completed: PaymentIntent ${paymentIntent.id} for order ${order.uid}`);

            return reply.send({
                clientSecret: paymentIntent.client_secret,
                orderId: order.id,
                amount: paymentIntent.amount,
            });

        } catch (error) {
            // SAGA COMPENSATION: Rollback all operations
            fastify.log.error('❌ SAGA failed, rolling back:', error);
            await rollbackTransaction(prisma, compensationLog, fastify);
            return reply.code(500).send({ error: error.message || 'Failed to create payment intent' });
        }
    });
}

/**
 * Rollback stock reservations (SAGA compensation)
 */
async function rollbackStockReservation(prisma, stockReserved, fastify) {
    for (const reservation of stockReserved) {
        try {
            await prisma.events.update({
                where: { id: reservation.eventId },
                data: { stock: { increment: reservation.quantity } }
            });
            fastify.log.info(`Rolled back ${reservation.quantity} tickets for event ${reservation.eventId}`);
        } catch (err) {
            fastify.log.error(`Failed to rollback stock for event ${reservation.eventId}:`, err);
        }
    }
}

/**
 * Complete SAGA rollback (compensation)
 */
async function rollbackTransaction(prisma, compensationLog, fastify) {
    // Rollback stock
    await rollbackStockReservation(prisma, compensationLog.stockReserved, fastify);

    // Cancel payment
    if (compensationLog.paymentId) {
        try {
            await prisma.payment.update({
                where: { id: compensationLog.paymentId },
                data: { status: 'cancelled' }
            });
            fastify.log.info(`Cancelled payment ${compensationLog.paymentId}`);
        } catch (err) {
            fastify.log.error('Failed to cancel payment:', err);
        }
    }

    // Cancel order
    if (compensationLog.orderId) {
        try {
            await prisma.order.update({
                where: { id: compensationLog.orderId },
                data: { status: 'cancelled' }
            });
            fastify.log.info(`Cancelled order ${compensationLog.orderId}`);
        } catch (err) {
            fastify.log.error('Failed to cancel order:', err);
        }
    }
}
