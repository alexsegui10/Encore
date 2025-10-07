import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const verifyJWTOptional = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Token ')) {
        // No token provided, continue without user info
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findOne({ email: decoded.user.email }).exec();
        
        if (user) {
            req.userId = user._id;
            req.userEmail = user.email;
        }
    } catch (error) {
        // Invalid token, but continue without user info
        console.log('Invalid token in optional verification:', error.message);
    }

    next();
};

export default verifyJWTOptional;
