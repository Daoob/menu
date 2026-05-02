const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Admin authentication middleware.
 * Uses a SEPARATE JWT secret from merchant tokens.
 */
const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No admin token provided.',
            });
        }

        const token = authHeader.split(' ')[1];
        // Admin uses ADMIN_SECRET_KEY as JWT secret — completely separate
        const decoded = jwt.verify(token, process.env.ADMIN_SECRET_KEY);

        if (decoded.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Not an admin token.',
            });
        }

        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Admin not found.',
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Admin token expired.',
                code: 'TOKEN_EXPIRED',
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid admin token.',
        });
    }
};

module.exports = adminAuth;
