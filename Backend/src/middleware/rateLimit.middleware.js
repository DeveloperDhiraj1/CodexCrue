const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, limit, message) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message, data: null }
});

module.exports = {
  authLimiter: createLimiter(15 * 60 * 1000, 10, 'Too many authentication attempts. Try again later.'),
  // OTP verification is intentionally strict in production, while local development
  // gets enough attempts to survive hot reloads and repeated form submissions.
  verificationLimiter: createLimiter(15 * 60 * 1000, process.env.NODE_ENV === 'production' ? 5 : 20, 'Too many verification attempts. Try again later.'),
  recoveryLimiter: createLimiter(15 * 60 * 1000, 5, 'Too many recovery attempts. Try again later.'),
  aiLimiter: createLimiter(15 * 60 * 1000, 30, 'Too many AI requests. Try again later.'),
  avatarLimiter: createLimiter(60 * 60 * 1000, 10, 'Too many avatar uploads. Try again later.')
};
