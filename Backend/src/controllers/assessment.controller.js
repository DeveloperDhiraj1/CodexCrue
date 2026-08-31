const assessmentService = require('../services/assessment.service');
const sendResponse = require('../utils/response');

class AssessmentController {
  async listAssessments(req, res, next) {
    try {
      return sendResponse(res, 200, true, 'Assessments retrieved', await assessmentService.listAssessments());
    } catch (error) { return next(error); }
  }

  async getAssessment(req, res, next) {
    try {
      const assessment = await assessmentService.getAssessmentById(req.params.id);
      if (assessment) {
        assessment.questions = assessment.questions.map(({ questionText, options }) => ({ questionText, options }));
      }
      return sendResponse(res, 200, true, 'Assessment retrieved', assessment);
    } catch (error) {
      next(error);
    }
  }

  async submitAssessment(req, res, next) {
    try {
      const { answers } = req.body; // Array of selected options
      const result = await assessmentService.evaluateAssessment(req.user.id, req.params.id, answers);
      return sendResponse(res, 200, true, 'Assessment evaluated successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssessmentController();
