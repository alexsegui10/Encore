import express from 'express';
import { listOrders } from '../controllers/orders.controller.js';

import verifyJWT from '../middleware/verifyJWT.js';

const api = express.Router();

//List orders for authenticated user
api.get('/orders', verifyJWT, listOrders);

export default api;