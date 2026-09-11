const { findApplicationUser } = require('../middleware/auth.middleware');
const User = require('../models/User');
const sendResponse = require('../utils/response');

function fallbackName(email) {
  return String(email || '').split('@')[0].slice(0, 100) || 'Learner';
}

async function syncFirebaseUser(req, res, next) {
  try {
    const decoded = req.firebaseUser;
    const email = String(decoded.email || '').trim().toLowerCase();
    if (!email) return sendResponse(res, 400, false, 'A Firebase account email is required.', null);

    let user = await findApplicationUser(decoded, { linkVerifiedUser: false });
    if (user?.firebaseUid && user.firebaseUid !== decoded.uid) {
      return sendResponse(res, 409, false, 'This email is already linked to another Firebase account.', null);
    }

    if (!user) {
      user = new User({
        name: String(req.body.name || decoded.name || fallbackName(email)).trim().slice(0, 100),
        email,
        firebaseUid: decoded.email_verified ? decoded.uid : undefined,
        isVerified: Boolean(decoded.email_verified),
        isActive: true,
        status: 'active'
      });
    } else {
      if (req.body.name && !user.name) user.name = String(req.body.name).trim().slice(0, 100);
      if (decoded.email_verified && !user.firebaseUid) user.firebaseUid = decoded.uid;
      user.isVerified = Boolean(decoded.email_verified);
      user.email = email;
    }

    await user.save();
    return sendResponse(res, 200, true, 'Application profile synchronized.', user);
  } catch (error) {
    return next(error);
  }
}

// Firebase creates the credential and sends verification/reset email. These
// endpoints only synchronize Firebase identity with the MongoDB user profile.
exports.register = syncFirebaseUser;
exports.sync = syncFirebaseUser;

exports.me = async (req, res) => {
  return sendResponse(res, 200, true, 'Authenticated user retrieved.', req.authUser);
};

exports.logout = async (_req, res) => {
  return sendResponse(res, 200, true, 'Logged out successfully.', null);
};
