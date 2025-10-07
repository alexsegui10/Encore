import express from 'express';
import { getCurrentUser, updateUser } from '../controllers/user.controller.js';
import verifyJWT from '../middleware/verifyJWT.js';

const router = express.Router();

// Protected routes
router.get('/user', verifyJWT, getCurrentUser);
router.put('/user', verifyJWT, updateUser);

export default router;