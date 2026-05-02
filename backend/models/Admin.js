const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: [true, 'Password is required'],
        },
    },
    {
        timestamps: true,
        strict: true,
    }
);

// Remove sensitive fields from JSON output
adminSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Admin', adminSchema);
