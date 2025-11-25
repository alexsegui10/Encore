import asyncHandler from 'express-async-handler';

/**
 * Payment controller - handles payment requests and proxies to admin server
 * Implements SAGA orchestration between client and admin servers
 */

/**
 * POST /api/payments/create-intent
 * Creates a payment intent by forwarding the request to admin server
 */
export const createPaymentIntent = asyncHandler(async (req, res) => {
    const { userUid, events, billingDetails } = req.body;

    // Validate request body
    if (!userUid) {
        return res.status(400).json({ error: 'User UID is required' });
    }

    if (!events || events.length === 0) {
        return res.status(400).json({ error: 'At least one event is required' });
    }

    // Validate event structure
    for (const event of events) {
        if (!event.eventSlug || !event.quantity || event.quantity < 1) {
            return res.status(400).json({ 
                error: 'Each event must have eventSlug and quantity >= 1' 
            });
        }
    }

    try {
        // Forward request to admin server (SAGA Orchestrator)
        const adminServerUrl = process.env.ADMIN_SERVER_URL || 'http://localhost:3000';
        
        console.log(`[SAGA] Initiating payment for user ${userUid} with ${events.length} events`);
        
        const response = await fetch(`${adminServerUrl}/api/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userUid,
                events,
                billingDetails,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[SAGA] Payment creation failed:`, data);
            return res.status(response.status).json(data);
        }

        console.log(`[SAGA] Payment intent created successfully: ${data.orderId}`);
        
        // Return client secret and order info to frontend
        res.status(200).json(data);

    } catch (error) {
        console.error('[SAGA] Error creating payment intent:', error);
        res.status(500).json({ 
            error: 'Failed to create payment intent',
            message: error.message 
        });
    }
});

/**
 * GET /api/payments/order/:orderId
 * Gets order status and details
 */
export const getOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

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
        res.status(500).json({ 
            error: 'Failed to fetch order status',
            message: error.message 
        });
    }
});
