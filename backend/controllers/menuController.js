const Merchant = require('../models/Merchant');
const Category = require('../models/Category');
const Product = require('../models/Product');

const GRACE_DAYS = 15;

/**
 * Check if a merchant's menu should be publicly visible.
 * Visible if: subscriptionEndsAt exists AND (active OR within grace period).
 */
function isMenuVisible(merchant) {
    if (!merchant.subscriptionEndsAt) return false;
    const now = new Date();
    if (merchant.subscriptionEndsAt > now) return true; // active
    const graceEnd = new Date(
        merchant.subscriptionEndsAt.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000
    );
    return now <= graceEnd; // within grace
}

/**
 * Get Public Menu by Slug
 * GET /api/menu/:slug
 */
const getMenuBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const merchant = await Merchant.findOne({ slug, isActive: true })
            .select('-passwordHash -refreshToken -__v');

        if (!merchant) {
            return res.status(404).json({
                success: false,
                message: 'Menu not found.',
            });
        }

        // Subscription check — hide menu if expired past grace period
        if (!isMenuVisible(merchant)) {
            return res.status(404).json({
                success: false,
                message: 'المنيو غير متاح حالياً.',
            });
        }

        const categories = await Category.find({
            merchant_id: merchant._id,
            isVisible: true,
        }).sort({ order: 1 });

        const products = await Product.find({
            merchant_id: merchant._id,
            isVisible: true,
        }).sort({ order: 1 });

        // Group products by category
        const menuData = categories.map((category) => ({
            _id: category._id,
            name_ar: category.name_ar,
            name_en: category.name_en,
            products: products.filter(
                (p) => p.category_id.toString() === category._id.toString()
            ),
        }));

        res.json({
            success: true,
            store: {
                storeName_ar: merchant.storeName_ar,
                storeName_en: merchant.storeName_en,
                logo: merchant.logo,
                coverImage: merchant.coverImage,
                whatsapp: merchant.whatsapp,
                language: merchant.language,
                theme: merchant.theme,
                social: merchant.social,
            },
            menu: menuData,
        });
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};

module.exports = { getMenuBySlug };
