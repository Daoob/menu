const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check if Cloudinary is properly configured
const isCloudinaryConfigured =
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

let storage;

if (isCloudinaryConfigured) {
    // Use Cloudinary storage
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const cloudinary = require('../config/cloudinary');
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'digital-menu',
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
            transformation: [
                { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
            ],
        },
    });
} else {
    // Use local disk storage (fallback)
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname) || '.jpg';
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    });
}

// File filter — only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, PNG, WebP, SVG) are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max
    },
});

module.exports = upload;
