import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken.model.js';
import User from '../models/user.model.js';
import { generateAccessToken } from './authService.js';

const verifyOptionalJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (!req.logged) return next();
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const loginUser = await User.findOne({ email: decoded.user.email }).exec();

    if (!loginUser) {
      if (!req.logged) return next();
      return res.status(403).json({ message: 'User not found' });
    }

    const refreshToken = await RefreshToken.findOne({ userId: loginUser._id }).exec();

    if (!refreshToken) {
      if (!req.logged) return next();
      return res.status(403).json({ message: 'Refresh token not found' });
    }

    if (refreshToken.expiryDate < Date.now()) {
      await RefreshToken.deleteOne({ _id: refreshToken.id });
      if (!req.logged) return next();
      return res.status(403).json({ message: 'Refresh token has expired' });
    }

    let accessToken = token;

    if (decoded.exp < Date.now() / 1000) {
      accessToken = generateAccessToken(loginUser);
      res.setHeader('Authorization', `Bearer ${accessToken}`);
    }

    req.userId = loginUser._id;
    req.userEmail = loginUser.email;
    req.newAccessToken = accessToken;
    req.isAuthenticated = true;

    next();
  } catch (error) {
    if (!req.logged) return next();
    return res.status(403).json({
      message: 'Forbidden: Invalid token',
      error: error.message
    });
  }
};

export default verifyOptionalJWT;
