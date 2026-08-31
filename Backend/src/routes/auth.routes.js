const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validateEmail, validateOTP, validatePasswordReset } = require('../validators/auth.validator');
const { authLimiter, verificationLimiter, recoveryLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
router.post('/refresh', recoveryLimiter, authController.refresh);
router.post('/verify-otp', verificationLimiter, validateOTP, authController.verifyOTP);
// Keep the older endpoint name working for clients that still submit email verification codes here.
router.post('/verify-email', verificationLimiter, validateOTP, authController.verifyOTP);
router.post('/forgot-password', recoveryLimiter, validateEmail, authController.forgotPassword);
router.post('/reset-password/:token', recoveryLimiter, validatePasswordReset, authController.resetPassword);

module.exports = router;
