const mongoose = require('mongoose');
const sendResponse = require('../utils/response');

function validateFeedback(req, res, next) {
  const allowed = ['targetType', 'targetId', 'rating', 'sentiment', 'comment'];
  const unknown = Object.keys(req.body || {}).filter((key) => !allowed.includes(key));
  if (unknown.length) return sendResponse(res, 400, false, `Unsupported feedback fields: ${unknown.join(', ')}`, null);
  const { targetType, targetId, rating, sentiment, comment } = req.body || {};
  if (!['course', 'recommendation', 'platform'].includes(targetType)) return sendResponse(res, 400, false, 'Invalid feedback targetType.', null);
  if (targetType === 'platform' && targetId !== undefined) return sendResponse(res, 400, false, 'Platform feedback cannot have a targetId.', null);
  if (targetType !== 'platform' && !mongoose.isValidObjectId(targetId)) return sendResponse(res, 400, false, 'targetId must be a valid ID.', null);
  if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) return sendResponse(res, 400, false, 'rating must be between 1 and 5.', null);
  if (sentiment !== undefined && !['too_easy', 'too_difficult', 'relevant', 'not_relevant'].includes(sentiment)) return sendResponse(res, 400, false, 'Invalid feedback sentiment.', null);
  if (comment !== undefined && (typeof comment !== 'string' || comment.trim().length > 2000)) return sendResponse(res, 400, false, 'comment must be at most 2000 characters.', null);
  if (rating === undefined && sentiment === undefined && (!comment || comment.trim().length === 0)) return sendResponse(res, 400, false, 'Feedback must include a rating, sentiment, or comment.', null);
  if (comment !== undefined) req.body.comment = comment.trim();
  return next();
}

module.exports = { validateFeedback };
