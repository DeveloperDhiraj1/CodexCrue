const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progress.controller');
const protect = require('../middleware/auth.middleware');
const { validateProgressUpdate } = require('../validators/progress.validator');
const { validateStudySession } = require('../validators/studySession.validator');

router.get('/', protect, progressController.getProgress);
router.get('/sessions', protect, progressController.getStudySessions);
router.post('/session', protect, validateStudySession, progressController.logStudySession);
router.post('/course', protect, validateProgressUpdate, progressController.updateCourseProgress);

module.exports = router;
