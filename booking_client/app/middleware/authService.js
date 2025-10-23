import jwt from 'jsonwebtoken';

// Generate Access Token (expires in 15 mins)
export const generateAccessToken = (user) => {
    return jwt.sign(
        { user: { id: user._id, email: user.email } },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m' } // Token corto para mayor seguridad
    );
};

// Generate Refresh Token (expires in 7 days)
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { user: { id: user._id } },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '2m' }
    );
};

