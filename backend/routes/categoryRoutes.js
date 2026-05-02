const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const merchantAuth = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
} = require('../controllers/categoryController');

// All routes require merchant authentication + subscription check
router.use(merchantAuth);
router.use(checkSubscription);

router.get('/', getCategories);

router.post(
    '/',
    [
        body('name_ar').trim().notEmpty().withMessage('Arabic name is required'),
        body('name_en').trim().notEmpty().withMessage('English name is required'),
    ],
    handleValidation,
    createCategory
);

router.put(
    '/:id',
    [
        body('name_ar').optional().trim().notEmpty(),
        body('name_en').optional().trim().notEmpty(),
        body('isVisible').optional().isBoolean(),
    ],
    handleValidation,
    updateCategory
);

router.delete('/:id', deleteCategory);

router.put(
    '/reorder',
    [body('orderedIds').isArray().withMessage('orderedIds must be an array')],
    handleValidation,
    reorderCategories
);

module.exports = router;
