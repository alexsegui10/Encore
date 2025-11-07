import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import asyncHandler from 'express-async-handler';
import argon2 from 'argon2';
import { generateAccessToken, generateRefreshToken } from '../middleware/authService.js';

// Configuración de expiración del refresh token (debe coincidir con authService.js)
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeUsername(text) {
    if (!text) return '';
    return String(text)
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function generateUid(prefix = 'usr') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `${prefix}_${timestamp}${random}`;
}

// @desc Register a new user
// @route POST /api/users
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
    const { user } = req.body;

    if (!user || !user.email || !user.username || !user.password) {
        return res.status(400).json({ 
            message: "All fields are required",
            errors: {
                email: !user?.email ? "Email is required" : undefined,
                username: !user?.username ? "Username is required" : undefined,
                password: !user?.password ? "Password is required" : undefined
            }
        });
    }

    const email = user.email.trim().toLowerCase();
    const username = user.username.trim().toLowerCase();

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: "Invalid email format",
            error: "INVALID_EMAIL",
            field: "email"
        });
    }

    // Validar longitud de username
    if (username.length < 3) {
        return res.status(400).json({
            message: "Username must be at least 3 characters long",
            error: "USERNAME_TOO_SHORT",
            field: "username"
        });
    }

    // Validar longitud de password
    if (user.password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters long",
            error: "PASSWORD_TOO_SHORT",
            field: "password"
        });
    }

    // Verificar si el email ya existe
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
        return res.status(409).json({
            message: "Email already registered",
            error: "EMAIL_EXISTS",
            field: "email"
        });
    }

    // Verificar si el username ya existe
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
        return res.status(409).json({
            message: "Username already taken",
            error: "USERNAME_EXISTS",
            field: "username"
        });
    }

    const hashedPwd = await argon2.hash(user.password);

    const newUser = {
        username,
        password: hashedPwd,
        email,
        bio: user.bio || "",
        image: user.image && user.image.trim() !== ''
            ? user.image
            : `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
        favouriteEvents: [],
        followingUsers: [],
        comentarios: [],
        reservas: []
    };

    // Generar slug único basado en username normalizado
    const baseSlug = normalizeUsername(username);
    let slugCandidate = baseSlug || username;
    let slugCounter = 1;
    while (await User.findOne({ slug: slugCandidate })) {
        slugCandidate = `${baseSlug || username}-${slugCounter}`;
        slugCounter += 1;
    }
    newUser.slug = slugCandidate;

    // Generar uid único
    let uidCandidate = generateUid();
    while (await User.findOne({ uid: uidCandidate })) {
        uidCandidate = generateUid();
    }
    newUser.uid = uidCandidate;

    let createdUser;
    try {
        createdUser = await User.create(newUser);
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            let message = "A user with this information already exists";
            let errorCode = "DUPLICATE_KEY";
            
            if (field === 'email') {
                message = "Email already registered";
                errorCode = "EMAIL_EXISTS";
            } else if (field === 'username') {
                message = "Username already taken";
                errorCode = "USERNAME_EXISTS";
            } else if (field === 'uid') {
                message = "User ID conflict, please try again";
                errorCode = "UID_CONFLICT";
            } else if (field === 'slug') {
                message = "Username slug conflict, please try again";
                errorCode = "SLUG_CONFLICT";
            }
            
            return res.status(409).json({
                message,
                error: errorCode,
                field
            });
        }
        throw error;
    }

    if (createdUser) {
        // Generate tokens
        const accessToken = generateAccessToken(createdUser);
        const refreshTokenValue = generateRefreshToken(createdUser);

        // Create refresh token for the new user
        await RefreshToken.create({
            token: refreshTokenValue,
            userId: createdUser._id,
            expiryDate: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        });

        // Enviar refresh token en cookie HttpOnly
        res.cookie('jid', refreshTokenValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS)
            sameSite: 'lax', // o 'strict' según necesidades
            path: '/',
            maxAge: REFRESH_TOKEN_EXPIRY_MS,
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
        return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const match = await argon2.verify(loginUser.password, user.password);
    if (!match) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar el estado del usuario
    if (loginUser.status === 'blocked') {
        return res.status(403).json({ 
            message: 'Tu cuenta ha sido bloqueada. Por favor, contacta con soporte.',
            error: 'ACCOUNT_BLOCKED',
            status: 'blocked'
        });
    }

    if (loginUser.status === 'pending') {
        return res.status(403).json({ 
            message: 'Tu cuenta está pendiente de aprobación. Por favor, espera a que un administrador apruebe tu cuenta.',
            error: 'ACCOUNT_PENDING',
            status: 'pending'
        });
    }

    if (!loginUser.isActive) {
        return res.status(403).json({ 
            message: 'Tu cuenta está inactiva. Por favor, contacta con soporte.',
            error: 'ACCOUNT_INACTIVE'
        });
    }

    // Generate tokens
    const accessToken = generateAccessToken(loginUser);
    const refreshTokenValue = generateRefreshToken(loginUser);

    // Remove existing refresh token for this user (single device)
    // Para múltiples dispositivos, comentar esta línea
    await RefreshToken.deleteMany({ userId: loginUser._id });

    // Create new refresh token
    await RefreshToken.create({
        token: refreshTokenValue,
        userId: loginUser._id,
        expiryDate: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    });

    // Enviar refresh token en cookie HttpOnly
    res.cookie('jid', refreshTokenValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true en producción (HTTPS)
        sameSite: 'lax',
        path: '/',
        maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });

    // Enviar access token en el body
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
    if (user.email && user.email.trim().toLowerCase() !== target.email) {
        const newEmail = user.email.trim().toLowerCase();
        const existingEmailUser = await User.findOne({ email: newEmail });
        if (existingEmailUser) {
            return res.status(409).json({ 
                message: "Email already in use",
                error: "EMAIL_EXISTS",
                field: "email"
            });
        }
        target.email = newEmail;
    }

    if (user.username && user.username.trim().toLowerCase() !== target.username) {
        const newUsername = user.username.trim().toLowerCase();
        const existingUsernameUser = await User.findOne({ username: newUsername });
        if (existingUsernameUser) {
            return res.status(409).json({ 
                message: "Username already in use",
                error: "USERNAME_EXISTS",
                field: "username"
            });
        }
        target.username = newUsername;

        const baseSlug = normalizeUsername(newUsername);
        let slugCandidate = baseSlug || newUsername;
        let slugCounter = 1;
        while (await User.findOne({ slug: slugCandidate, _id: { $ne: target._id } })) {
            slugCandidate = `${baseSlug || newUsername}-${slugCounter}`;
            slugCounter += 1;
        }
        target.slug = slugCandidate;
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

    try {
        await target.save();
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            let message = "This information is already in use";
            let errorCode = "DUPLICATE_KEY";
            
            if (field === 'email') {
                message = "Email already in use";
                errorCode = "EMAIL_EXISTS";
            } else if (field === 'username') {
                message = "Username already in use";
                errorCode = "USERNAME_EXISTS";
            }
            
            return res.status(409).json({ 
                message,
                error: errorCode,
                field
            });
        }
        throw error;
    }

    const accessToken = generateAccessToken(target);

    return res.status(200).json({
        user: target.toUserResponse(accessToken)
    });
});

export const getFollowingUsers = asyncHandler(async (req, res) => {
    const userId = req.userId;

    // Buscar el usuario autenticado
    const currentUser = await User.findById(userId).exec();

    if (!currentUser) {
        return res.status(401).json({
            message: "User Not Found"
        });
    }

    // Obtener los usuarios que sigue
    const followingUsers = await User.find({
        _id: { $in: currentUser.followingUsers }
    }).exec();

    // Transformar los usuarios usando toProfileJSON
    const usersProfiles = followingUsers.map(user =>
        user.toProfileJSON(currentUser)
    );

    return res.status(200).json({
        users: usersProfiles,
        usersCount: usersProfiles.length
    });
});