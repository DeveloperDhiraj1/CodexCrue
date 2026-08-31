const mongoose = require('mongoose');
const sendResponse = require('../utils/response');

const PROFILE_FIELDS = ['learningGoal', 'careerGoal', 'learningComment', 'bio', 'location', 'education', 'experienceLevel', 'currentSkills', 'interests', 'completedCourses', 'preferredLearningStyle', 'preferredLanguage', 'availableHoursPerDay', 'targetCompletionDate'];

function validateProfileFields(req, res, next, requireGoalFields = false) {
  if (requireGoalFields && (!req.body.learningGoal || !req.body.careerGoal)) {
    return sendResponse(res, 400, false, 'Learning goal and career goal are mandatory.', null);
  }
  if (!requireGoalFields && Object.keys(req.body).length === 0) {
    return sendResponse(res, 400, false, 'At least one profile field is required.', null);
  }
  const unknown = Object.keys(req.body).filter((key) => !PROFILE_FIELDS.includes(key));
  if (unknown.length > 0) return sendResponse(res, 400, false, `Unsupported profile fields: ${unknown.join(', ')}`, null);

  for (const field of ['learningGoal', 'careerGoal']) {
    if (req.body[field] !== undefined && (typeof req.body[field] !== 'string' || req.body[field].trim().length === 0 || req.body[field].length > 200)) {
      return sendResponse(res, 400, false, `${field} must be a non-empty string of at most 200 characters.`, null);
    }
  }
  if (req.body.learningComment !== undefined && (typeof req.body.learningComment !== 'string' || req.body.learningComment.trim().length > 2000)) {
    return sendResponse(res, 400, false, 'learningComment must be at most 2000 characters.', null);
  }
  for (const field of ['bio', 'location']) {
    if (req.body[field] !== undefined && (typeof req.body[field] !== 'string' || req.body[field].trim().length > (field === 'bio' ? 500 : 120))) {
      return sendResponse(res, 400, false, 'Invalid ' + field + ' length.', null);
    }
  }
  if (req.body.education !== undefined && (!req.body.education || typeof req.body.education !== 'object' || Array.isArray(req.body.education))) {
    return sendResponse(res, 400, false, 'education must be an object.', null);
  }
  if (req.body.education?.graduationYear !== undefined && (!Number.isInteger(req.body.education.graduationYear) || req.body.education.graduationYear < 1950 || req.body.education.graduationYear > 2200)) {
    return sendResponse(res, 400, false, 'graduationYear must be a valid year.', null);
  }
  if (req.body.experienceLevel !== undefined) {
    req.body.experienceLevel = String(req.body.experienceLevel).trim().toLowerCase();
  }
  if (req.body.experienceLevel && !['beginner', 'intermediate', 'advanced'].includes(req.body.experienceLevel)) {
    return sendResponse(res, 400, false, 'Invalid experience level.', null);
  }
  if (req.body.preferredLanguage !== undefined) {
    req.body.preferredLanguage = String(req.body.preferredLanguage).trim().toLowerCase();
    if (!['en', 'hi', 'hinglish'].includes(req.body.preferredLanguage)) return sendResponse(res, 400, false, 'Invalid preferred language.', null);
  }
  for (const field of ['currentSkills', 'interests', 'completedCourses']) {
    if (req.body[field] && !Array.isArray(req.body[field])) return sendResponse(res, 400, false, `${field} must be an array.`, null);
  }
  if (req.body.completedCourses?.some((id) => !mongoose.isValidObjectId(id))) {
    return sendResponse(res, 400, false, 'Completed courses must contain valid course IDs.', null);
  }
  if (req.body.availableHoursPerDay !== undefined && (typeof req.body.availableHoursPerDay !== 'number' || req.body.availableHoursPerDay < 0 || req.body.availableHoursPerDay > 24)) {
    return sendResponse(res, 400, false, 'Available hours per day must be between 0 and 24.', null);
  }
  next();
}

const validateProfile = (req, res, next) => validateProfileFields(req, res, next, true);
const validateProfileUpdate = (req, res, next) => validateProfileFields(req, res, next, false);

module.exports = { validateProfile, validateProfileUpdate };
