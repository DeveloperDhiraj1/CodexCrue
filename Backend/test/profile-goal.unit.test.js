process.env.NODE_ENV = 'test';

const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeProfileData } = require('../src/services/profile.service');
const { normalizeGoalData } = require('../src/services/goal.service');
const { validateProfile, validateProfileUpdate } = require('../src/validators/profile.validator');
const { validateGoal, validateGoalUpdate } = require('../src/validators/goal.validator');
const profileRoutes = require('../src/routes/profile.routes');
const goalRoutes = require('../src/routes/goal.routes');
const Profile = require('../src/models/Profile');
const Goal = require('../src/models/Goal');

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('profile normalization trims and deduplicates learner skills', () => {
  const result = normalizeProfileData({ learningGoal: ' Backend Developer ', currentSkills: [' React ', 'React', 'Node.js'], ignored: true });
  assert.equal(result.learningGoal, 'Backend Developer');
  assert.deepEqual(result.currentSkills, ['React', 'Node.js']);
  assert.equal(result.ignored, undefined);
});

test('profile validators distinguish onboarding from partial updates', () => {
  const initial = responseRecorder();
  validateProfile({ body: { currentSkills: [] } }, initial, () => {});
  assert.equal(initial.statusCode, 400);

  const partial = responseRecorder();
  let called = false;
  validateProfileUpdate({ body: { currentSkills: ['Java'] } }, partial, () => { called = true; });
  assert.equal(called, true);

  const invalid = responseRecorder();
  validateProfileUpdate({ body: { availableHoursPerDay: 25 } }, invalid, () => {});
  assert.equal(invalid.statusCode, 400);
});

test('goal normalization and validation enforce weekly learning hours', () => {
  const normalized = normalizeGoalData({ title: ' Java Backend ', careerTarget: 'Backend Engineer', weeklyLearningHours: 14, targetDate: '2027-01-01' });
  assert.equal(normalized.title, 'Java Backend');
  assert.equal(normalized.weeklyLearningHours, 14);
  assert.ok(normalized.targetDate instanceof Date);

  const invalid = responseRecorder();
  validateGoal({ body: { title: 'Goal', careerTarget: 'Engineer', weeklyLearningHours: 200 } }, invalid, () => {});
  assert.equal(invalid.statusCode, 400);

  const update = responseRecorder();
  validateGoalUpdate({ body: { status: 'paused' } }, update, () => {});
  assert.equal(update.statusCode, 200);
});

test('profile and goal schemas enforce learner ownership and progress bounds', () => {
  assert.equal(Profile.schema.path('userId').options.unique, true);
  assert.equal(Profile.schema.path('availableHoursPerDay').options.max, 24);
  assert.equal(Goal.schema.path('userId').options.unique, true);
  assert.equal(Goal.schema.path('progress').options.max, 100);
});

test('profile and goal routes expose protected learner operations', () => {
  const profilePaths = profileRoutes.stack.filter((layer) => layer.route).map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  const goalPaths = goalRoutes.stack.filter((layer) => layer.route).map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  for (const expected of ['GET /', 'PUT /']) assert.ok(profilePaths.includes(expected));
  for (const expected of ['GET /', 'POST /', 'PUT /', 'DELETE /']) assert.ok(goalPaths.includes(expected));
});
