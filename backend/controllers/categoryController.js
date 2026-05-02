const Category = require('../models/Category');
const Product = require('../models/Product');
const { validateOwnership } = require('../middleware/tenantGuard');
const xss = require('xss');

/**
 * Get All Categories for Merchant
 * GET /api/categories
 */
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ merchant_id: req.merchant._id })
            .sort({ order: 1 });

        res.json({ success: true, categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Create Category
 * POST /api/categories
 */
const createCategory = async (req, res) => {
    try {
        const { name_ar, name_en } = req.body;

        // Get next order
        const maxOrder = await Category.findOne({ merchant_id: req.merchant._id })
            .sort({ order: -1 })
            .select('order');

        const category = await Category.create({
            merchant_id: req.merchant._id,
            name_ar: xss(name_ar),
            name_en: xss(name_en),
            order: maxOrder ? maxOrder.order + 1 : 0,
        });

        res.status(201).json({
            success: true,
            message: 'Category created.',
            category,
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Update Category
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || !validateOwnership(category, req.merchant._id)) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        const { name_ar, name_en, isVisible } = req.body;

        if (name_ar !== undefined) category.name_ar = xss(name_ar);
        if (name_en !== undefined) category.name_en = xss(name_en);
        if (isVisible !== undefined) category.isVisible = isVisible;

        await category.save();

        res.json({ success: true, message: 'Category updated.', category });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Delete Category
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category || !validateOwnership(category, req.merchant._id)) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        // Delete all products in this category
        await Product.deleteMany({ category_id: category._id });

        await Category.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Category and its products deleted.' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Reorder Categories
 * PUT /api/categories/reorder
 */
const reorderCategories = async (req, res) => {
    try {
        const { orderedIds } = req.body; // Array of category IDs in new order

        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ success: false, message: 'orderedIds must be an array.' });
        }

        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, merchant_id: req.merchant._id },
                update: { order: index },
            },
        }));

        await Category.bulkWrite(bulkOps);

        res.json({ success: true, message: 'Categories reordered.' });
    } catch (error) {
        console.error('Reorder categories error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
};
