import express from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import {
  getCart,
  addToCart,
  addProductToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartForCheckout,
  completeCart
} from '../controllers/cart.controller.js';

const router = express.Router();

router.get('/', verifyJWT, getCart);
router.post('/add', verifyJWT, addToCart);
router.post('/add-product', verifyJWT, addProductToCart);
router.put('/item/:eventId', verifyJWT, updateCartItem);
router.delete('/item/:eventId', verifyJWT, removeFromCart);
router.delete('/clear', verifyJWT, clearCart);
router.post('/complete', verifyJWT, completeCart);
router.get('/checkout', verifyJWT, getCartForCheckout);

export default router;
