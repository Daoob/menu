const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const ActivationCode = require('../models/ActivationCode');
const Merchant = require('../models/Merchant');
const generateActivationCode = require('../utils/generateCode');
const { generateAdminToken } = require('../utils/tokenUtils');
const { logAction } = require('../utils/logger');

/**
 * Initialize First Admin
 * POST /api/admin/init
 */
const initAdmin = async (req, res) => {
    try {
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin already initialized.',
            });
        }

        const { email, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            email: email.toLowerCase(),
            passwordHash,
        });

        logAction('ADMIN_INITIALIZED', { adminId: admin._id, email: admin.email });

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully.',
            admin: admin.toJSON(),
        });
    } catch (error) {
        console.error('Init admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Admin Login
 * POST /api/admin/login
 */
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.',
            });
        }

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.',
            });
        }

        const token = generateAdminToken({ id: admin._id, role: 'admin' });

        logAction('ADMIN_LOGIN', { adminId: admin._id, email: admin.email });

        res.json({
            success: true,
            token,
            admin: { id: admin._id, email: admin.email },
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Generate Activation Codes
 * POST /api/admin/codes/generate
 */
const generateCodes = async (req, res) => {
    try {
        const { count = 1 } = req.body;
        const quantity = Math.min(Math.max(parseInt(count) || 1, 1), 50); // 1-50

        const codes = [];
        for (let i = 0; i < quantity; i++) {
            let code;
            let exists = true;

            // Ensure uniqueness
            while (exists) {
                code = generateActivationCode();
                exists = await ActivationCode.findOne({ code });
            }

            const newCode = await ActivationCode.create({
                code,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            });

            codes.push(newCode);
        }

        logAction('CODES_GENERATED', {
            adminId: req.admin._id,
            count: quantity,
            codes: codes.map((c) => c.code),
        });

        res.status(201).json({
            success: true,
            message: `${quantity} activation code(s) generated.`,
            codes,
        });
    } catch (error) {
        console.error('Generate codes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Get All Codes
 * GET /api/admin/codes
 */
const getAllCodes = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};

        if (status === 'unused') {
            query.isUsed = false;
            query.expiresAt = { $gt: new Date() };
        } else if (status === 'used') {
            query.isUsed = true;
        } else if (status === 'expired') {
            query.isUsed = false;
            query.expiresAt = { $lte: new Date() };
        } else if (status === 'locked') {
            query.lockedUntil = { $gt: new Date() };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [codes, total] = await Promise.all([
            ActivationCode.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ActivationCode.countDocuments(query),
        ]);

        res.json({
            success: true,
            codes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get codes error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Delete Unused Code
 * DELETE /api/admin/codes/:id
 */
const deleteCode = async (req, res) => {
    try {
        const code = await ActivationCode.findById(req.params.id);
        if (!code) {
            return res.status(404).json({
                success: false,
                message: 'Code not found.',
            });
        }

        if (code.isUsed) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a used code.',
            });
        }

        await ActivationCode.findByIdAndDelete(req.params.id);

        logAction('CODE_DELETED', {
            adminId: req.admin._id,
            code: code.code,
        });

        res.json({
            success: true,
            message: 'Code deleted successfully.',
        });
    } catch (error) {
        console.error('Delete code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Get All Merchants
 * GET /api/admin/merchants
 */
const getAllMerchants = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { storeName_ar: { $regex: search, $options: 'i' } },
                { storeName_en: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [merchants, total] = await Promise.all([
            Merchant.find(query)
                .select('-passwordHash -refreshToken')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Merchant.countDocuments(query),
        ]);

        res.json({
            success: true,
            merchants,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error('Get merchants error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Toggle Merchant Active Status
 * PATCH /api/admin/merchants/:id/toggle-status
 */
const toggleMerchantStatus = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.params.id);
        if (!merchant) {
            return res.status(404).json({
                success: false,
                message: 'Merchant not found.',
            });
        }

        merchant.isActive = !merchant.isActive;
        await merchant.save();

        logAction('MERCHANT_STATUS_TOGGLED', {
            adminId: req.admin._id,
            merchantId: merchant._id,
            email: merchant.email,
            newStatus: merchant.isActive ? 'active' : 'suspended',
        });

        res.json({
            success: true,
            message: `Merchant ${merchant.isActive ? 'activated' : 'suspended'} successfully.`,
            merchant,
        });
    } catch (error) {
        console.error('Toggle merchant status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Renew Merchant Subscription
 * PATCH /api/admin/merchants/:id/renew
 */
const renewSubscription = async (req, res) => {
    try {
        const { months, customDate } = req.body;

        const merchant = await Merchant.findById(req.params.id);
        if (!merchant) {
            return res.status(404).json({
                success: false,
                message: 'Merchant not found.',
            });
        }

        let newEndDate;

        if (customDate) {
            newEndDate = new Date(customDate);
            if (isNaN(newEndDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date.',
                });
            }
        } else if (months && [1, 3, 6, 12].includes(parseInt(months))) {
            const now = new Date();
            // If subscription is still active, extend from current end date
            // If expired, start from today
            const baseDate =
                merchant.subscriptionEndsAt && merchant.subscriptionEndsAt > now
                    ? new Date(merchant.subscriptionEndsAt)
                    : now;
            newEndDate = new Date(baseDate);
            newEndDate.setMonth(newEndDate.getMonth() + parseInt(months));
        } else {
            return res.status(400).json({
                success: false,
                message: 'Provide months (1, 3, 6, 12) or customDate.',
            });
        }

        merchant.subscriptionEndsAt = newEndDate;
        await merchant.save();

        logAction('SUBSCRIPTION_RENEWED', {
            adminId: req.admin._id,
            merchantId: merchant._id,
            email: merchant.email,
            newEndDate: newEndDate.toISOString(),
            months: months || null,
        });

        res.json({
            success: true,
            message: 'Subscription renewed successfully.',
            merchant: merchant.toJSON(),
        });
    } catch (error) {
        console.error('Renew subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

/**
 * Get Admin Statistics
 * GET /api/admin/stats
 */
const getStats = async (req, res) => {
    try {
        const now = new Date();
        const graceDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

        const [
            totalMerchants,
            activeMerchants,
            totalCodesUnused,
            totalCodesUsed,
            subActive,
            subGrace,
        ] = await Promise.all([
            Merchant.countDocuments(),
            Merchant.countDocuments({ isActive: true }),
            ActivationCode.countDocuments({ isUsed: false, expiresAt: { $gt: now } }),
            ActivationCode.countDocuments({ isUsed: true }),
            // Subscription active: endsAt > now
            Merchant.countDocuments({ subscriptionEndsAt: { $gt: now } }),
            // Subscription grace: endsAt <= now AND endsAt > (now - 15 days)
            Merchant.countDocuments({
                subscriptionEndsAt: { $lte: now, $gt: graceDate },
            }),
        ]);

        const subExpired = totalMerchants - subActive - subGrace;

        res.json({
            success: true,
            stats: {
                totalMerchants,
                activeMerchants,
                suspendedMerchants: totalMerchants - activeMerchants,
                unusedCodes: totalCodesUnused,
                usedCodes: totalCodesUsed,
                subscriptionActive: subActive,
                subscriptionGrace: subGrace,
                subscriptionExpired: subExpired,
            },
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

module.exports = {
    initAdmin,
    adminLogin,
    generateCodes,
    getAllCodes,
    deleteCode,
    getAllMerchants,
    toggleMerchantStatus,
    renewSubscription,
    getStats,
};
