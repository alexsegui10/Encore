import Stripe from 'stripe';
import fp from 'fastify-plugin';

/**
 * Stripe plugin to initialize and make Stripe available throughout the application
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {Object} opts 
 */
async function stripePlugin(fastify, opts) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
        throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-11-20.acacia', // Use latest stable API version
    });

    // Decorate fastify instance with stripe client
    fastify.decorate('stripe', stripe);

    fastify.log.info('Stripe plugin initialized successfully');
}

export default fp(stripePlugin, {
    name: 'stripe-plugin',
});
