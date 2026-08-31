const Reward = require('../models/Reward');
const Progress = require('../models/Progress');
const StudySession = require('../models/StudySession');
const Goal = require('../models/Goal');

const BADGES = [
  { key: 'first_session', title: 'First Step', description: 'Log your first study session.', icon: '🌱', points: 25 },
  { key: 'five_hours', title: 'Five Hour Focus', description: 'Study for five total hours.', icon: '⏱️', points: 50 },
  { key: 'course_finisher', title: 'Course Finisher', description: 'Complete your first course.', icon: '🎓', points: 100 },
  { key: 'course_collector', title: 'Course Collector', description: 'Complete three courses.', icon: '🏅', points: 150 },
  { key: 'seven_day_streak', title: 'Seven Day Streak', description: 'Study on seven consecutive days.', icon: '🔥', points: 200 },
  { key: 'goal_getter', title: 'Goal Getter', description: 'Complete your learning goal.', icon: '🚀', points: 500 }
];

async function awardOnce(userId, type, referenceId, title, points, icon = '🏆') {
  try {
    return await Reward.create({ userId, type, referenceId: String(referenceId), title, points, icon });
  } catch (error) {
    if (error.code === 11000) return Reward.findOne({ userId, type, referenceId: String(referenceId) });
    throw error;
  }
}

module.exports = {
  awardCourseCompletion(userId, courseId, courseTitle) {
    return awardOnce(userId, 'course_completed', courseId, `Completed: ${courseTitle}`, 50, '🎓');
  },
  awardGoalCompletion(userId) {
    return awardOnce(userId, 'goal_completed', userId, 'Goal completed', 500, '🚀');
  },
  async evaluateBadges(userId) {
    const [progress, sessions, goal] = await Promise.all([
      Progress.find({ userId }).select('status').lean(),
      StudySession.find({ userId }).select('durationMinutes studiedAt').sort({ studiedAt: 1 }).lean(),
      Goal.findOne({ userId }).select('status').lean()
    ]);
    const totalHours = sessions.reduce((sum, item) => sum + Number(item.durationMinutes || 0) / 60, 0);
    const completedCourses = progress.filter((item) => item.status === 'completed').length;
    const days = new Set(sessions.map((item) => new Date(item.studiedAt).toISOString().slice(0, 10)));
    let streak = 0; let bestStreak = 0; let previous;
    [...days].sort().forEach((day) => {
      const current = new Date(day);
      if (previous && (current - previous) / 86400000 === 1) streak += 1; else streak = 1;
      bestStreak = Math.max(bestStreak, streak); previous = current;
    });
    const achieved = { first_session: sessions.length >= 1, five_hours: totalHours >= 5, course_finisher: completedCourses >= 1, course_collector: completedCourses >= 3, seven_day_streak: bestStreak >= 7, goal_getter: goal?.status === 'completed' };
    const unlocked = [];
    for (const badge of BADGES) {
      if (achieved[badge.key]) {
        const reward = await awardOnce(userId, 'badge_earned', badge.key, 'Badge: ' + badge.title, badge.points, badge.icon);
        unlocked.push({ ...badge, earned: true, earnedAt: reward.awardedAt });
      } else unlocked.push({ ...badge, earned: false });
    }
    return unlocked;
  },
  listForUser(userId) {
    return Reward.find({ userId }).sort({ awardedAt: -1 }).lean();
  },
  async listBadges(userId) {
    const rewards = await Reward.find({ userId, type: 'badge_earned' }).select('referenceId awardedAt').lean();
    const earned = new Map(rewards.map((item) => [item.referenceId, item.awardedAt]));
    return BADGES.map((badge) => ({ ...badge, earned: earned.has(badge.key), earnedAt: earned.get(badge.key) || null }));
  }
};
