import asyncHandler from 'express-async-handler';
import verifyJWT from '../middleware/verifyJWT.js';
import Order from '../models/orders.model.js';
import User from '../models/user.model.js';
import OrderItem from '../models/orderItem.model.js';
// Get list of orders for the authenticated user

export const listOrders = asyncHandler(async (req, res) => {
    const userId = req.userId; // Mantener como ObjectId


    const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
    
    const orderItems = await Promise.all(
        orders.map(async (order) => {
            const items = await OrderItem.find({ orderId: order._id }).populate('eventId');
            return { ...order.toObject(), items };
        })
    );

    res.status(200).json({ orders: orderItems });
});