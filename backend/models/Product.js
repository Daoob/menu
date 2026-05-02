const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        merchant_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Merchant',
            required: true,
        },
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        name_ar: {
            type: String,
            required: [true, 'Arabic product name is required'],
            trim: true,
        },
        name_en: {
            type: String,
            trim: true,
            default: '',
        },
        description_ar: {
            type: String,
            trim: true,
            default: '',
        },
        description_en: {
            type: String,
            trim: true,
            default: '',
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        image: {
            type: String,
            default: null, // Cloudinary URL — optional
        },
        isVisible: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        strict: true,
    }
);

// Compound indexes for faster queries
productSchema.index({ merchant_id: 1, category_id: 1, order: 1 });
productSchema.index({ category_id: 1, order: 1 });

module.exports = mongoose.model('Product', productSchema);
