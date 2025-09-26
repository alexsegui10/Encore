
import { Router } from 'express';
import * as carousel from '../controllers/carousel.controller.js';

const api = Router();

api.get('/carousel/categories', carousel.get_carousel_category);
//GET EVENT DATA FOR CAROUSEL
api.get('/carousel/evento/:slug', carousel.get_carousel_evento);


export default api;