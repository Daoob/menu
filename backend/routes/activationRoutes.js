const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateCode, recordFailedAttempt } = require('../controllers/activationController');

// Validate activation code
router.post(
    '/validate',
    authLimiter,
    [
        body('code')
            .trim()
            .notEmpty()
            .withMessage('Activation code is required')
            .isLength({ min: 16, max: 16 })
            .withMessage('Activation code must be 16 characters'),
    ],
    handleValidation,
    validateCode
);

// Record failed attempt (called from frontend)
router.post(
    '/failed',
    authLimiter,
    [body('code').trim().notEmpty().withMessage('Code is required')],
    handleValidation,
    recordFailedAttempt
);

module.exports = router;
