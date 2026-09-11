const { getFirebaseAuth } = require('../config/firebase');
const { findApplicationUser } = require('./auth.middleware');

async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  try {
    const decoded = await getFirebaseAuth().verifyIdToken(header.slice(7).trim());
    const user = await findApplicationUser(decoded);
    if (user?.isActive && (!user.status || user.status === 'active')) {
      req.firebaseUser = decoded;
      req.authUser = user;
      req.user = { id: user._id.toString(), uid: decoded.uid, role: user.role };
    }
  } catch (_error) { /* Public reads remain available when an optional token is invalid. */ }
  return next();
}

module.exports = optionalAuth;
