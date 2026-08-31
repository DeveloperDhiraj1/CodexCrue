const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const protect = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimit.middleware');
const { validateChatMessage } = require('../validators/ai.validator');

router.post('/chat', protect, aiLimiter, validateChatMessage, aiController.chat);
router.get('/history', protect, aiController.history);
router.delete('/history', protect, aiController.clearHistory);

module.exports = router;
