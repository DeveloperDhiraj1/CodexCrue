const sendResponse = require('../utils/response');

const validateRegister = (req, res, next) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  req.body.name = name;
  req.body.email = email;
  if (!name || !email || !password) {
    return sendResponse(res, 400, false, 'Please provide name, email, and password.', null);
  }
  if (name.length < 2 || name.length > 100 || !/^\S+@\S+\.\S+$/.test(email)) {
    return sendResponse(res, 400, false, 'Please provide a valid name and email address.', null);
  }
  if (password.length < 8 || password.length > 128) {
    return sendResponse(res, 400, false, 'Password must be between 8 and 128 characters long.', null);
  }
  next();
};

const validateLogin = (req, res, next) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  req.body.email = email;
  if (!email || !password) {
    return sendResponse(res, 400, false, 'Please provide email and password.', null);
  }
  next();
};

const validateEmail = (req, res, next) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return sendResponse(res, 400, false, 'A valid email address is required.', null);
  }
  req.body.email = email;
  next();
};

const validateOTP = (req, res, next) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(otp)) {
    return sendResponse(res, 400, false, 'A valid email and six-digit verification code are required.', null);
  }
  req.body.email = email;
  req.body.otp = otp;
  next();
};

const validatePasswordReset = (req, res, next) => {
  const password = String(req.body.password || '');
  if (password.length < 8 || password.length > 128) {
    return sendResponse(res, 400, false, 'Password must be between 8 and 128 characters long.', null);
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateEmail, validateOTP, validatePasswordReset };
