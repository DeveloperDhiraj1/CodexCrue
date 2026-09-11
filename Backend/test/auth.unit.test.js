process.env.NODE_ENV = 'test';

const assert = require('node:assert/strict');
const test = require('node:test');
const authRoutes = require('../src/routes/auth.routes');
const protect = require('../src/middleware/auth.middleware');
const User = require('../src/models/User');

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('Firebase-backed user records preserve the application profile contract', () => {
  assert.equal(User.schema.path('firebaseUid').options.unique, true);
  assert.equal(User.schema.path('password').options.required, undefined);
  assert.equal(User.schema.path('isVerified').options.default, false);
});

test('auth routes expose Firebase profile synchronization and protected profile lookup', () => {
  const paths = authRoutes.stack.map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  for (const expected of ['POST /register', 'POST /sync', 'GET /me', 'POST /logout']) {
    assert.ok(paths.includes(expected), `missing ${expected}`);
  }
  for (const removed of ['POST /login', 'POST /verify-otp', 'POST /forgot-password', 'POST /reset-password/:token']) {
    assert.equal(paths.includes(removed), false, `obsolete route remains: ${removed}`);
  }
});

test('protected routes reject requests without a Firebase ID token', async () => {
  const req = { headers: {} };
  const res = responseRecorder();
  let called = false;
  await protect(req, res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /Firebase token missing/);
});
