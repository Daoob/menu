const bcrypt = require('bcrypt');
const Merchant = require('../models/Merchant');
const ActivationCode = require('../models/ActivationCode');
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require('../utils/tokenUtils');
const { logAction } = require('../utils/logger');

const SALT_ROUNDS = 12;

/**
 * Register Merchant (after activation code validation)
 * POST /api/auth/register
 */
const register = async (req, res) => {
    try {
        const { email, password, code } = req.body;

        // Verify code one more time
        const activationCode = await ActivationCode.findOne({
            code: code.toUpperCase().trim(),
            isUsed: false,
        });

        if (!activationCode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or already used activation code.',
            });
        }

        if (new Date() > activationCode.expiresAt) {
            return res.status(400).json({
                success: false,
                message: 'Activation code has expired.',
            });
        }

        // Check if locked
        if (activationCode.lockedUntil && new Date() < activationCode.lockedUntil) {
            return res.status(429).json({
                success: false,
                message: 'Activation code is temporarily locked.',
            });
        }

        // Check if email already exists
        const existingMerchant = await Merchant.findOne({ email: email.toLowerCase() });
        if (existingMerchant) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.',
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create merchant
        const merchant = await Merchant.create({
            email: email.toLowerCase().trim(),
            passwordHash,
        });

        // Generate tokens
        const accessToken = generateAccessToken({ id: merchant._id, role: 'merchant' });
        const refreshToken = generateRefreshToken({ id: merchant._id, role: 'merchant' });

        // Save refresh token
        merchant.refreshToken = refreshToken;
        merchant.lastLogin = new Date();
        await merchant.save();

        // PERMANENTLY delete the activation code
        await ActivationCode.findByIdAndDelete(activationCode._id);

        logAction('MERCHANT_REGISTERED', {
            merchantId: merchant._id,
            email: merchant.email,
            codeUsed: code,
        });

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            accessToken,
            merchant: merchant.toJSON(),
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Login Merchant
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const merchant = await Merchant.findOne({ email: email.toLowerCase() });
        if (!merchant) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        if (!merchant.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Contact support.',
            });
        }

        const isMatch = await bcrypt.compare(password, merchant.passwordHash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        // Generate tokens
        const accessToken = generateAccessToken({ id: merchant._id, role: 'merchant' });
        const refreshToken = generateRefreshToken({ id: merchant._id, role: 'merchant' });

        // Save new refresh token (rotation)
        merchant.refreshToken = refreshToken;
        merchant.lastLogin = new Date();
        await merchant.save();

        logAction('MERCHANT_LOGIN', {
            merchantId: merchant._id,
            email: merchant.email,
        });

        // Set refresh token as HttpOnly cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            accessToken,
            merchant: merchant.toJSON(),
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Refresh Token
 * POST /api/auth/refresh
 */
const refreshTokenHandler = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not found.',
            });
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(token);
        } catch {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token.',
            });
        }

        const merchant = await Merchant.findById(decoded.id);
        if (!merchant || merchant.refreshToken !== token) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Please login again.',
            });
        }

        if (!merchant.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended.',
            });
        }

        // Rotate tokens
        const newAccessToken = generateAccessToken({ id: merchant._id, role: 'merchant' });
        const newRefreshToken = generateRefreshToken({ id: merchant._id, role: 'merchant' });

        merchant.refreshToken = newRefreshToken;
        await merchant.save();

        // Set new refresh token cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            accessToken: newAccessToken,
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.merchant._id);
        if (merchant) {
            merchant.refreshToken = null;
            await merchant.save();
        }

        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Change Password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const merchant = await Merchant.findById(req.merchant._id);
        const isMatch = await bcrypt.compare(currentPassword, merchant.passwordHash);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect.',
            });
        }

        // Hash new password and invalidate all tokens
        merchant.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        merchant.refreshToken = null;
        await merchant.save();

        res.clearCookie('refreshToken');

        logAction('PASSWORD_CHANGED', {
            merchantId: merchant._id,
            email: merchant.email,
        });

        res.json({
            success: true,
            message: 'Password changed. Please login again with your new password.',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Get Current Merchant Profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
    try {
        res.json({
            success: true,
            merchant: req.merchant,
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

module.exports = {
    register,
    login,
    refreshTokenHandler,
    logout,
    changePassword,
    getMe,
};
