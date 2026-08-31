const profileService = require('../services/profile.service');
const learningResourceService = require('../services/learningResource.service');
const sendResponse = require('../utils/response');

class LearningResourceController {
  async recommend(req, res, next) {
    try { const profile = await profileService.getProfileByUserId(req.user.id); if (!profile) return sendResponse(res, 404, false, 'Complete your profile to receive resource recommendations.', null); const resources = await learningResourceService.recommendForProfile(profile); return sendResponse(res, 200, true, 'External learning resources recommended.', resources); } catch (error) { next(error); }
  }

  async import(req, res, next) {
    try { if (!Array.isArray(req.body.resources) || req.body.resources.length > 500) return sendResponse(res, 400, false, 'Provide up to 500 learning resources.', null); const count = await learningResourceService.importResources(req.body.resources); return sendResponse(res, 200, true, 'Learning resources imported.', { publishedResources: count }); } catch (error) { next(error); }
  }
}

module.exports = new LearningResourceController();
