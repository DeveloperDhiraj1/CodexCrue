const Profile = require('../models/Profile');
const learningPathService = require('./learningPath.service');
const recommendationService = require('./recommendation.service');

async function regenerateForUser(userId) {
  const profile = await Profile.findOne({ userId });
  if (!profile) return { path: null, recommendations: [] };

  const result = { path: null, recommendations: [] };
  try { result.path = await learningPathService.generateAndSavePath(userId, profile); } catch (error) { result.pathError = error; }
  try { result.recommendations = await recommendationService.getRecommendationsForUser(userId, profile); } catch (error) { result.recommendationError = error; }
  return result;
}

module.exports = { regenerateForUser };
