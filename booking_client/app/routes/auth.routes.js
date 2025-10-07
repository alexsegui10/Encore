import express from 'express';
import { registerUser, userLogin } from '../controllers/user.controller.js';
import { refreshToken, logout } from '../controllers/auth.controller.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = express.Router();

// Authentication routes
router.post('/users/login', userLogin);
router.post('/users', registerUser);
router.post('/users/refresh-token', refreshToken);
router.post('/users/logout', verifyJWT, logout);

export default router;