process.env.JWT_SECRET = 'unit-test-access-secret';
process.env.JWT_REFRESH_SECRET = 'unit-test-refresh-secret';
process.env.NODE_ENV = 'test';

const assert = require('node:assert/strict');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const { signAccessToken, createRefreshToken, hashRefreshToken, secureCompare } = require('../src/utils/auth');
const { validateRegister, validateOTP, validatePasswordReset } = require('../src/validators/auth.validator');
const authRoutes = require('../src/routes/auth.routes');
const protect = require('../src/middleware/auth.middleware');

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('access tokens contain scoped claims and verify with the configured contract', () => {
  const token = signAccessToken({ _id: '507f1f77bcf86cd799439011', role: 'learner' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'codexcrue-api', audience: 'codexcrue-web' });
  assert.equal(decoded.id, '507f1f77bcf86cd799439011');
  assert.equal(decoded.role, 'learner');
  assert.equal(decoded.iss, 'codexcrue-api');
  assert.equal(decoded.aud, 'codexcrue-web');
});

test('refresh tokens are random and hash deterministically', () => {
  const first = createRefreshToken();
  const second = createRefreshToken();
  assert.notEqual(first, second);
  assert.equal(hashRefreshToken(first), hashRefreshToken(first));
  assert.notEqual(hashRefreshToken(first), hashRefreshToken(second));
  assert.equal(secureCompare(hashRefreshToken(first), hashRefreshToken(first)), true);
  assert.equal(secureCompare(hashRefreshToken(first), hashRefreshToken(second)), false);
});

test('registration validator normalizes valid email and rejects weak passwords', () => {
  const req = { body: { name: ' Learner ', email: 'LEARNER@example.com', password: 'strong-password' } };
  let called = false;
  validateRegister(req, responseRecorder(), () => { called = true; });
  assert.equal(called, true);
  assert.equal(req.body.email, 'learner@example.com');

  const res = responseRecorder();
  validateRegister({ body: { name: 'Learner', email: 'learner@example.com', password: 'short' } }, res, () => {});
  assert.equal(res.statusCode, 400);
});

test('OTP and reset validators reject malformed input', () => {
  const otpResponse = responseRecorder();
  validateOTP({ body: { email: 'bad-email', otp: '12' } }, otpResponse, () => {});
  assert.equal(otpResponse.statusCode, 400);

  const resetResponse = responseRecorder();
  validatePasswordReset({ body: { password: 'short' } }, resetResponse, () => {});
  assert.equal(resetResponse.statusCode, 400);
});

test('auth routes expose the complete account lifecycle', () => {
  const paths = authRoutes.stack.map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  for (const expected of [
    'POST /register', 'POST /login', 'GET /me', 'POST /refresh', 'POST /logout',
    'POST /verify-otp', 'POST /verify-email', 'POST /forgot-password', 'POST /reset-password/:token'
  ]) assert.ok(paths.includes(expected), `missing ${expected}`);
});

test('invalid access tokens are rejected before database lookup', async () => {
  const req = { headers: { authorization: 'Bearer invalid-token' } };
  const res = responseRecorder();
  let called = false;
  await protect(req, res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
});
