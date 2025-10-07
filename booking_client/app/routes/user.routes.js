module.exports = (app) => {
    const userController = require('../controllers/user.controller');
    const verifyJWT = require('../middleware/verifyJWT');

    // Authentication
    // app.post('/users/login', userController.userLogin);

    // Registration
    // app.post('/users', userController.registerUser);

    // Get Current User
    app.get('/user', verifyJWT, userController.getCurrentUser);

    // Update User
    app.put('/user', verifyJWT, userController.updateUser);
}