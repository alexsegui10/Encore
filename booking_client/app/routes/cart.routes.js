import express from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartForCheckout
} from '../controllers/cart.controller.js';

const router = express.Router();

router.get('/', verifyJWT, getCart);
router.post('/add', verifyJWT, addToCart);
router.put('/item/:eventId', verifyJWT, updateCartItem);
router.delete('/item/:eventId', verifyJWT, removeFromCart);
router.delete('/clear', verifyJWT, clearCart);
router.get('/checkout', verifyJWT, getCartForCheckout);

export default router;
