const { generateAccessToken } = require('../middleware/authService');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Your User model
const RefreshToken = require('../models/refreshToken.model');
const asyncHandler = require('express-async-handler');

// @desc Refresh access token
// @route POST /api/users/refresh-token
// @access Public
const refreshToken = asyncHandler(async (req, res) => {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Token ') ? authHeader.split(' ')[1] : null;

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
        await RefreshToken.findByIdAndDelete(refreshTokenRecord._id);  // Delete expired token
        return res.status(403).json({ message: 'Refresh Token expired!' });
    }

    // Verify the refresh token
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid Refresh Token' });
        }

        const user = await User;

        // Generate a new access token
        const newAccessToken = generateAccessToken({ _id: user._id }); // Adjust as needed

        res.status(200).json({ accessToken: newAccessToken });
    });
});

module.exports = { refreshToken };
