const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const decoded = jwt.verify(header.slice(7), config.jwtSecret, { issuer: 'codexcrue-api', audience: 'codexcrue-web' });
    const user = await User.findById(decoded.id).select('name email role isActive avatar');
    if (user?.isActive) { req.authUser = user; req.user = decoded; }
  } catch (_error) { /* Public reads remain available when an optional token is invalid. */ }
  return next();
}

module.exports = optionalAuth;
