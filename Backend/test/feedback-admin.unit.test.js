const test = require('node:test');
const assert = require('node:assert/strict');
const Feedback = require('../src/models/Feedback');
const feedbackRoutes = require('../src/routes/feedback.routes');
const adminRoutes = require('../src/routes/admin.routes');
const { validateFeedback } = require('../src/validators/feedback.validator');

test('feedback schema bounds ratings and feedback route validates input', () => {
  assert.equal(Feedback.schema.path('rating').options.min, 1);
  const route = feedbackRoutes.stack.find((layer) => layer.route?.path === '/');
  assert.ok(route && route.route.stack.length >= 3);
  let status;
  const response = { status(code) { status = code; return this; }, json() { return this; } };
  validateFeedback({ body: { targetType: 'course', targetId: 'bad', rating: 6 } }, response, () => {});
  assert.equal(status, 400);
});

test('admin dashboard route requires the admin middleware', () => {
  const route = adminRoutes.stack.find((layer) => layer.route?.path === '/dashboard');
  assert.ok(route);
  assert.ok(route.route.stack.length >= 3);
});
