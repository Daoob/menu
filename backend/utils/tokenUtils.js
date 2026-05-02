const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token (15 minutes).
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '15m',
    });
};

/**
 * Generate JWT refresh token (30 days).
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '30d',
    });
};

/**
 * Generate Admin JWT token (separate secret).
 */
const generateAdminToken = (payload) => {
    return jwt.sign(payload, process.env.ADMIN_SECRET_KEY, {
        expiresIn: '8h',
    });
};

/**
 * Verify access token.
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

/**
 * Verify refresh token.
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateAdminToken,
    verifyAccessToken,
    verifyRefreshToken,
};
