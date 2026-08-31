const profileService = require('../services/profile.service');
const learningPathService = require('../services/learningPath.service');
const sendResponse = require('../utils/response');
const personalizationService = require('../services/personalization.service');
const Profile = require('../models/Profile');
const Goal = require('../models/Goal');

class ProfileController {
  async getProfile(req, res, next) {
    try {
      const profile = await profileService.getProfileByUserId(req.user.id);
      return sendResponse(res, 200, true, 'Profile retrieved successfully', profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await profileService.createOrUpdateProfile(req.user.id, req.body);
      await personalizationService.regenerateForUser(req.user.id);
      return sendResponse(res, 200, true, 'Profile updated successfully', profile);
    } catch (error) {
      next(error);
    }
  }

  async completeOnboarding(req, res, next) {
    try {
      const {
        careerGoal,
        experienceLevel,
        currentSkills,
        preferredLearningStyle,
        availableHoursPerDay,
        targetCompletionDate,
        preferredLanguage
      } = req.body;

      // Save profile fields
      const profile = await Profile.findOneAndUpdate(
        { userId: req.user.id },
        {
          $set: {
            userId: req.user.id,
            learningGoal: careerGoal || '',
            careerGoal: careerGoal || '',
            experienceLevel: experienceLevel || 'beginner',
            currentSkills: Array.isArray(currentSkills) ? currentSkills : [],
            preferredLearningStyle: preferredLearningStyle || 'video',
            availableHoursPerDay: Number(availableHoursPerDay) || 2,
            preferredLanguage: preferredLanguage || 'en',
            ...(targetCompletionDate ? { targetCompletionDate: new Date(targetCompletionDate) } : {}),
            isOnboarded: true
          }
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );

      // Also create/update Goal with the career target
      if (careerGoal) {
        await Goal.findOneAndUpdate(
          { userId: req.user.id },
          {
            $set: {
              userId: req.user.id,
              title: `Become a ${careerGoal}`,
              careerTarget: careerGoal,
              weeklyLearningHours: Number(availableHoursPerDay) * 7 || 14,
              ...(targetCompletionDate ? { targetDate: new Date(targetCompletionDate) } : {})
            }
          },
          { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
      }

      return sendResponse(res, 200, true, 'Onboarding completed successfully', profile);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
