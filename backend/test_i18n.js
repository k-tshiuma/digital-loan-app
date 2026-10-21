// Localization tests (hebrew-localization-plan.md). Run: node test_i18n.js
const http = require('http');
const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');
const app = require('./server');

const TEST_PORT = 5005;

function makeRequest(method, urlPath, body, headers = {}, port = TEST_PORT) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, path: urlPath, method, headers: { 'Content-Type': 'application/json', ...headers } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING LOCALIZATION (EN/HE) TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${e.message}`);
      failed++;
    }
  }

  const phone = `+97250${Math.floor(1000000 + Math.random() * 9000000)}`;
  let token;
  const auth = () => ({ Authorization: `Bearer ${token}` });

  console.log('--- T1.5 PUT /api/users/me/language ---');
  await test('borrower logs in with OTP', async () => {
    await makeRequest('POST', '/api/users/request-otp', { phoneNumber: phone });
    const res = await makeRequest('POST', '/api/users/verify-otp', { phoneNumber: phone, code: '123456', preferredLanguage: 'en' });
    assert.strictEqual(res.status, 200);
    token = res.data.token;
    assert.ok(token, 'expected a token');
  });

  await test('setting Hebrew returns 200 and the updated user', async () => {
    const res = await makeRequest('PUT', '/api/users/me/language', { language: 'he' }, auth());
    assert.strictEqual(res.status, 200, JSON.stringify(res.data));
    assert.strictEqual(res.data.user.preferredLanguage, 'he');
  });

  await test('GET /api/users/me now reports Hebrew', async () => {
    const res = await makeRequest('GET', '/api/users/me', null, auth());
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.preferredLanguage, 'he');
  });

  await test('switching back to English works', async () => {
    const res = await makeRequest('PUT', '/api/users/me/language', { language: 'en' }, auth());
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.preferredLanguage, 'en');
  });

  for (const bad of ['xx', 'th', 'zh', 'tl', '', null]) {
    await test(`rejects language ${JSON.stringify(bad)} with 400`, async () => {
      const res = await makeRequest('PUT', '/api/users/me/language', { language: bad }, auth());
      assert.strictEqual(res.status, 400);
    });
  }

  await test('missing body returns 400', async () => {
    const res = await makeRequest('PUT', '/api/users/me/language', null, auth());
    assert.strictEqual(res.status, 400);
  });

  await test('staff token is rejected with 403', async () => {
    const staff = await makeRequest('POST', '/api/auth/staff-token', { role: 'credit_reviewer' });
    assert.strictEqual(staff.status, 200, 'staff-token endpoint should work in demo mode');
    const res = await makeRequest('PUT', '/api/users/me/language', { language: 'he' }, { Authorization: `Bearer ${staff.data.token}` });
    assert.strictEqual(res.status, 403);
  });

  await test('without a token in production-style mode (DEMO_MODE=false) returns 401', async () => {
    // DEMO_MODE is read when server.js loads, so check it in a separate process.
    const script = `
      const http = require('http');
      const app = require(${JSON.stringify(path.join(__dirname, 'server.js'))});
      const s = app.listen(5006, () => {
        const req = http.request({ hostname: '127.0.0.1', port: 5006, path: '/api/users/me/language', method: 'PUT',
          headers: { 'Content-Type': 'application/json' } }, (res) => { console.log('STATUS=' + res.statusCode); s.close(); process.exit(0); });
        req.write(JSON.stringify({ language: 'he' })); req.end();
      });`;
    const out = spawnSync(process.execPath, ['-e', script], {
      cwd: __dirname,
      env: { ...process.env, DEMO_MODE: 'false' },
      encoding: 'utf8',
      timeout: 20000,
    });
    const match = /STATUS=(\d+)/.exec(out.stdout || '');
    assert.ok(match, `child process gave no status. stderr: ${out.stderr}`);
    assert.strictEqual(Number(match[1]), 401);
  });

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================\n');
  return failed;
}

const server = app.listen(TEST_PORT, async () => {
  let failed = 1;
  try {
    failed = await runTests();
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
});
