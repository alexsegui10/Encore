import { Router } from 'express';
import * as concerts from '../controllers/evento.controller.js';

const api = Router();

api.get('/eventos', concerts.listEvents);
api.get('/eventos/:slug', concerts.getOneEvent);
api.post('/eventos', concerts.createEvent);
api.put('/eventos/:slug', concerts.updateEvent);
api.delete('/eventos/:slug', concerts.deleteEvent);

export default api;