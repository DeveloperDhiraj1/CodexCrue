const mongoose = require('mongoose');
const sendResponse = require('../utils/response');

function validateSkillPayload(req, res, next) {
  const { name, category } = req.body;
  if (!name || !category) return sendResponse(res, 400, false, 'Skill name and category are required.', null);
  if (String(name).trim().length < 2 || String(name).trim().length > 100) {
    return sendResponse(res, 400, false, 'Skill name must be between 2 and 100 characters.', null);
  }
  if (req.body.prerequisites && (!Array.isArray(req.body.prerequisites) || req.body.prerequisites.some((id) => !mongoose.isValidObjectId(id)))) {
    return sendResponse(res, 400, false, 'Skill prerequisites must be valid skill IDs.', null);
  }
  next();
}

function validateSkillUpdate(req, res, next) {
  const allowed = ['name', 'category', 'description', 'prerequisites'];
  const unknown = Object.keys(req.body).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) return sendResponse(res, 400, false, `Unsupported skill fields: ${unknown.join(', ')}`, null);
  if (req.body.prerequisites && (!Array.isArray(req.body.prerequisites) || req.body.prerequisites.some((id) => !mongoose.isValidObjectId(id)))) {
    return sendResponse(res, 400, false, 'Skill prerequisites must be valid skill IDs.', null);
  }
  next();
}

module.exports = { validateSkillPayload, validateSkillUpdate };
