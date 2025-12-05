import User from '../models/user.model.js';

const verifyAdmin = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                message: 'Unauthorized: User not authenticated'
            });
        }

        const user = await User.findById(req.userId).select('role').exec();

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                message: 'Forbidden: Admin access required',
                requiredRole: 'admin',
                userRole: user.role
            });
        }

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
