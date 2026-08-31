const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn, issuer: 'codexcrue-api', audience: 'codexcrue-web' }
  );
}

function createRefreshToken() {
  return crypto.randomBytes(48).toString('base64url');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashRefreshToken(token) {
  if (!config.jwtRefreshSecret) throw new Error('JWT_REFRESH_SECRET is not configured.');
  return crypto.createHmac('sha256', config.jwtRefreshSecret).update(token).digest('hex');
}

function hashOtp(otp) {
  return hashToken(otp);
}

function secureCompare(left, right) {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = { signAccessToken, createRefreshToken, hashToken, hashRefreshToken, hashOtp, secureCompare };
