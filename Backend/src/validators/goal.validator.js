const sendResponse = require('../utils/response');

function validateGoalFields(body, requireAll) {
  const allowed = ['title', 'careerTarget', 'targetDate', 'weeklyLearningHours', 'status'];
  const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) return `Unsupported goal fields: ${unknown.join(', ')}`;
  for (const field of ['title', 'careerTarget']) {
    if (requireAll && !body[field]) return `${field} is required.`;
    if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].trim().length === 0 || body[field].length > 200)) return `${field} must be a non-empty string of at most 200 characters.`;
  }
  if (requireAll && body.weeklyLearningHours === undefined) return 'weeklyLearningHours is required.';
  if (body.weeklyLearningHours !== undefined && (typeof body.weeklyLearningHours !== 'number' || body.weeklyLearningHours < 0 || body.weeklyLearningHours > 168)) return 'Weekly learning hours must be between 0 and 168.';
  if (body.targetDate !== undefined && body.targetDate !== null && Number.isNaN(Date.parse(body.targetDate))) return 'targetDate must be a valid date.';
  if (body.status && !['active', 'completed', 'paused', 'archived'].includes(body.status)) return 'Invalid goal status.';
  return null;
}

function validateGoal(req, res, next) {
  const error = validateGoalFields(req.body, true);
  if (error) return sendResponse(res, 400, false, error, null);
  next();
}

function validateGoalUpdate(req, res, next) {
  if (Object.keys(req.body).length === 0) return sendResponse(res, 400, false, 'At least one goal field is required.', null);
  const error = validateGoalFields(req.body, false);
  if (error) return sendResponse(res, 400, false, error, null);
  next();
}

module.exports = { validateGoal, validateGoalUpdate };
