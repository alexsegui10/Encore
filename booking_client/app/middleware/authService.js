import jwt from 'jsonwebtoken';

// Verify environment variables are loaded
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error('⚠️  WARNING: JWT secrets not configured. Please check your .env file.');
    console.log('Current ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET ? 'Set' : 'Not set');
    console.log('Current REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'Set' : 'Not set');
}

// Generate Access Token (expires in 30 mins)
export const generateAccessToken = (user) => {
    return jwt.sign(
        { user: { id: user._id, email: user.email } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
    );
};

// Generate Refresh Token (expires in 7 days)
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { user: { id: user._id, email: user.email } },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};
