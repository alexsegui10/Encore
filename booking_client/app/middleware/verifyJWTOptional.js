import jwt from 'jsonwebtoken';
import RefreshToken from '../models/refreshToken.model.js';
import User from '../models/user.model.js';
import { generateAccessToken } from './authService.js';

const verifyOptionalJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.loggedin = false;
    req.isAuthenticated = false;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const loginUser = await User.findOne({ email: decoded.user.email }).exec();

    if (!loginUser) {
      req.loggedin = false;
      req.isAuthenticated = false;
      return next();
    }

    // Para auth opcional, NO verificar el refresh token
    // Solo verificar que el access token sea válido
    // Si el access token expira, el frontend debe pedir un refresh

    req.userId = loginUser._id;
    req.userEmail = loginUser.email;
    req.newAccessToken = token;
    req.isAuthenticated = true;
    req.loggedin = true;

    next();
  } catch (error) {
    // Si el token expiró o es inválido, simplemente continuar sin autenticación
    console.log('Token inválido en verificación opcional:', error.message);
    req.loggedin = false;
    req.isAuthenticated = false;
    next();
  }
};

export default verifyOptionalJWT;
