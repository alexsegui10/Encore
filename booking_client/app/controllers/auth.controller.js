import { generateAccessToken } from '../middleware/authService.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import asyncHandler from 'express-async-handler';

// @desc Refresh access token
// @route POST /api/users/refresh-token
// @access Public
export const refreshToken = asyncHandler(async (req, res) => {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(403).json({ message: 'Refresh Token is required!' });
    }

    // Find the refresh token in the database
    const refreshTokenRecord = await RefreshToken.findOne({ token }).exec();

    if (!refreshTokenRecord) {
        return res.status(403).json({ message: 'Refresh Token not found!' });
    }

    // Check if the refresh token has expired
    if (refreshTokenRecord.expiryDate < new Date()) {
        await RefreshToken.findByIdAndDelete(refreshTokenRecord._id);
        return res.status(403).json({ message: 'Refresh Token expired!' });
    }

    // Verify the refresh token
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid Refresh Token' });
        }

        // Get user from decoded token
        const user = await User.findById(decoded.user.id).exec();
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a new access token
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
    const userId = req.userId;
    
    // Remove all refresh tokens for this user
    await RefreshToken.deleteMany({ userId });
    
    res.status(200).json({ message: 'Logged out successfully' });
});
