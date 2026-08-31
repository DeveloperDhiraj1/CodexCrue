const sendResponse = require('../utils/response');

const validateCourse = (req, res, next) => {
  const { title, description, instructor, difficulty, duration, category } = req.body;
  if (!title || !description || !instructor || !difficulty || !duration || !category) {
    return sendResponse(res, 400, false, 'All mandatory course fields must be filled.', null);
  }
  if (!['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
    return sendResponse(res, 400, false, 'Difficulty must be Beginner, Intermediate, or Advanced.', null);
  }
  if (String(title).trim().length > 200 || String(description).trim().length > 10000) {
    return sendResponse(res, 400, false, 'Course title or description is too long.', null);
  }
  if (req.body.status && !['published', 'draft'].includes(req.body.status)) {
    return sendResponse(res, 400, false, 'Course status must be published or draft.', null);
  }
  if (req.body.skills && !Array.isArray(req.body.skills)) return sendResponse(res, 400, false, 'Course skills must be an array.', null);
  if (req.body.tags && !Array.isArray(req.body.tags)) return sendResponse(res, 400, false, 'Course tags must be an array.', null);
  if (req.body.prerequisites && !Array.isArray(req.body.prerequisites)) return sendResponse(res, 400, false, 'Course prerequisites must be an array.', null);
  if (req.body.resources && !Array.isArray(req.body.resources)) return sendResponse(res, 400, false, 'Course resources must be an array.', null);
  if (req.body.isFree !== undefined && typeof req.body.isFree !== 'boolean') return sendResponse(res, 400, false, 'isFree must be boolean.', null);
  if (req.body.qualityScore !== undefined && (typeof req.body.qualityScore !== 'number' || req.body.qualityScore < 0 || req.body.qualityScore > 1)) return sendResponse(res, 400, false, 'qualityScore must be between 0 and 1.', null);
  next();
};

const validateCourseUpdate = (req, res, next) => {
  const allowed = ['title', 'description', 'instructor', 'provider', 'sourceUrl', 'isFree', 'qualityScore', 'skills', 'difficulty', 'duration', 'prerequisites', 'category', 'tags', 'resources', 'rating', 'thumbnail', 'status'];
  const unknown = Object.keys(req.body).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    return sendResponse(res, 400, false, `Unsupported course fields: ${unknown.join(', ')}`, null);
  }
  if (req.body.difficulty && !['Beginner', 'Intermediate', 'Advanced'].includes(req.body.difficulty)) {
    return sendResponse(res, 400, false, 'Invalid course difficulty.', null);
  }
  if (req.body.status && !['published', 'draft'].includes(req.body.status)) {
    return sendResponse(res, 400, false, 'Course status must be published or draft.', null);
  }
  for (const field of ['skills', 'tags', 'prerequisites', 'resources']) {
    if (req.body[field] && !Array.isArray(req.body[field])) return sendResponse(res, 400, false, `Course ${field} must be an array.`, null);
  }
  if (req.body.isFree !== undefined && typeof req.body.isFree !== 'boolean') return sendResponse(res, 400, false, 'isFree must be boolean.', null);
  if (req.body.qualityScore !== undefined && (typeof req.body.qualityScore !== 'number' || req.body.qualityScore < 0 || req.body.qualityScore > 1)) return sendResponse(res, 400, false, 'qualityScore must be between 0 and 1.', null);
  next();
};

module.exports = { validateCourse, validateCourseUpdate };
