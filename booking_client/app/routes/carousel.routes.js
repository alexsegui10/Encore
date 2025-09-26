
import { Router } from 'express';
import * as carousel from '../controllers/carousel.controller.js';

const api = Router();

// GET todas las categorías para el carousel del home
api.get('/carousel', carousel.get_carousel_category);

// GET datos de un evento específico para el carousel de detalles
api.get('/carousel/:slug', carousel.get_carousel_evento);

export default api;