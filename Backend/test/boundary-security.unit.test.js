const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');

test('production configuration has no fallback refresh secret and request bodies are bounded', () => {
  const authSource = fs.readFileSync(path.join(__dirname, '../src/utils/auth.js'), 'utf8');
  const appSource = fs.readFileSync(path.join(__dirname, '../src/app.js'), 'utf8');
  assert.match(authSource, /JWT_REFRESH_SECRET is not configured/);
  assert.match(appSource, /express\.urlencoded\(\{ extended: true, limit: '1mb' \}\)/);
  assert.ok(app._router.stack.some((layer) => layer.name === 'urlencodedParser'));
});
