import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken.model.js';
import User from '../models/user.model.js';
import { generateAccessToken } from './authService.js';

const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const loginUser = await User.findOne({ email: decoded.user.email }).exec();

        if (!loginUser) {
            return res.status(403).json({ message: 'User not found' });
        }

        // NO verificar el refresh token aquí - solo se verifica en /refresh-token
        // Este middleware solo valida que el access token sea válido

        req.userId = loginUser._id;
        req.userEmail = loginUser.email;
        req.newAccessToken = token;

        next();
    } catch (error) {
        // Si el token expiró o es inválido, devolver 403
        return res.status(403).json({
            message: 'Forbidden: Invalid or expired token',
            error: error.message
        });
    }
};

export default verifyJWT;
