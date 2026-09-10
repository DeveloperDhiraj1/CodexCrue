const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Session = require('../models/Session');
const config = require('../config/env');
const sendResponse = require('../utils/response');
const { signAccessToken, createRefreshToken, hashToken, hashRefreshToken, hashOtp, secureCompare } = require('../utils/auth');

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
// const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
//   ? nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } })
//   : null;

const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000
    })
  : null;

const cookieOptions = () => ({
  httpOnly: true,
  secure: config.cookieSecure,
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: config.refreshTokenTtlDays * 24 * 60 * 60 * 1000
});

function setRefreshCookie(res, token) {
  res.cookie(config.refreshCookieName, token, cookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie(config.refreshCookieName, { ...cookieOptions(), maxAge: undefined });
}

async function createSession(user, req, res) {
  const refreshToken = createRefreshToken();
  await Session.create({
    userId: user._id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000),
    userAgent: req.get('user-agent'),
    ipAddress: req.ip
  });
  setRefreshCookie(res, refreshToken);
  return signAccessToken(user);
}

async function sendEmailOrFail(message) {
  if (!transporter) {
    if (process.env.NODE_ENV === 'production') {
      throw Object.assign(new Error('Email delivery is not configured.'), { statusCode: 503 });
    }
    return;
  }
  await transporter.sendMail(message);
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email }).select('+password +otp +otpExpires +otpAttempts');
    const otp = crypto.randomInt(100000, 1000000).toString();
    const passwordHash = await bcrypt.hash(password, 12);

    if (user?.isVerified) return sendResponse(res, 400, false, 'Email is already registered.', null);
    if (!user) user = new User({ name, email, password: passwordHash, isVerified: false });
    else {
      user.name = name;
      user.password = passwordHash;
    }
    user.otp = hashOtp(otp);
    user.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    user.otpAttempts = 0;
    user.isActive = true;
    await user.save();

    await sendEmailOrFail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your CodexCrue account',
      text: `Your verification code is ${otp}. It expires in 10 minutes.`
    });
    return sendResponse(res, 200, true, 'Verification code sent.', null);
  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email }).select('+otp +otpExpires +otpAttempts');
    if (!user || user.isVerified) return sendResponse(res, 400, false, 'Invalid verification request.', null);

    user.otpAttempts = (user.otpAttempts || 0) + 1;
    const valid = user.otp && user.otpExpires && user.otpExpires > new Date() &&
      user.otpAttempts <= MAX_OTP_ATTEMPTS && secureCompare(hashOtp(otp), user.otp);
    if (!valid) {
      await user.save();
      return sendResponse(res, 400, false, 'Invalid or expired verification code.', null);
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save();
    const token = await createSession(user, req, res);
    return sendResponse(res, 200, true, 'Account verified successfully.', { token, user });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      return sendResponse(res, 401, false, 'Invalid email or password.', null);
    }
    if (!user.isVerified) return sendResponse(res, 403, false, 'Please verify your email before signing in.', null);
    const token = await createSession(user, req, res);
    return sendResponse(res, 200, true, 'Logged in successfully.', { token, user });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const rawToken = req.cookies[config.refreshCookieName];
    if (!rawToken) return sendResponse(res, 401, false, 'Refresh session is missing.', null);

    const session = await Session.findOne({
      tokenHash: hashRefreshToken(rawToken),
      revokedAt: { $exists: false },
      expiresAt: { $gt: new Date() }
    }).select('+tokenHash');
    if (!session) {
      clearRefreshCookie(res);
      return sendResponse(res, 401, false, 'Refresh session is invalid or expired.', null);
    }

    const user = await User.findById(session.userId).select('name email role isActive avatar');
    if (!user || !user.isActive) {
      session.revokedAt = new Date();
      await session.save();
      clearRefreshCookie(res);
      return sendResponse(res, 401, false, 'Account is inactive or no longer exists.', null);
    }

    session.revokedAt = new Date();
    await session.save();
    const token = await createSession(user, req, res);
    return sendResponse(res, 200, true, 'Session refreshed.', { token, user });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies[config.refreshCookieName];
    if (rawToken) await Session.updateOne({ tokenHash: hashRefreshToken(rawToken) }, { $set: { revokedAt: new Date() } });
    clearRefreshCookie(res);
    return sendResponse(res, 200, true, 'Logged out successfully.', null);
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+resetPasswordToken +resetPasswordExpires');
    if (user && user.isActive) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = hashToken(rawToken);
      user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      await sendEmailOrFail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'Reset your CodexCrue password',
        text: `Use this password reset token within 30 minutes: ${rawToken}`
      });
    }
    return sendResponse(res, 200, true, 'If that account exists, recovery instructions have been sent.', null);
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: hashToken(req.params.token),
      resetPasswordExpires: { $gt: new Date() }
    }).select('+resetPasswordToken +resetPasswordExpires');
    if (!user) return sendResponse(res, 400, false, 'Invalid or expired password reset token.', null);

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    await Session.updateMany({ userId: user._id, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
    return sendResponse(res, 200, true, 'Password reset successfully.', null);
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  return sendResponse(res, 200, true, 'Authenticated user retrieved.', req.authUser);
};
