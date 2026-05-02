const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        merchant_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Merchant',
            required: true,
        },
        name_ar: {
            type: String,
            required: [true, 'Arabic name is required'],
            trim: true,
        },
        name_en: {
            type: String,
            required: [true, 'English name is required'],
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isVisible: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        strict: true,
    }
);

// Compound index for faster merchant queries
categorySchema.index({ merchant_id: 1, order: 1 });

module.exports = mongoose.model('Category', categorySchema);
