import { Router } from 'express';
import  verifyJWT  from '../middleware/verifyJWT.js';
import  verifyJWTOptional  from '../middleware/verifyJWTOptional.js';
import * as concerts from '../controllers/evento.controller.js';

const api = Router();

api.get('/eventos', verifyJWTOptional, concerts.listEvents);
api.get('/eventos/category/:slug', concerts.GetProductsByCategory);
api.get('/eventos/:slug', verifyJWTOptional, concerts.getOneEvent);
api.post('/eventos', concerts.createEvent);
api.put('/eventos/:slug', concerts.updateEvent);
api.delete('/eventos/:slug', concerts.deleteEvent);
api.post('/:slug/favorite', verifyJWT, concerts.favoriteEvent);
api.delete('/:slug/favorite', verifyJWT, concerts.unfavoriteEvent);

export default api; 