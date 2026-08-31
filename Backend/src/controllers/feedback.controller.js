const feedbackService = require('../services/feedback.service');
const sendResponse = require('../utils/response');

class FeedbackController {
  async submitFeedback(req, res, next) {
    try {
      const feedback = await feedbackService.submitFeedback(req.user.id, req.body);
      return sendResponse(res, 201, true, 'Feedback recorded successfully. Recommendations will adapt.', feedback);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeedbackController();