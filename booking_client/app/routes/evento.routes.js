import { Router } from 'express';
import * as concerts from '../../controllers/concert.controller.js';

const api = Router();

api.get('/concerts', concerts.list);
api.get('/concerts/:slug', concerts.getOne);
api.post('/concerts', concerts.create);
api.put('/concerts/:slug', concerts.update);
api.delete('/concerts/:slug', concerts.remove);

export default api;
