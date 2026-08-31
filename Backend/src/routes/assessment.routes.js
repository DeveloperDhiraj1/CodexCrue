const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessment.controller');
const protect = require('../middleware/auth.middleware');
const { validateAssessmentAnswers } = require('../validators/assessment.validator');

router.get('/', protect, assessmentController.listAssessments);
router.get('/:id', protect, assessmentController.getAssessment);
router.post('/:id/submit', protect, validateAssessmentAnswers, assessmentController.submitAssessment);

module.exports = router;
