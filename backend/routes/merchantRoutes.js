const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const merchantAuth = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const upload = require('../middleware/upload');
const {
    getProfile,
    updateStore,
    updateTheme,
    uploadLogo,
    uploadCover,
    updateSlug,
    checkSlug,
} = require('../controllers/merchantController');

// All routes require merchant authentication + subscription check
router.use(merchantAuth);
router.use(checkSubscription);

// Profile
router.get('/profile', getProfile);

// Store Settings
router.put(
    '/store',
    [
        body('storeName_ar').optional().trim().isLength({ max: 100 }),
        body('storeName_en').optional().trim().isLength({ max: 100 }),
        body('whatsapp')
            .optional({ values: 'falsy' })
            .matches(/^05\d{8}$/)
            .withMessage('WhatsApp must be 10 digits starting with 05'),
        body('language')
            .optional()
            .isIn(['ar', 'en', 'both'])
            .withMessage('Language must be ar, en, or both'),
    ],
    handleValidation,
    updateStore
);

// Theme
router.put(
    '/theme',
    [
        body('selectedTheme')
            .optional()
            .isInt({ min: 1, max: 6 })
            .withMessage('Theme must be 1-6'),
        body('mode')
            .optional()
            .isIn(['light', 'dark', 'custom'])
            .withMessage('Mode must be light, dark, or custom'),
    ],
    handleValidation,
    updateTheme
);

// Image Uploads
router.post('/logo', upload.single('logo'), uploadLogo);
router.post('/cover', upload.single('cover'), uploadCover);

// Slug
router.put(
    '/slug',
    [
        body('slug')
            .trim()
            .notEmpty()
            .withMessage('Slug is required')
            .matches(/^[a-z0-9-]+$/)
            .withMessage('Slug can only contain lowercase letters, numbers, and hyphens')
            .isLength({ min: 3, max: 30 })
            .withMessage('Slug must be 3-30 characters'),
    ],
    handleValidation,
    updateSlug
);

router.get('/slug/check/:slug', checkSlug);

module.exports = router;
