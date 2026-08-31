const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const { checkReadiness } = require('../src/services/readiness.service');

test('health and readiness endpoints are registered separately', () => {
  const paths = app._router.stack.filter((layer) => layer.route).map((layer) => layer.route.path);
  assert.ok(paths.includes('/health'));
  assert.ok(paths.includes('/ready'));
});

test('readiness never reports ready when local dependencies are unavailable', async () => {
  const result = await checkReadiness();
  assert.equal(typeof result.ready, 'boolean');
  assert.deepEqual(Object.keys(result.checks).sort(), ['ml', 'mongo', 'redis']);
  if (!result.checks.mongo || !result.checks.redis || !result.checks.ml) assert.equal(result.ready, false);
});
