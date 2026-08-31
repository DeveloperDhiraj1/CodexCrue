const mongoose = require('mongoose');
const sendResponse = require('../utils/response');

function validateProgressUpdate(req, res, next) {
  const { courseId, status, completionPercentage, timeSpentHours } = req.body || {};
  if (!mongoose.isValidObjectId(courseId)) return sendResponse(res, 400, false, 'courseId must be a valid ID.', null);
  if (status !== undefined && !['not_started', 'in_progress', 'completed'].includes(status)) return sendResponse(res, 400, false, 'Invalid progress status.', null);
  if (completionPercentage !== undefined && (typeof completionPercentage !== 'number' || completionPercentage < 0 || completionPercentage > 100)) return sendResponse(res, 400, false, 'completionPercentage must be between 0 and 100.', null);
  if (timeSpentHours !== undefined && (typeof timeSpentHours !== 'number' || timeSpentHours < 0 || timeSpentHours > 100000)) return sendResponse(res, 400, false, 'timeSpentHours must be between 0 and 100000.', null);
  if (status === undefined && completionPercentage === undefined && timeSpentHours === undefined) return sendResponse(res, 400, false, 'At least one progress field is required.', null);
  return next();
}

module.exports = { validateProgressUpdate };
