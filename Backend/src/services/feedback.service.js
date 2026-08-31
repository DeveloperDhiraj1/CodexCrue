const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const Recommendation = require('../models/Recommendation');

class FeedbackService {
  async submitFeedback(userId, feedbackData) {
    const { targetType, targetId } = feedbackData;
    if (targetType === 'course') {
      const course = await Course.findOne({ _id: targetId, status: 'published' }).select('_id');
      if (!course) throw Object.assign(new Error('Published course not found.'), { statusCode: 404 });
    }
    if (targetType === 'recommendation') {
      const recommendation = await Recommendation.findOne({ _id: targetId, userId }).select('_id');
      if (!recommendation) throw Object.assign(new Error('Recommendation not found for this user.'), { statusCode: 404 });
    }
    return await Feedback.create({ userId, ...feedbackData });
  }
}

module.exports = new FeedbackService();
