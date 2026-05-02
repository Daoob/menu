const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const merchantAuth = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');
const upload = require('../middleware/upload');
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProduct,
    reorderProducts,
} = require('../controllers/productController');

// All routes require merchant authentication + subscription check
router.use(merchantAuth);
router.use(checkSubscription);

router.get('/', getProducts);

router.post(
    '/',
    upload.single('image'),
    [
        body('category_id').notEmpty().withMessage('Category is required'),
        body('name_ar').trim().notEmpty().withMessage('Arabic name is required'),
        body('price')
            .notEmpty()
            .withMessage('Price is required')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),
    ],
    handleValidation,
    createProduct
);

router.put(
    '/:id',
    upload.single('image'),
    [
        body('name_ar').optional().trim().notEmpty(),
        body('price').optional().isFloat({ min: 0 }),
        body('isVisible').optional().isBoolean(),
    ],
    handleValidation,
    updateProduct
);

router.delete('/:id', deleteProduct);
router.patch('/:id/toggle', toggleProduct);

router.put(
    '/reorder',
    [body('orderedIds').isArray().withMessage('orderedIds must be an array')],
    handleValidation,
    reorderProducts
);

module.exports = router;
