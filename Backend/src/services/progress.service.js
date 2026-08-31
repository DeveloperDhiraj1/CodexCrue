const Progress = require('../models/Progress');
const StudySession = require('../models/StudySession');
const Course = require('../models/Course');
const Goal = require('../models/Goal');
const Profile = require('../models/Profile');
const rewardService = require('./reward.service');
const learningPathService = require('./learningPath.service');

class ProgressService {
  async getUserProgress(userId) {
    return await Progress.find({ userId }).populate('courseId');
  }

  async getStudySessions(userId, limit = 20) {
    return await StudySession.find({ userId }).sort({ studiedAt: -1 }).limit(limit).populate('courseId', 'title provider');
  }

  async logStudySession(userId, sessionData) {
    const { courseId, durationMinutes, studiedAt, note } = sessionData;
    const course = await Course.findOne({ _id: courseId, status: 'published' }).select('_id title duration');
    if (!course) throw Object.assign(new Error('Published course not found.'), { statusCode: 404 });

    const session = await StudySession.create({ userId, courseId, durationMinutes, studiedAt: studiedAt || new Date(), note });
    const current = await Progress.findOne({ userId, courseId }).lean();
    const totalHours = Number(current?.timeSpentHours || 0) + (durationMinutes / 60);
    const targetHours = estimateCourseHours(course.duration);
    const completionPercentage = Math.min(100, Math.round((totalHours / targetHours) * 100));
    const status = completionPercentage >= 100 ? 'completed' : 'in_progress';
    const progress = await Progress.findOneAndUpdate(
      { userId, courseId },
      { $set: { status, completionPercentage, timeSpentHours: totalHours } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await syncGoalHours(userId);
    if (status === 'completed') await rewardService.awardCourseCompletion(userId, courseId, course.title);
    await rewardService.evaluateBadges(userId);
    const profile = await Profile.findOne({ userId });
    if (profile) {
      try {
        const path = await learningPathService.generateAndSavePath(userId, profile);
        if (path?.overallProgress >= 100) await rewardService.awardGoalCompletion(userId);
      } catch (_error) { /* keep session logging successful if path regeneration is unavailable */ }
    }
    return { session, progress, targetHours };
  }

  async updateProgress(userId, courseId, progressData) {
    const { status, completionPercentage, timeSpentHours } = progressData;
    const course = await Course.findOne({ _id: courseId, status: 'published' }).select('_id');
    if (!course) throw Object.assign(new Error('Published course not found.'), { statusCode: 404 });
    const normalizedStatus = completionPercentage === 100 ? 'completed' : (status || 'in_progress');
    const update = { $set: { status: normalizedStatus } };

    if (completionPercentage !== undefined) update.$set.completionPercentage = completionPercentage;
    if (normalizedStatus === 'completed') update.$set.completionPercentage = 100;
    if (timeSpentHours !== undefined && timeSpentHours > 0) update.$inc = { timeSpentHours };

    const progress = await Progress.findOneAndUpdate(
      { userId, courseId },
      update,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const profile = await Profile.findOne({ userId });
    await syncGoalHours(userId);

    if (normalizedStatus === 'completed') {
      const fullCourse = await Course.findById(courseId).select('title').lean();
      if (fullCourse) await rewardService.awardCourseCompletion(userId, courseId, fullCourse.title);
    }
    await rewardService.evaluateBadges(userId);

    if (profile) {
      try {
        const path = await learningPathService.generateAndSavePath(userId, profile);
        if (path?.overallProgress >= 100) await rewardService.awardGoalCompletion(userId);
      } catch (_error) { /* keep progress successful if catalog is temporarily unavailable */ }
    }
    return progress;
  }
}

module.exports = new ProgressService();

function estimateCourseHours(duration) {
  const value = String(duration || '').toLowerCase();
  const hours = value.match(/(\d+(?:\.\d+)?)\s*hour/);
  if (hours) return Math.max(1, Number(hours[1]));
  const weeks = value.match(/(\d+(?:\.\d+)?)\s*week/);
  if (weeks) return Math.max(1, Number(weeks[1]) * 20);
  return 20;
}

async function syncGoalHours(userId) {
  const records = await Progress.find({ userId }).select('timeSpentHours').lean();
  const totalTimeSpentHours = records.reduce((sum, item) => sum + Number(item.timeSpentHours || 0), 0);
  await Goal.updateOne({ userId }, { $set: { timeSpentHours: Math.round(totalTimeSpentHours * 100) / 100 } });
}

module.exports.estimateCourseHours = estimateCourseHours;
