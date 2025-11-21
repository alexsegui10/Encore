import fp from 'fastify-plugin';

/**
 * Raw body plugin to capture the raw request body for Stripe webhook signature verification
 * This is required because Stripe needs the raw body to verify webhook signatures
 * @param {import('fastify').FastifyInstance} fastify 
 * @param {Object} opts 
 */
async function rawBodyPlugin(fastify, opts) {
    fastify.addContentTypeParser(
        'application/json',
        { parseAs: 'buffer' },
        async function (req, body) {
            // Store raw body for webhook verification
            req.rawBody = body;

            // Parse JSON for normal request handling
            try {
                return JSON.parse(body.toString('utf8'));
            } catch (err) {
                err.statusCode = 400;
                throw err;
            }
        }
    );
}

export default fp(rawBodyPlugin, {
    name: 'raw-body-plugin',
});
