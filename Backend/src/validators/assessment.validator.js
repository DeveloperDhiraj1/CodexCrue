const sendResponse = require('../utils/response');

function validateAssessmentAnswers(req, res, next) {
  const { answers } = req.body || {};
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > 200 || answers.some((answer) => typeof answer !== 'string' || answer.length > 500)) {
    return sendResponse(res, 400, false, 'answers must be a non-empty array of strings no longer than 500 characters.', null);
  }
  return next();
}

module.exports = { validateAssessmentAnswers };
