const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const merchantAuth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
    register,
    login,
    refreshTokenHandler,
    logout,
    changePassword,
    getMe,
} = require('../controllers/authController');

// Register (with activation code)
router.post(
    '/register',
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain uppercase, lowercase, and number'),
        body('code')
            .trim()
            .notEmpty()
            .withMessage('Activation code is required')
            .isLength({ min: 16, max: 16 })
            .withMessage('Activation code must be 16 characters'),
    ],
    handleValidation,
    register
);

// Login
router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    handleValidation,
    login
);

// Refresh Token
router.post('/refresh', refreshTokenHandler);

// Protected routes
router.post('/logout', merchantAuth, logout);

router.put(
    '/change-password',
    merchantAuth,
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('New password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain uppercase, lowercase, and number'),
    ],
    handleValidation,
    changePassword
);

router.get('/me', merchantAuth, getMe);

module.exports = router;
