import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const verifyJWTOptional = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without user info
        req.loggedin = false;
        return next();
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findOne({ email: decoded.user.email }).exec();
        
        if (user) {
            req.userId = user._id;
            req.userEmail = user.email;
            req.loggedin = true;
        } else {
            req.loggedin = false;
        }
    } catch (error) {
        // Invalid token, but continue without user info
        console.log('Invalid token in optional verification:', error.message);
        req.loggedin = false;
    }

    next();
};

export default verifyJWTOptional;
