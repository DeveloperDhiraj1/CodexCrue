const jwt = require('jsonwebtoken');
const sendResponse = require('../utils/response');
const config = require('../config/env');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendResponse(res, 401, false, 'Not authorized, token missing', null);
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      issuer: 'codexcrue-api',
      audience: 'codexcrue-web'
    });
    const user = await User.findById(decoded.id).select('name email role isActive avatar');
    if (!user || !user.isActive) {
      return sendResponse(res, 401, false, 'Account is inactive or no longer exists', null);
    }
    req.user = decoded;
    req.authUser = user;
    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Not authorized, token failed', null);
  }
};

module.exports = protect;
