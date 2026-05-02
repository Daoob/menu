const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        ownerName: {
            type: String,
            trim: true,
            default: '',
        },
        phone: {
            type: String,
            trim: true,
            default: '',
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
        },
        refreshToken: {
            type: String,
            default: null,
        },
        slug: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },
        storeName_ar: {
            type: String,
            trim: true,
            default: '',
        },
        storeName_en: {
            type: String,
            trim: true,
            default: '',
        },
        logo: {
            type: String,
            default: null,
        },
        coverImage: {
            type: String,
            default: null,
        },
        whatsapp: {
            type: String,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^05\d{8}$/.test(v);
                },
                message: 'WhatsApp number must be 10 digits and start with 05',
            },
            default: null,
        },
        language: {
            type: String,
            enum: ['ar', 'en', 'both'],
            default: 'both',
        },
        theme: {
            selectedTheme: {
                type: Number,
                min: 1,
                max: 6,
                default: 1,
            },
            mode: {
                type: String,
                enum: ['light', 'dark', 'custom'],
                default: 'light',
            },
            customColors: {
                primary: { type: String, default: null },
                secondary: { type: String, default: null },
                background: { type: String, default: null },
                text: { type: String, default: null },
            },
        },
        social: {
            snapchat: { type: String, trim: true, default: '' },
            instagram: { type: String, trim: true, default: '' },
            tiktok: { type: String, trim: true, default: '' },
            x: { type: String, trim: true, default: '' },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        // Subscription
        subscriptionEndsAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        strict: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: compute subscription status from subscriptionEndsAt
const GRACE_DAYS = 15;
merchantSchema.virtual('subscriptionStatus').get(function () {
    if (!this.subscriptionEndsAt) return 'expired';
    const now = new Date();
    if (this.subscriptionEndsAt > now) return 'active';
    const graceEnd = new Date(
        this.subscriptionEndsAt.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000
    );
    if (now <= graceEnd) return 'grace';
    return 'expired';
});

// Indexes
merchantSchema.index({ slug: 1 });
merchantSchema.index({ email: 1 });
merchantSchema.index({ subscriptionEndsAt: 1 });

// Remove sensitive fields from JSON output (include virtuals)
merchantSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: true });
    delete obj.passwordHash;
    delete obj.refreshToken;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Merchant', merchantSchema);
