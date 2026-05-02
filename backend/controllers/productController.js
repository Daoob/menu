const Product = require('../models/Product');
const Category = require('../models/Category');
const { validateOwnership } = require('../middleware/tenantGuard');
const xss = require('xss');

const isCloudinaryConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';

function getFileUrl(file) {
    if (file.path && file.path.startsWith('http')) return file.path;
    return `/uploads/${file.filename}`;
}

/**
 * Get All Products for Merchant
 * GET /api/products
 */
const getProducts = async (req, res) => {
    try {
        const { category_id } = req.query;
        const query = { merchant_id: req.merchant._id };
        if (category_id) query.category_id = category_id;

        const products = await Product.find(query).sort({ order: 1 });

        res.json({ success: true, products });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Create Product
 * POST /api/products
 */
const createProduct = async (req, res) => {
    try {
        const { category_id, name_ar, name_en, description_ar, description_en, price } = req.body;

        // Verify category belongs to merchant
        const category = await Category.findById(category_id);
        if (!category || !validateOwnership(category, req.merchant._id)) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        // Get next order
        const maxOrder = await Product.findOne({
            merchant_id: req.merchant._id,
            category_id,
        })
            .sort({ order: -1 })
            .select('order');

        const productData = {
            merchant_id: req.merchant._id,
            category_id,
            name_ar: xss(name_ar),
            name_en: name_en ? xss(name_en) : '',
            description_ar: description_ar ? xss(description_ar) : '',
            description_en: description_en ? xss(description_en) : '',
            price: parseFloat(price),
            order: maxOrder ? maxOrder.order + 1 : 0,
        };

        // Handle image if uploaded
        if (req.file) {
            productData.image = getFileUrl(req.file);
        }

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            message: 'Product created.',
            product,
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Update Product
 * PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product || !validateOwnership(product, req.merchant._id)) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const { name_ar, name_en, description_ar, description_en, price, isVisible, category_id } =
            req.body;

        if (name_ar !== undefined) product.name_ar = xss(name_ar);
        if (name_en !== undefined) product.name_en = xss(name_en);
        if (description_ar !== undefined) product.description_ar = xss(description_ar);
        if (description_en !== undefined) product.description_en = xss(description_en);
        if (price !== undefined) product.price = parseFloat(price);
        if (isVisible !== undefined) product.isVisible = isVisible;
        if (category_id !== undefined) product.category_id = category_id;

        // Handle new image upload
        if (req.file) {
            // Delete old image from Cloudinary if applicable
            if (isCloudinaryConfigured && product.image && product.image.startsWith('http')) {
                try {
                    const cloudinary = require('../config/cloudinary');
                    const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch { }
            }
            product.image = getFileUrl(req.file);
        }

        await product.save();

        res.json({ success: true, message: 'Product updated.', product });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Delete Product
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product || !validateOwnership(product, req.merchant._id)) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        // Delete image from Cloudinary if applicable
        if (isCloudinaryConfigured && product.image && product.image.startsWith('http')) {
            try {
                const cloudinary = require('../config/cloudinary');
                const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch { }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Product deleted.' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Toggle Product Visibility
 * PATCH /api/products/:id/toggle
 */
const toggleProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product || !validateOwnership(product, req.merchant._id)) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        product.isVisible = !product.isVisible;
        await product.save();

        res.json({
            success: true,
            message: `Product ${product.isVisible ? 'shown' : 'hidden'}.`,
            product,
        });
    } catch (error) {
        console.error('Toggle product error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Reorder Products
 * PUT /api/products/reorder
 */
const reorderProducts = async (req, res) => {
    try {
        const { orderedIds } = req.body;

        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ success: false, message: 'orderedIds must be an array.' });
        }

        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id, merchant_id: req.merchant._id },
                update: { order: index },
            },
        }));

        await Product.bulkWrite(bulkOps);

        res.json({ success: true, message: 'Products reordered.' });
    } catch (error) {
        console.error('Reorder products error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProduct,
    reorderProducts,
};
