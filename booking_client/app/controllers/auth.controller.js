import { generateAccessToken, generateRefreshToken } from '../middleware/authService.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import BlacklistedToken from '../models/blacklistedToken.model.js';
import asyncHandler from 'express-async-handler';

// Configuración de expiración del refresh token (debe coincidir con authService.js)
const REFRESH_TOKEN_EXPIRY_MS = 2 * 60 * 1000; 

export const refreshToken = asyncHandler(async (req, res) => {
    // Obtener el refresh token de la cookie HttpOnly
    const token = req.cookies.jid;

    if (!token) {
        return res.status(401).json({ message: 'No refresh token' });
    }

    // Verificar que el token NO esté en la blacklist
    const isBlacklisted = await BlacklistedToken.findOne({ token }).exec();
    if (isBlacklisted) {
        res.clearCookie('jid', { path: '/' });
        return res.status(401).json({ message: 'Token has been revoked' });
    }

    const refreshTokenRecord = await RefreshToken.findOne({ token }).exec();

    if (!refreshTokenRecord) {
        return res.status(401).json({ message: 'Refresh token not found' });
    }

    // Check if the refresh token has expired
    if (refreshTokenRecord.expiryDate < new Date()) {
        // Mover a blacklist antes de eliminar
        await BlacklistedToken.create({
            token: refreshTokenRecord.token,
            userId: refreshTokenRecord.userId,
            reason: 'expired',
            originalExpiryDate: refreshTokenRecord.expiryDate
        });
        
        // Eliminar de la tabla de refresh tokens
        await RefreshToken.findByIdAndDelete(refreshTokenRecord._id);
        res.clearCookie('jid', { path: '/' });
        return res.status(401).json({ message: 'Refresh token expired' });
    }

    // Verify the refresh token
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        if (refreshTokenRecord.userId.toString() !== decoded.user.id) {
            return res.status(401).json({ message: 'Token mismatch' });
        }

        const user = await User.findById(decoded.user.id).exec();
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const newAccessToken = generateAccessToken(user);

        res.status(200).json({ 
            accessToken: newAccessToken,
            user: user.toUserResponse(newAccessToken)
        });
    });
});

// @desc Logout user
// @route POST /api/users/logout
// @access Private
export const logout = asyncHandler(async (req, res) => {
    const token = req.cookies.jid;
    
    // Mover refresh token a blacklist antes de eliminarlo
    if (token) {
        const refreshTokenRecord = await RefreshToken.findOne({ token }).exec();
        
        if (refreshTokenRecord) {
            // Agregar a blacklist
            await BlacklistedToken.create({
                token: refreshTokenRecord.token,
                userId: refreshTokenRecord.userId,
                reason: 'logout',
                originalExpiryDate: refreshTokenRecord.expiryDate
            });
            
            // Eliminar de la tabla de refresh tokens
            await RefreshToken.deleteOne({ token });
        }
    }
    
    // Clear the cookie
    res.clearCookie('jid', { path: '/' });
    
    res.status(200).json({ message: 'Logged out successfully' });
});

