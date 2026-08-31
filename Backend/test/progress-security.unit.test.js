const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Progress = require('../src/models/Progress');
const progressRoutes = require('../src/routes/progress.routes');
const { validateProgressUpdate } = require('../src/validators/progress.validator');

test('progress schema owns records by user and course', () => {
  assert.ok(Progress.schema.indexes().some(([index, options]) => index.userId === 1 && index.courseId === 1 && options.unique));
});

test('progress route validates IDs and rejects negative time', () => {
  const route = progressRoutes.stack.find((layer) => layer.route?.path === '/course');
  assert.ok(route);
  assert.ok(route.route.stack.length >= 3);
  let status;
  const response = { status(code) { status = code; return this; }, json() { return this; } };
  validateProgressUpdate({ body: { courseId: 'bad', timeSpentHours: 1 } }, response, () => {});
  assert.equal(status, 400);
  validateProgressUpdate({ body: { courseId: new mongoose.Types.ObjectId().toString(), timeSpentHours: -1 } }, response, () => {});
  assert.equal(status, 400);
});
