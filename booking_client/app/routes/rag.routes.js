import { Router } from 'express';
import * as ragController from '../controllers/rag.controller.js';

const api = Router();

api.post('/ask', ragController.askQuestion);

export default api;
