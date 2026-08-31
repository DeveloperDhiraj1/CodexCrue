const express = require('express');
const router = express.Router();
const controller = require('../controllers/learningResource.controller');
const protect = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.get('/recommended', protect, controller.recommend);
router.post('/import', protect, adminOnly, controller.import);

module.exports = router;
