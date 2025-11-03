import { Router } from 'express';
import verifyJWT from '../middleware/verifyJWT.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import * as categoria from '../controllers/category.controller.js';

const api = Router();

// Public routes
api.get('/category', categoria.list);
api.get('/category/:slug', categoria.getOne);
api.get('/categories_select_filter', categoria.findCategoriesSelect);

// Admin-only routes: create, update, and delete categories
api.post('/category', verifyJWT, verifyAdmin, categoria.create);
api.put('/category/:slug', verifyJWT, verifyAdmin, categoria.update);
api.delete('/category/:slug', verifyJWT, verifyAdmin, categoria.remove);

export default api;