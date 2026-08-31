const skillGapService = require('../services/skillGap.service');
const profileService = require('../services/profile.service');
const sendResponse = require('../utils/response');

class SkillGapController {
  async getSkillGap(req, res, next) {
    try {
      const profile = await profileService.getProfileByUserId(req.user.id);
      if (!profile) {
        return sendResponse(res, 404, false, 'Learner profile not found. Complete onboarding first.', null);
      }

      // Assuming profile has currentSkills and we map required skills based on learningGoal
      // For demonstration, we can pass target required skills or fetch from goal taxonomy
      const requiredSkillsForGoal = ['Java', 'Spring Boot', 'REST API', 'Docker', 'Microservices', 'SQL']; 
      
      const gapAnalysis = skillGapService.calculateGap(profile.currentSkills, requiredSkillsForGoal);

      return sendResponse(res, 200, true, 'Skill gap analysis generated successfully', {
        goal: profile.learningGoal,
        currentSkills: profile.currentSkills,
        requiredSkills: requiredSkillsForGoal,
        ...gapAnalysis
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SkillGapController();