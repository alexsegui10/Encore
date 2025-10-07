module.exports = (app) => {
    const profileController = require('../controllers/profile.controller');
    const verifyJWT = require('../middleware/verifyJWT');
    const verifyJWTOptional = require('../middleware/verifyJWTOptional');

    // Get profile - authentication optional
    app.get('/profile/:username', verifyJWTOptional, profileController.getProfile);

    // Follow a user
    app.post('/:username/follow', verifyJWT, profileController.followUser);

    // unfollow a user
    app.delete('/:username/follow', verifyJWT, profileController.unFollowUser);
}