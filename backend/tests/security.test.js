const assert = require('assert');
const test = require('node:test');
const { isOriginAllowed, getAllowedOrigins } = require('../src/config/cors');

test('Security & Robustness Tests - Phase 1', async (t) => {
  await t.test('CORS whitelist correctly accepts trusted origins and rejects rogue origins', () => {
    // Trusted local dev origins
    assert.strictEqual(isOriginAllowed('http://localhost:5173'), true);
    assert.strictEqual(isOriginAllowed('http://localhost:3000'), true);
    assert.strictEqual(isOriginAllowed('http://127.0.0.1:5173'), true);

    // No-origin (curl, mobile app, server-to-server)
    assert.strictEqual(isOriginAllowed(null), true);
    assert.strictEqual(isOriginAllowed(undefined), true);
    assert.strictEqual(isOriginAllowed(''), true);

    // Rogue / malicious origins
    assert.strictEqual(isOriginAllowed('http://malicious-site.com'), false);
    assert.strictEqual(isOriginAllowed('http://localhost:8080'), false);
    assert.strictEqual(isOriginAllowed('https://attacker.xyz'), false);
  });

  await t.test('Search regex escaping handles special regex characters without throwing SyntaxError', () => {
    const escapeRegex = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    const dangerousInputs = [
      'Dr. [Dentist',
      'Clinic (North)',
      'Salon + Spa',
      'Test * Star',
      'Special? Query',
      'Curly {Braces}',
      'Backslash \\ test',
      'Pipe | test',
    ];

    dangerousInputs.forEach((input) => {
      assert.doesNotThrow(() => {
        const escaped = escapeRegex(input);
        const regex = new RegExp(escaped, 'i');
        assert.ok(regex.test(input));
      }, `Failed to escape regex for input: ${input}`);
    });
  });
});
