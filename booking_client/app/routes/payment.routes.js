import { Router } from 'express';
import { createPaymentIntent, getOrderStatus } from '../controllers/payment.controller.js';

const router = Router();

router.post('/create-intent', createPaymentIntent);
router.get('/order/:orderId', getOrderStatus);

export default router;
