const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const protect = require('../middleware/auth.middleware');

router.get('/', protect, recommendationController.getRecommendations);

module.exports = router;