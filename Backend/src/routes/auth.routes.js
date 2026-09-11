const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');
const { verifyFirebaseToken } = protect;
const { authLimiter, recoveryLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authLimiter, verifyFirebaseToken({ requireVerified: false }), authController.register);
router.post('/sync', authLimiter, verifyFirebaseToken({ requireVerified: false }), authController.sync);
router.get('/me', protect, authController.me);
// Firebase sign-out happens in the browser; this endpoint remains idempotent for existing clients.
router.post('/logout', recoveryLimiter, authController.logout);

module.exports = router;
