const recommendationService = require('../services/recommendation.service');
const profileService = require('../services/profile.service');
const sendResponse = require('../utils/response');

class RecommendationController {
  async getRecommendations(req, res, next) {
    try {
      const profile = await profileService.getProfileByUserId(req.user.id);
      if (!profile) {
        return sendResponse(res, 404, false, 'Profile required to generate recommendations', null);
      }
      const recommendations = await recommendationService.getRecommendationsForUser(req.user.id, profile);
      const response = recommendations.map((item) => ({
        ...item,
        courseId: item.courseDetails || item.courseId
      }));
      return sendResponse(res, 200, true, 'Recommendations fetched successfully', response);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();
