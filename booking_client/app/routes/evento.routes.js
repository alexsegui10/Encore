import { Router } from 'express';
import * as concerts from '../controllers/evento.controller.js';

const api = Router();

api.get('/eventos', concerts.list);
api.get('/eventos/:slug', concerts.getOne);
api.post('/eventos', concerts.create);
api.put('/eventos/:slug', concerts.update);
api.delete('/eventos/:slug', concerts.remove);

export default api;