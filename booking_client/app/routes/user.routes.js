import express from 'express';
import { getCurrentUser, updateUser, getFollowingUsers } from '../controllers/user.controller.js';
import verifyJWT from '../middleware/verifyJWT.js';

const api = express.Router();

// Protected routes
api.get('/user', verifyJWT, getCurrentUser);
api.put('/user', verifyJWT, updateUser);
api.get('/user/following', verifyJWT, getFollowingUsers);

export default api;