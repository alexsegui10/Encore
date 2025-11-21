import asyncHandler from 'express-async-handler';

/**
 * Payment controller - handles payment requests and proxies to admin server
 */

/**
 * POST /api/payments/create-intent
 * Creates a payment intent by forwarding the request to admin server
 */
export const createPaymentIntent = asyncHandler(async (req, res) => {
    const { userId, currency, items, products } = req.body;

    // Validate request body
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if ((!items || items.length === 0) && (!products || products.length === 0)) {
        return res.status(400).json({ error: 'At least one item or product is required' });
    }

    try {
        // Forward request to admin server
        const adminServerUrl = process.env.ADMIN_SERVER_URL || 'http://localhost:3000';
        const response = await fetch(`${adminServerUrl}/api/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                currency: currency || 'eur',
                items: items || [],
                products: products || [],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        // Return client secret and order info to frontend
        res.status(200).json(data);

    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

/**
 * GET /api/payments/order/:orderId
 * Gets order status and details
 */
export const getOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    try {
        const adminServerUrl = process.env.ADMIN_SERVER_URL || 'http://localhost:3000';
        const response = await fetch(`${adminServerUrl}/api/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Error fetching order status:', error);
        res.status(500).json({ error: 'Failed to fetch order status' });
    }
});
