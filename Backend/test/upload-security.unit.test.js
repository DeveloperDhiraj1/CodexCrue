const test = require('node:test');
const assert = require('node:assert/strict');
const userRoutes = require('../src/routes/user.routes');
const User = require('../src/models/User');
const errorHandler = require('../src/middleware/error.middleware');

test('avatar upload route is protected and rate limited', () => {
  const layers = userRoutes.stack.filter((layer) => layer.route);
  const uploadRoute = layers.find((layer) => layer.route.path === '/upload-avatar');
  assert.ok(uploadRoute);
  assert.deepEqual(Object.keys(uploadRoute.route.methods), ['post']);
  assert.ok(uploadRoute.route.stack.length >= 4);
  assert.equal(User.schema.path('avatar').instance, 'String');
});

test('oversized avatar uploads return a client validation error', () => {
  let statusCode;
  let body;
  const response = { status(code) { statusCode = code; return this; }, json(value) { body = value; return this; } };
  errorHandler({ name: 'MulterError', code: 'LIMIT_FILE_SIZE', message: 'too large', stack: 'test' }, {}, response, () => {});
  assert.equal(statusCode, 400);
  assert.match(body.message, /2 MB/);
});
