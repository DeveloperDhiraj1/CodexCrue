const express = require('express');
const protect = require('../middleware/auth.middleware');
const controller = require('../controllers/reward.controller');

const router = express.Router();
router.get('/', protect, controller.list);
router.get('/badges', protect, controller.badges);
module.exports = router;
