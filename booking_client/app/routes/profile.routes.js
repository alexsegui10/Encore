import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import * as concerts from '../controllers/evento.controller.js';
import verifyJWTOptional from '../middleware/verifyJWTOptional.js';
import verifyJWT from '../middleware/verifyJWT.js';

const api = Router();

// Get profile - authentication optional
api.get('/profile/:username', verifyJWTOptional, profileController.getProfile);

// Follow a user
api.post('/:username/follow', verifyJWT, profileController.followUser);

// unfollow a user
api.delete('/:username/follow', verifyJWT, profileController.unFollowUser);


export default api;