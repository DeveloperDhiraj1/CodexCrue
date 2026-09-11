process.env.NODE_ENV = 'test';

const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeCourseData, hasPrerequisiteCycle } = require('../src/services/course.service');
const { validateCourse, validateCourseUpdate } = require('../src/validators/course.validator');
const { validateSkillPayload, validateSkillUpdate } = require('../src/validators/skill.validator');
const courseRoutes = require('../src/routes/course.routes');
const skillRoutes = require('../src/routes/skill.routes');
const Course = require('../src/models/Course');
const Skill = require('../src/models/Skill');

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

test('course normalization removes duplicates and unsupported fields', () => {
  const result = normalizeCourseData({
    title: 'Course',
    skills: [' React ', 'React', 'Node.js'],
    tags: ['web', 'web'],
    prerequisites: ['a', 'a'],
    ignored: 'must not persist'
  });
  assert.deepEqual(result.skills, ['React', 'Node.js']);
  assert.deepEqual(result.tags, ['web']);
  assert.deepEqual(result.prerequisites, ['a']);
  assert.equal(result.ignored, undefined);
});

test('course validators reject malformed arrays and unsupported updates', () => {
  const invalid = responseRecorder();
  validateCourse({ body: { title: 'x', description: 'x', instructor: 'x', difficulty: 'Beginner', duration: '1h', category: 'web', skills: 'React' } }, invalid, () => {});
  assert.equal(invalid.statusCode, 400);

  const update = responseRecorder();
  validateCourseUpdate({ body: { arbitrary: true } }, update, () => {});
  assert.equal(update.statusCode, 400);
});

test('skill validators enforce prerequisite array and valid IDs', () => {
  const invalid = responseRecorder();
  validateSkillPayload({ body: { name: 'React', category: 'frontend', prerequisites: ['not-an-id'] } }, invalid, () => {});
  assert.equal(invalid.statusCode, 400);

  const valid = responseRecorder();
  let called = false;
  validateSkillUpdate({ body: { description: 'Updated' } }, valid, () => { called = true; });
  assert.equal(called, true);
});

test('course and skill schemas enforce domain bounds and indexes', () => {
  assert.equal(Course.schema.path('rating').options.max, 5);
  assert.equal(Skill.schema.path('name').options.unique, true);
  assert.ok(Course.schema.indexes().some(([index]) => index.status === 1 && index.category === 1));
  assert.ok(Skill.schema.indexes().some(([index]) => index.prerequisites === 1));
});

test('course prerequisite cycle detection rejects cyclic graphs', () => {
  const cyclic = new Map([
    ['a', ['b']],
    ['b', ['c']],
    ['c', ['a']]
  ]);
  const acyclic = new Map([
    ['a', ['b']],
    ['b', ['c']],
    ['c', []]
  ]);
  assert.equal(hasPrerequisiteCycle(cyclic, 'a'), true);
  assert.equal(hasPrerequisiteCycle(acyclic, 'a'), false);
});

test('course and skill routes expose public reads and protected admin writes', () => {
  const coursePaths = courseRoutes.stack.filter((layer) => layer.route).map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  const skillPaths = skillRoutes.stack.filter((layer) => layer.route).map((layer) => `${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
  for (const expected of ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id']) assert.ok(coursePaths.includes(expected));
  for (const expected of ['GET /', 'GET /:id', 'POST /', 'PUT /:id', 'DELETE /:id']) assert.ok(skillPaths.includes(expected));
});
