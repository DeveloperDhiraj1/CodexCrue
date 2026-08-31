const User = require('../models/User');
const Course = require('../models/Course');
const LearningPath = require('../models/LearningPath');
const Recommendation = require('../models/Recommendation');
const sendResponse = require('../utils/response');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const totalUsers = await User.countDocuments({ role: 'learner' });
      const [totalCourses, publishedCourses, activeLearningPaths] = await Promise.all([
        Course.countDocuments(),
        Course.countDocuments({ status: 'published' }),
        LearningPath.countDocuments({ status: 'active' })
      ]);
      
      return sendResponse(res, 200, true, 'Admin stats retrieved', {
        totalUsers,
        totalCourses,
        publishedCourses,
        activeLearningPaths
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - 6);
      since.setHours(0, 0, 0, 0);
      const labels = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(since);
        date.setDate(since.getDate() + index);
        return date.toISOString().slice(0, 10);
      });
      const [users, paths, recommendations] = await Promise.all([
        User.aggregate([{ $match: { role: 'learner', createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }]),
        LearningPath.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }]),
        Recommendation.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, averageScore: { $avg: '$score' } } }])
      ]);
      const byDate = (items) => Object.fromEntries(items.map((item) => [item._id, item]));
      const userByDate = byDate(users); const pathByDate = byDate(paths); const recommendationByDate = byDate(recommendations);
      return sendResponse(res, 200, true, 'Admin analytics retrieved', { labels, users: labels.map((label) => userByDate[label]?.count || 0), paths: labels.map((label) => pathByDate[label]?.count || 0), recommendations: labels.map((label) => recommendationByDate[label]?.count || 0), averageRecommendationScore: recommendations.length ? recommendations.reduce((sum, item) => sum + (item.averageScore || 0), 0) / recommendations.length : 0 });
    } catch (error) { next(error); }
  }
}

module.exports = new AdminController();
