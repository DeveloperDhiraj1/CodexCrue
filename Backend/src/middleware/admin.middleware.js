const sendResponse = require('../utils/response');

const adminOnly = (req, res, next) => {
  if (req.authUser && req.authUser.role === 'admin') {
    next();
  } else {
    return sendResponse(res, 403, false, 'Access denied, admin role required', null);
  }
};

module.exports = adminOnly;
