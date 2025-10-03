import { Router } from 'express';
import * as categoria from '../controllers/category.controller.js';

const api = Router();

api.get('/category', categoria.list);
api.get('/category/:slug', categoria.getOne);
api.post('/category', categoria.create);
api.put('/category/:slug', categoria.update);
api.delete('/category/:slug', categoria.remove);
api.get('/categories_select_filter', categoria.findCategoriesSelect);

export default api;