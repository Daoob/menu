const mongoose = require('mongoose');

const activationCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            minlength: 16,
            maxlength: 16,
        },
        isUsed: {
            type: Boolean,
            default: false,
        },
        usedAt: {
            type: Date,
            default: null,
        },
        usedByEmail: {
            type: String,
            default: null,
            lowercase: true,
            trim: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        failedAttempts: {
            type: Number,
            default: 0,
        },
        lockedUntil: {
            type: Date,
            default: null,
        },
        attemptLogs: [
            {
                ip: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                _id: false,
            },
        ],
    },
    {
        timestamps: true,
        strict: true,
    }
);

// Index for fast lookups and auto-cleanup
activationCodeSchema.index({ code: 1 });
activationCodeSchema.index({ expiresAt: 1 });

// Virtual to check if code is expired
activationCodeSchema.virtual('isExpired').get(function () {
    return new Date() > this.expiresAt;
});

// Virtual to check if code is currently locked
activationCodeSchema.virtual('isLocked').get(function () {
    return this.lockedUntil && new Date() < this.lockedUntil;
});

// Method to calculate lock duration based on failed attempts
activationCodeSchema.methods.getLockDuration = function () {
    const attempts = this.failedAttempts;
    if (attempts < 3) return 0;
    if (attempts === 3) return 5 * 60 * 1000;      // 5 minutes
    if (attempts === 4) return 15 * 60 * 1000;     // 15 minutes
    if (attempts === 5) return 60 * 60 * 1000;     // 60 minutes
    return 3 * 60 * 60 * 1000;                      // 3 hours (max)
};

module.exports = mongoose.model('ActivationCode', activationCodeSchema);
