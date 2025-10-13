import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import asyncHandler from 'express-async-handler';
import argon2 from 'argon2';
import { generateAccessToken, generateRefreshToken } from '../middleware/authService.js';

// @desc Register a new user
// @route POST /api/users
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
    const { user } = req.body;

    if (!user || !user.email || !user.username || !user.password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email: user.email }, { username: user.username }]
    });

    if (existingUser) {
        return res.status(409).json({ 
            message: "User already exists with this email or username" 
        });
    }

    const hashedPwd = await argon2.hash(user.password);

    const newUser = {
        username: user.username,
        password: hashedPwd,
        email: user.email,
        bio: user.bio || "",
        image: user.image || ""
    };

    const createdUser = await User.create(newUser);

    if (createdUser) {
        // Generate tokens
        const accessToken = generateAccessToken(createdUser);
        const refreshTokenValue = generateRefreshToken(createdUser);

        // Create refresh token for the new user
        await RefreshToken.create({
            token: refreshTokenValue,
            userId: createdUser._id,
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        res.status(201).json({
            user: createdUser.toUserResponse(accessToken)
        });
    } else {
        res.status(422).json({
            errors: { body: "Unable to register a user" }
        });
    }
});

// @desc Login user and return tokens
// @route POST /api/users/login
// @access Public
export const userLogin = asyncHandler(async (req, res) => {
    const { user } = req.body;

    if (!user || !user.email || !user.password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const loginUser = await User.findOne({ email: user.email }).exec();

    if (!loginUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const match = await argon2.verify(loginUser.password, user.password);
    if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(loginUser);
    const refreshTokenValue = generateRefreshToken(loginUser);

    // Remove existing refresh token for this user
    await RefreshToken.deleteMany({ userId: loginUser._id });

    // Create new refresh token
    await RefreshToken.create({
        token: refreshTokenValue,
        userId: loginUser._id,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(200).json({
        user: loginUser.toUserResponse(accessToken)
    });
});

// @desc Get current user
// @route GET /api/user
// @access Private
export const getCurrentUser = asyncHandler(async (req, res) => {
    const email = req.userEmail;
    const user = await User.findOne({ email }).exec();

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const accessToken = req.newAccessToken;

    res.status(200).json({
        user: user.toUserResponse(accessToken)
    });
});

// @desc Update currently logged-in user
// @route PUT /api/user
// @access Private
export const updateUser = asyncHandler(async (req, res) => {
    const { user } = req.body;

    if (!user) {
        return res.status(400).json({ message: "Required a User object" });
    }

    const email = req.userEmail;
    const target = await User.findOne({ email }).exec();

    if (!target) {
        return res.status(404).json({ message: "User not found" });
    }

    // Check if email or username already exists (if being updated)
    if (user.email && user.email !== target.email) {
        const existingEmailUser = await User.findOne({ email: user.email });
        if (existingEmailUser) {
            return res.status(409).json({ message: "Email already in use" });
        }
        target.email = user.email;
    }

    if (user.username && user.username !== target.username) {
        const existingUsernameUser = await User.findOne({ username: user.username });
        if (existingUsernameUser) {
            return res.status(409).json({ message: "Username already in use" });
        }
        target.username = user.username;
    }

    if (user.password) {
        const hashedPwd = await argon2.hash(user.password);
        target.password = hashedPwd;
    }
    if (typeof user.image !== 'undefined') {
        target.image = user.image;
    }
    if (typeof user.bio !== 'undefined') {
        target.bio = user.bio;
    }

    await target.save();

    const accessToken = generateAccessToken(target);

    return res.status(200).json({
        user: target.toUserResponse(accessToken)
    });
});
