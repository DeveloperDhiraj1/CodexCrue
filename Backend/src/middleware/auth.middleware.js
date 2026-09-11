const sendResponse = require('../utils/response');
const { getFirebaseAuth } = require('../config/firebase');
const User = require('../models/User');

async function findApplicationUser(decoded, { linkVerifiedUser = true } = {}) {
  const email = String(decoded.email || '').trim().toLowerCase();
  if (!decoded.uid || !email) return null;

  const user = await User.findOne({ $or: [{ firebaseUid: decoded.uid }, { email }] })
    .select('name email firebaseUid role isActive status avatar isVerified');
  if (!user) return null;
  if (user.firebaseUid && user.firebaseUid !== decoded.uid) {
    const error = new Error('This email is already linked to another Firebase account.');
    error.statusCode = 409;
    throw error;
  }

  const shouldLink = linkVerifiedUser && decoded.email_verified && !user.firebaseUid;
  const shouldUpdateVerification = user.isVerified !== Boolean(decoded.email_verified);
  if (shouldLink) user.firebaseUid = decoded.uid;
  if (shouldUpdateVerification) user.isVerified = Boolean(decoded.email_verified);
  if (shouldLink || shouldUpdateVerification) await user.save();
  return user;
}

function verifyFirebaseToken({ requireVerified = true } = {}) {
  return async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) return sendResponse(res, 401, false, 'Not authorized, Firebase token missing.', null);

    try {
      const decoded = await getFirebaseAuth().verifyIdToken(token);
      if (requireVerified && !decoded.email_verified) {
        return sendResponse(res, 403, false, 'Please verify your email before continuing.', null);
      }
      const user = await findApplicationUser(decoded);
      if (!user) return sendResponse(res, 404, false, 'Application user profile not found.', null);
      if (!user.isActive || (user.status && user.status !== 'active')) {
        return sendResponse(res, 401, false, 'Account is inactive or no longer exists.', null);
      }
      req.firebaseUser = decoded;
      req.user = { id: user._id.toString(), uid: decoded.uid, role: user.role };
      req.authUser = user;
      return next();
    } catch (error) {
      if (error.statusCode) return sendResponse(res, error.statusCode, false, error.message, null);
      console.error(`[Firebase Auth] Token verification failed: ${error.code || error.message}`);
      return sendResponse(res, 401, false, 'Not authorized, Firebase token is invalid or expired.', null);
    }
  };
}

const protect = verifyFirebaseToken();

module.exports = protect;
module.exports.verifyFirebaseToken = verifyFirebaseToken;
module.exports.findApplicationUser = findApplicationUser;
