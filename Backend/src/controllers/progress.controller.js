const progressService = require('../services/progress.service');
const sendResponse = require('../utils/response');

class ProgressController {
  async getProgress(req, res, next) {
    try {
      const progress = await progressService.getUserProgress(req.user.id);
      return sendResponse(res, 200, true, 'User progress retrieved successfully', progress);
    } catch (error) {
      next(error);
    }
  }

  async getStudySessions(req, res, next) {
    try {
      const sessions = await progressService.getStudySessions(req.user.id);
      return sendResponse(res, 200, true, 'Study sessions retrieved successfully', sessions);
    } catch (error) {
      next(error);
    }
  }

  async logStudySession(req, res, next) {
    try {
      const result = await progressService.logStudySession(req.user.id, req.body);
      return sendResponse(res, 201, true, 'Study session logged and progress updated', result);
    } catch (error) {
      next(error);
    }
  }

  async updateCourseProgress(req, res, next) {
    try {
      const { courseId, status, completionPercentage, timeSpentHours } = req.body;
      const progress = await progressService.updateProgress(req.user.id, courseId, {
        status,
        completionPercentage,
        timeSpentHours
      });
      return sendResponse(res, 200, true, 'Progress updated successfully', progress);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProgressController();
