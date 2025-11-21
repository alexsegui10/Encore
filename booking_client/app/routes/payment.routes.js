import { Router } from 'express';
import { createPaymentIntent, getOrderStatus } from '../controllers/payment.controller.js';

const router = Router();

/**
 * POST /api/payments/create-intent
 * Create a payment intent
 */
router.post('/create-intent', createPaymentIntent);

/**
 * GET /api/payments/order/:orderId
 * Get order status
 */
router.get('/order/:orderId', getOrderStatus);

export default router;
