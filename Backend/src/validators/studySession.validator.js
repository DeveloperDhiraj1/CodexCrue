const mongoose = require('mongoose');
const sendResponse = require('../utils/response');

function validateStudySession(req, res, next) {
  const { courseId, durationMinutes, studiedAt, note } = req.body || {};
  if (!mongoose.isValidObjectId(courseId)) return sendResponse(res, 400, false, 'courseId must be a valid ID.', null);
  if (typeof durationMinutes !== 'number' || durationMinutes < 1 || durationMinutes > 1440) return sendResponse(res, 400, false, 'durationMinutes must be between 1 and 1440.', null);
  if (studiedAt !== undefined && Number.isNaN(Date.parse(studiedAt))) return sendResponse(res, 400, false, 'studiedAt must be a valid date.', null);
  if (note !== undefined && (typeof note !== 'string' || note.trim().length > 500)) return sendResponse(res, 400, false, 'note must be at most 500 characters.', null);
  if (note !== undefined) req.body.note = note.trim();
  return next();
}

module.exports = { validateStudySession };
