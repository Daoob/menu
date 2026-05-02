/**
 * Migration Script: Set subscriptionEndsAt for existing merchants.
 * Sets 30 days from now for all merchants who don't have a subscription date.
 *
 * Usage: npm run migrate:subscription
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Merchant = require('../models/Merchant');

async function migrate() {
    await connectDB();

    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const result = await Merchant.updateMany(
        { subscriptionEndsAt: null },
        { $set: { subscriptionEndsAt: thirtyDaysFromNow } }
    );

    console.log(`✅ Updated ${result.modifiedCount} merchant(s) → subscriptionEndsAt = ${thirtyDaysFromNow.toISOString()}`);
    console.log(`   (${result.matchedCount} matched, ${result.modifiedCount} modified)`);

    await mongoose.disconnect();
    process.exit(0);
}

migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
