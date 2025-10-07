module.exports = (app) => {
    const express = require('express');
    const userController = require('../controllers/user.controller');
    const { refreshToken } = require('../controllers/auth.controller');

    const router = express.Router();

    // Public routes
    // router.post('/login', userLogin);
    // router.post('/register', registerUser);

    // Authentication
    app.post('/users/login', userController.userLogin);

    // Registration
    app.post('/users', userController.registerUser);

    app.post('/refresh-token', refreshToken);
}