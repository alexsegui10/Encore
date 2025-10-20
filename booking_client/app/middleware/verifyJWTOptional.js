import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken.model.js';
import User from '../models/user.model.js';
import { generateAccessToken } from './authService.js';

const verifyOptionalJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.loggedin = false;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const loginUser = await User.findOne({ email: decoded.user.email }).exec();

    if (!loginUser) {
      req.loggedin = false;
      return next();
    }

    const refreshToken = await RefreshToken.findOne({ userId: loginUser._id }).exec();

    if (!refreshToken) {
      req.loggedin = false;
      return next();
    }

    if (refreshToken.expiryDate < Date.now()) {
      await RefreshToken.deleteOne({ _id: refreshToken.id });
      req.loggedin = false;
      return next();
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
    req.loggedin = true;

    next();
  } catch (error) {
    console.log('Invalid token in optional verification:', error.message);
    req.loggedin = false;
    next();
  }
};

export default verifyOptionalJWT;
