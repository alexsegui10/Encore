import User from '../models/user.model.js';

/**
 * Middleware to verify if the user has admin role
 * This middleware should be used AFTER verifyJWT middleware
 * to ensure req.userId is already set
 */
const verifyAdmin = async (req, res, next) => {
    try {
        // Check if userId is set by verifyJWT middleware
        if (!req.userId) {
            return res.status(401).json({ 
                message: 'Unauthorized: User not authenticated' 
            });
        }

        // Find the user and check their role
        const user = await User.findById(req.userId).select('role').exec();

        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        // Check if user has admin role
        if (user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Forbidden: Admin access required',
                requiredRole: 'admin',
                userRole: user.role
            });
        }

        // User is admin, proceed to next middleware/route handler
        req.userRole = user.role;
        next();
    } catch (error) {
        return res.status(500).json({ 
            message: 'Error verifying admin role',
            error: error.message 
        });
    }
};

export default verifyAdmin;
