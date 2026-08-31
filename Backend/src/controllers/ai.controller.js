const ChatHistory = require('../models/ChatHistory');
const aiService = require('../services/ai.service');
const profileService = require('../services/profile.service');
const learningPathService = require('../services/learningPath.service');
const { sanitizeHistory } = require('../services/aiContext.service');
const sendResponse = require('../utils/response');

class AIController {
  async chat(req, res, next) {
    try {
      const [profile, learningPath, history] = await Promise.all([
        profileService.getProfileByUserId(req.user.id),
        learningPathService.getPathByUserId(req.user.id),
        ChatHistory.findOne({ userId: req.user.id }).lean()
      ]);
      const reply = await aiService.chat(req.body.message, profile, learningPath, history);
      const saved = await ChatHistory.findOneAndUpdate(
        { userId: req.user.id },
        { $set: { userId: req.user.id }, $push: { messages: { $each: [
          { sender: 'user', content: req.body.message },
          { sender: 'ai', content: reply }
        ], $slice: -100 } } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      ).select('_id');
      return sendResponse(res, 200, true, 'AI response generated', { reply, conversationId: saved._id });
    } catch (error) {
      return next(error);
    }
  }

  async history(req, res, next) {
    try {
      const history = await ChatHistory.findOne({ userId: req.user.id }).lean();
      return sendResponse(res, 200, true, 'AI history retrieved', { messages: sanitizeHistory(history) });
    } catch (error) {
      return next(error);
    }
  }

  async clearHistory(req, res, next) {
    try {
      await ChatHistory.deleteOne({ userId: req.user.id });
      return sendResponse(res, 200, true, 'AI history cleared', null);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new AIController();
