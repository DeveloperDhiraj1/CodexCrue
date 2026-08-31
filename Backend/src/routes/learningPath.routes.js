const express = require('express');
const router = express.Router();
const learningPathController = require('../controllers/learningPath.controller');
const protect = require('../middleware/auth.middleware');

router.get('/', protect, learningPathController.getPath);
router.post('/generate', protect, learningPathController.generatePath);

module.exports = router;