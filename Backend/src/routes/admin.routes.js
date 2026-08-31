const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const protect = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.get('/dashboard', protect, adminOnly, adminController.getDashboardStats);
router.get('/analytics', protect, adminOnly, adminController.getAnalytics);

module.exports = router;
