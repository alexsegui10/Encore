import { Router } from 'express';
import * as comments from '../controllers/comments.controller.js';
import verifyOptionalJWT from '../middleware/verifyJWTOptional.js';
import verifyJWT from '../middleware/verifyJWT.js';

const api = Router();

// usar los nombres reales del controller
api.get('/:slug/comments', verifyOptionalJWT, comments.listComments);
api.post('/:slug/comments', verifyJWT, comments.createComment);
// pasa el id del comentario en la URL
api.delete('/:slug/comments/:id', verifyJWT, comments.deleteComment);

export default api;
