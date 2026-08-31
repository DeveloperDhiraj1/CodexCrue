const test = require('node:test');
const assert = require('node:assert/strict');
const Assessment = require('../src/models/Assessment');
const AssessmentAttempt = require('../src/models/AssessmentAttempt');
const assessmentRoutes = require('../src/routes/assessment.routes');
const { validateAssessmentAnswers } = require('../src/validators/assessment.validator');

test('assessment correct answers are excluded by default', () => {
  assert.equal(Assessment.schema.path('questions').schema.path('correctAnswer').options.select, false);
  assert.equal(AssessmentAttempt.schema.path('score').options.max, 100);
});

test('assessment submit route is protected and validates answers', () => {
  const submit = assessmentRoutes.stack.find((layer) => layer.route?.path === '/:id/submit');
  assert.ok(submit);
  assert.ok(submit.route.stack.length >= 3);
  let status;
  validateAssessmentAnswers({ body: { answers: [{ malicious: true }] } }, { status: (code) => { status = code; return { json() {} }; } }, () => {});
  assert.equal(status, 400);
});
