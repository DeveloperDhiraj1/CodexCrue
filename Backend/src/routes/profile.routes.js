const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const protect = require('../middleware/auth.middleware');
const { validateProfileUpdate } = require('../validators/profile.validator');

router.get('/', protect, profileController.getProfile);
router.put('/', protect, validateProfileUpdate, profileController.updateProfile);
router.post('/onboarding', protect, profileController.completeOnboarding);

module.exports = router;
