require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');
const { globalLimiter } = require('./middleware/rateLimiter');

// Route imports
const adminRoutes = require('./routes/adminRoutes');
const activationRoutes = require('./routes/activationRoutes');
const authRoutes = require('./routes/authRoutes');
const merchantRoutes = require('./routes/merchantRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Auto-seed admin from environment variables
const seedAdminIfNeeded = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password) {
            console.log('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed.');
            return;
        }
        const existing = await Admin.findOne({ email: email.toLowerCase() });
        if (existing) {
            console.log('ℹ️  Admin account already exists.');
            return;
        }
        const passwordHash = await bcrypt.hash(password, 12);
        await Admin.create({ email: email.toLowerCase(), passwordHash });
        console.log(`✅ Admin account created: ${email}`);
    } catch (err) {
        console.error('❌ Failed to seed admin:', err.message);
    }
};

// Connect to MongoDB then seed admin
const startServer = async () => {
    await connectDB();
    await seedAdminIfNeeded();
};
startServer();

// Security middleware
app.use(helmet());
app.use(
    cors({
        origin: (origin, callback) => {
            // In development, allow ALL origins (enables mobile/LAN testing)
            if (process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }
            // In production, only allow configured CLIENT_URL(s)
            const allowed = (process.env.CLIENT_URL || '')
                .split(',')
                .map((u) => u.trim())
                .filter(Boolean);
            if (!origin || allowed.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS: origin "${origin}" not allowed.`));
        },
        credentials: true,
    })
);

// Global rate limiter
app.use(globalLimiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Trust proxy (for rate limiter behind Nginx)
app.set('trust proxy', 1);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/activation', activationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/merchant', merchantRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menu', menuRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB.',
        });
    }

    res.status(500).json({
        success: false,
        message:
            process.env.NODE_ENV === 'production'
                ? 'Internal server error.'
                : err.message,
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
