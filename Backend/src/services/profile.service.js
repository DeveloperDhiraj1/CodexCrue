const Profile = require('../models/Profile');

const PROFILE_FIELDS = ['learningGoal', 'careerGoal', 'learningComment', 'bio', 'location', 'education', 'experienceLevel', 'currentSkills', 'interests', 'completedCourses', 'preferredLearningStyle', 'preferredLanguage', 'availableHoursPerDay', 'targetCompletionDate'];

function normalizeProfileData(data) {
  const normalized = {};
  for (const field of PROFILE_FIELDS) if (data[field] !== undefined) normalized[field] = data[field];
  for (const field of ['learningGoal', 'careerGoal', 'learningComment', 'bio', 'location', 'preferredLearningStyle', 'preferredLanguage']) {
    if (normalized[field] !== undefined) normalized[field] = String(normalized[field]).trim();
  }
  for (const field of ['currentSkills', 'interests']) {
    if (normalized[field]) normalized[field] = [...new Set(normalized[field].map((skill) => String(skill).trim()).filter(Boolean))];
  }
  return normalized;
}

class ProfileService {
  async getProfileByUserId(userId) {
    const profile = await Profile.findOne({ userId }).populate('completedCourses').populate('userId', 'name email role avatar');
    return profile;
  }

  async createOrUpdateProfile(userId, profileData) {
    const normalized = normalizeProfileData(profileData);
    const existing = await Profile.exists({ userId });
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: normalized },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).populate('completedCourses').populate('userId', 'name email role avatar');
    
    return updatedProfile;
  }
}

module.exports = new ProfileService();
module.exports.normalizeProfileData = normalizeProfileData;
