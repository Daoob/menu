const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const adminAuth = require('../middleware/adminAuth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    adminLogin,
    generateCodes,
    getAllCodes,
    deleteCode,
    getAllMerchants,
    toggleMerchantStatus,
    renewSubscription,
    getStats,
} = require('../controllers/adminController');

// Admin Login
router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    handleValidation,
    adminLogin
);

// Protected admin routes
router.use(adminAuth);

// Codes
router.post(
    '/codes/generate',
    [body('count').optional().isInt({ min: 1, max: 50 }).withMessage('Count must be 1-50')],
    handleValidation,
    generateCodes
);
router.get('/codes', getAllCodes);
router.delete('/codes/:id', deleteCode);

// Merchants
router.get('/merchants', getAllMerchants);
router.patch('/merchants/:id/toggle-status', toggleMerchantStatus);

// Subscription Renewal
router.patch(
    '/merchants/:id/renew',
    [
        body('months')
            .optional()
            .isInt({ min: 1, max: 12 })
            .withMessage('months must be 1, 3, 6, or 12'),
        body('customDate')
            .optional()
            .isISO8601()
            .withMessage('customDate must be a valid date'),
    ],
    handleValidation,
    renewSubscription
);

// Stats
router.get('/stats', getStats);

module.exports = router;
