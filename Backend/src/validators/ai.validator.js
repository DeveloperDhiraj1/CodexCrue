const sendResponse = require('../utils/response');

function validateChatMessage(req, res, next) {
  const { message } = req.body || {};
  if (typeof message !== 'string' || message.trim().length === 0 || message.length > 4000) {
    return sendResponse(res, 400, false, 'message must be a non-empty string of at most 4000 characters.', null);
  }
  req.body.message = message.trim();
  return next();
}

module.exports = { validateChatMessage };
