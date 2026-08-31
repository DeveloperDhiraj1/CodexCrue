const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const protect = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const { validateCourse, validateCourseUpdate } = require('../validators/course.validator');
const optionalAuth = require('../middleware/optionalAuth.middleware');

router.get('/', optionalAuth, courseController.getCourses);
router.get('/:id', optionalAuth, courseController.getCourse);
router.post('/', protect, adminOnly, validateCourse, courseController.createCourse);
router.put('/:id', protect, adminOnly, validateCourseUpdate, courseController.updateCourse);
router.delete('/:id', protect, adminOnly, courseController.deleteCourse);
router.patch('/:id/status', protect, adminOnly, validateCourseUpdate, courseController.setCourseStatus);

module.exports = router;
