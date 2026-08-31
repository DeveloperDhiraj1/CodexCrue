const Goal = require('../models/Goal');
const Profile = require('../models/Profile');

function normalize(data) {
  const normalized = {};
  for (const field of ['title', 'careerTarget', 'targetDate', 'weeklyLearningHours', 'status']) {
    if (data[field] !== undefined) normalized[field] = data[field];
  }
  for (const field of ['title', 'careerTarget']) if (normalized[field] !== undefined) normalized[field] = String(normalized[field]).trim();
  if (normalized.targetDate) normalized.targetDate = new Date(normalized.targetDate);
  return normalized;
}

async function syncProfile(userId, goal) {
  await Profile.findOneAndUpdate(
    { userId },
    {
      $set: {
        learningGoal: goal.title,
        careerGoal: goal.careerTarget,
        targetCompletionDate: goal.targetDate,
        availableHoursPerDay: Math.min(24, goal.weeklyLearningHours / 7)
      }
    },
    { upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
}

class GoalService {
  async getGoal(userId) {
    return Goal.findOne({ userId });
  }

  async createGoal(userId, data) {
    const existing = await Goal.exists({ userId });
    if (existing) throw Object.assign(new Error('A learner can have only one active goal. Update or delete the existing goal first.'), { statusCode: 409 });
    const goal = await Goal.create({ userId, ...normalize(data) });
    await syncProfile(userId, goal);
    return goal;
  }

  async updateGoal(userId, data) {
    const current = await Goal.findOne({ userId });
    if (!current) throw Object.assign(new Error('Goal not found.'), { statusCode: 404 });
    const goal = await Goal.findOneAndUpdate({ userId }, { $set: normalize(data) }, { new: true, runValidators: true });
    await syncProfile(userId, goal);
    return goal;
  }

  async deleteGoal(userId) {
    const goal = await Goal.findOneAndDelete({ userId });
    if (!goal) throw Object.assign(new Error('Goal not found.'), { statusCode: 404 });
    return goal;
  }
}

module.exports = new GoalService();
module.exports.normalizeGoalData = normalize;
