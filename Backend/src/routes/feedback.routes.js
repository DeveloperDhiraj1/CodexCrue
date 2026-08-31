const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const protect = require('../middleware/auth.middleware');
const { validateFeedback } = require('../validators/feedback.validator');

router.post('/', protect, validateFeedback, feedbackController.submitFeedback);

module.exports = router;
