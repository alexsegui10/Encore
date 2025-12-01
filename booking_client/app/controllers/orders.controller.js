import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';

// Get list of orders for the authenticated user - Proxy to admin server
export const listOrders = asyncHandler(async (req, res) => {
    const userId = req.userId; // ObjectId from JWT

    try {
        // Get user uid from database
        const user = await User.findById(userId).select('uid');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Forward request to admin server
        const adminServerUrl = process.env.ADMIN_SERVER_URL || 'http://localhost:3000';
        
        const response = await fetch(`${adminServerUrl}/api/orders/by-uid/${user.uid}`);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Error fetching orders from admin server:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});