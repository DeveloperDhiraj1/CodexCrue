const learningPathService = require('../services/learningPath.service');
const profileService = require('../services/profile.service');
const goalService = require('../services/goal.service');
const sendResponse = require('../utils/response');

class LearningPathController {
  async getPath(req, res, next) {
    try {
      const path = await learningPathService.getPathByUserId(req.user.id);
      return sendResponse(res, 200, true, 'Learning path retrieved successfully', path);
    } catch (error) {
      next(error);
    }
  }

  async generatePath(req, res, next) {
    try {
      const existingProfile = await profileService.getProfileByUserId(req.user.id);
      if (!existingProfile) {
        return sendResponse(res, 404, false, 'Learner profile not found. Please complete onboarding first.', null);
      }

      const body = req.body || {};
      const title = String(body.goalTitle || body.learningGoal || existingProfile.learningGoal || '').trim();
      const careerTarget = String(body.careerTarget || body.careerGoal || existingProfile.careerGoal || '').trim();
      if (!title || !careerTarget) return sendResponse(res, 400, false, 'Goal title and career target are required to generate a learning path.', null);
      const languageMap = { english: 'en', hindi: 'hi', hinglish: 'hinglish', en: 'en', hi: 'hi' };
      const preferredLanguage = languageMap[String(body.language || '').trim().toLowerCase()] || existingProfile.preferredLanguage || 'en';
      const interests = body.interests === undefined ? existingProfile.interests : String(body.interests).split(',').map((item) => item.trim()).filter(Boolean);
      const weeklyHours = Number(body.weeklyHours || body.weeklyLearningHours || 0);
      const profile = await profileService.createOrUpdateProfile(req.user.id, { learningGoal: title, careerGoal: careerTarget, interests, preferredLanguage, ...(weeklyHours > 0 ? { availableHoursPerDay: Math.min(24, weeklyHours / 7) } : {}) });
      const goal = await goalService.getGoal(req.user.id);
      const goalData = { title, careerTarget, ...(body.targetDate ? { targetDate: body.targetDate } : {}), weeklyLearningHours: weeklyHours > 0 ? weeklyHours : Math.max(1, Math.round(Number(profile.availableHoursPerDay || 2) * 7)) };
      if (goal) await goalService.updateGoal(req.user.id, goalData);
      else await goalService.createGoal(req.user.id, goalData);

      const path = await learningPathService.generateAndSavePath(req.user.id, profile);
      return sendResponse(res, 201, true, 'Learning path generated successfully', path);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LearningPathController();
