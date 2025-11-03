import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import verifyJWTOptional from '../middleware/verifyJWTOptional.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import * as concerts from '../controllers/evento.controller.js';

const api = Router();

api.get('/eventos', verifyJWTOptional, concerts.listEvents);
api.get('/eventos/category/:slug', concerts.GetProductsByCategory);
// Events liked by the authenticated user
api.get('/eventos/liked', verifyJWT, concerts.getFavoriteEvents);
api.get('/eventos/:slug', verifyJWTOptional, concerts.getOneEvent);
// Admin-only routes: create, update, and delete events
api.post('/eventos', verifyJWT, verifyAdmin, concerts.createEvent);
api.put('/eventos/:slug', verifyJWT, verifyAdmin, concerts.updateEvent);
api.delete('/eventos/:slug', verifyJWT, verifyAdmin, concerts.deleteEvent);
// User routes: favorite/unfavorite events
api.post('/:slug/favorite', verifyJWT, concerts.favoriteEvent);
api.delete('/:slug/favorite', verifyJWT, concerts.unfavoriteEvent);

export default api; 