const express = require('express');
const router = express.Router();
const skillGapController = require('../controllers/skillGap.controller');
const protect = require('../middleware/auth.middleware');

router.get('/', protect, skillGapController.getSkillGap);

module.exports = router;