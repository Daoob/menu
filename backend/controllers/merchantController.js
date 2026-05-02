const Merchant = require('../models/Merchant');
const path = require('path');
const xss = require('xss');

const isCloudinaryConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';

// Get the public URL for an uploaded file
function getFileUrl(file) {
    // Cloudinary gives a full URL in file.path
    if (file.path && file.path.startsWith('http')) return file.path;
    // Local disk storage: return /uploads/filename
    return `/uploads/${file.filename}`;
}

/**
 * Get Merchant Profile
 * GET /api/merchant/profile
 */
const getProfile = async (req, res) => {
    try {
        const merchant = await Merchant.findById(req.merchant._id);
        res.json({
            success: true,
            merchant: merchant.toJSON(),
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Update Store Settings
 * PUT /api/merchant/store
 */
const updateStore = async (req, res) => {
    try {
        const {
            storeName_ar,
            storeName_en,
            whatsapp,
            language,
            social,
            ownerName,
            phone,
        } = req.body;

        const merchant = await Merchant.findById(req.merchant._id);

        if (ownerName !== undefined) merchant.ownerName = xss(ownerName);
        if (phone !== undefined) merchant.phone = xss(phone);
        if (storeName_ar !== undefined) merchant.storeName_ar = xss(storeName_ar);
        if (storeName_en !== undefined) merchant.storeName_en = xss(storeName_en);
        if (whatsapp !== undefined) merchant.whatsapp = whatsapp;
        if (language !== undefined) merchant.language = language;

        if (social) {
            if (social.snapchat !== undefined) merchant.social.snapchat = xss(social.snapchat);
            if (social.instagram !== undefined) merchant.social.instagram = xss(social.instagram);
            if (social.tiktok !== undefined) merchant.social.tiktok = xss(social.tiktok);
            if (social.x !== undefined) merchant.social.x = xss(social.x);
        }

        await merchant.save();

        res.json({
            success: true,
            message: 'Store settings updated.',
            merchant: merchant.toJSON(),
        });
    } catch (error) {
        console.error('Update store error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Update Theme
 * PUT /api/merchant/theme
 */
const updateTheme = async (req, res) => {
    try {
        const { selectedTheme, mode, customColors } = req.body;

        const merchant = await Merchant.findById(req.merchant._id);

        if (selectedTheme !== undefined) merchant.theme.selectedTheme = selectedTheme;
        if (mode !== undefined) merchant.theme.mode = mode;

        if (customColors && mode === 'custom') {
            merchant.theme.customColors = {
                primary: customColors.primary || null,
                secondary: customColors.secondary || null,
                background: customColors.background || null,
                text: customColors.text || null,
            };
        }

        await merchant.save();

        res.json({
            success: true,
            message: 'Theme updated.',
            theme: merchant.theme,
        });
    } catch (error) {
        console.error('Update theme error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Upload Logo
 * POST /api/merchant/logo
 */
const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided.' });
        }

        const merchant = await Merchant.findById(req.merchant._id);

        // Delete old logo from Cloudinary if applicable
        if (isCloudinaryConfigured && merchant.logo && merchant.logo.startsWith('http')) {
            try {
                const cloudinary = require('../config/cloudinary');
                const publicId = merchant.logo.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch { }
        }

        merchant.logo = getFileUrl(req.file);
        await merchant.save();

        res.json({
            success: true,
            message: 'Logo uploaded.',
            logo: merchant.logo,
        });
    } catch (error) {
        console.error('Upload logo error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Upload Cover Image
 * POST /api/merchant/cover
 */
const uploadCover = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided.' });
        }

        const merchant = await Merchant.findById(req.merchant._id);

        // Delete old cover from Cloudinary if applicable
        if (isCloudinaryConfigured && merchant.coverImage && merchant.coverImage.startsWith('http')) {
            try {
                const cloudinary = require('../config/cloudinary');
                const publicId = merchant.coverImage.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch { }
        }

        merchant.coverImage = getFileUrl(req.file);
        await merchant.save();

        res.json({
            success: true,
            message: 'Cover image uploaded.',
            coverImage: merchant.coverImage,
        });
    } catch (error) {
        console.error('Upload cover error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Set / Update Slug
 * PUT /api/merchant/slug
 */
const updateSlug = async (req, res) => {
    try {
        const { slug } = req.body;
        const sanitizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

        if (sanitizedSlug.length < 3 || sanitizedSlug.length > 30) {
            return res.status(400).json({
                success: false,
                message: 'Slug must be between 3 and 30 characters.',
            });
        }

        // Check availability
        const existing = await Merchant.findOne({
            slug: sanitizedSlug,
            _id: { $ne: req.merchant._id },
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'This slug is already taken.',
            });
        }

        const merchant = await Merchant.findById(req.merchant._id);
        merchant.slug = sanitizedSlug;
        await merchant.save();

        res.json({
            success: true,
            message: 'Slug updated.',
            slug: merchant.slug,
        });
    } catch (error) {
        console.error('Update slug error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

/**
 * Check Slug Availability
 * GET /api/merchant/slug/check/:slug
 */
const checkSlug = async (req, res) => {
    try {
        const slug = req.params.slug.toLowerCase().trim();
        const existing = await Merchant.findOne({
            slug,
            _id: { $ne: req.merchant?._id },
        });

        res.json({
            success: true,
            available: !existing,
        });
    } catch (error) {
        console.error('Check slug error:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

module.exports = {
    getProfile,
    updateStore,
    updateTheme,
    uploadLogo,
    uploadCover,
    updateSlug,
    checkSlug,
};
