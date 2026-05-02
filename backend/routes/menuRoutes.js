const router = require('express').Router();
const { getMenuBySlug } = require('../controllers/menuController');

// Public route — no auth required
router.get('/:slug', getMenuBySlug);

module.exports = router;
