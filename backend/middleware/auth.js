const jwt = require('jsonwebtoken');
const Merchant = require('../models/Merchant');

/**
 * Merchant authentication middleware.
 * Verifies JWT access token from Authorization header.
 */
const merchantAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        if (decoded.role !== 'merchant') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Invalid token type.',
            });
        }

        const merchant = await Merchant.findById(decoded.id).select('-passwordHash -refreshToken');
        if (!merchant) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Merchant not found.',
            });
        }

        if (!merchant.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Contact support.',
            });
        }

        req.merchant = merchant;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please refresh your token.',
                code: 'TOKEN_EXPIRED',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid token.',
        });
    }
};

module.exports = merchantAuth;
