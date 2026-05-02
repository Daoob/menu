const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

/**
 * Seed the super admin account from environment variables.
 * Run: node utils/seedAdmin.js
 */
const seedAdmin = async () => {
    require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
    const mongoose = require('mongoose');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
        if (existingAdmin) {
            console.log('Admin already exists. Skipping seed.');
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
        await Admin.create({
            email: process.env.ADMIN_EMAIL,
            passwordHash,
        });

        console.log('✅ Super Admin created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
