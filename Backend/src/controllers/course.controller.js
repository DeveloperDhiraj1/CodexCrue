const courseService = require('../services/course.service');
const { ensureFreePublicCourses } = require('../services/publicCourseCatalog.service');
const sendResponse = require('../utils/response');

class CourseController {
  async getCourses(req, res, next) {
    try {
      await ensureFreePublicCourses();
      const result = await courseService.getAllCourses(req.query, { includeDrafts: req.authUser?.role === 'admin' });
      return sendResponse(res, 200, true, 'Courses retrieved successfully', result.items, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getCourse(req, res, next) {
    try {
      await ensureFreePublicCourses();
      const course = await courseService.getCourseById(req.params.id, { includeDrafts: req.authUser?.role === 'admin' });
      return sendResponse(res, 200, true, 'Course details retrieved', course);
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req, res, next) {
    try {
      const course = await courseService.createCourse(req.body);
      return sendResponse(res, 201, true, 'Course created successfully', course);
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req, res, next) {
    try {
      const course = await courseService.updateCourse(req.params.id, req.body);
      return sendResponse(res, 200, true, 'Course updated successfully', course);
    } catch (error) { next(error); }
  }

  async deleteCourse(req, res, next) {
    try {
      const course = await courseService.deleteCourse(req.params.id);
      return sendResponse(res, 200, true, 'Course deleted successfully', course);
    } catch (error) { next(error); }
  }

  async setCourseStatus(req, res, next) {
    try {
      const course = await courseService.setStatus(req.params.id, req.body.status);
      return sendResponse(res, 200, true, 'Course status updated successfully', course);
    } catch (error) { next(error); }
  }
}

module.exports = new CourseController();
