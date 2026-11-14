const assert = require('assert');
const test = require('node:test');
const { getPublicKey, sendPush } = require('../src/config/webPush');

test('Web Push Notification Configuration & Serialization Tests', async (t) => {
  await t.test('VAPID public key is configured and valid format', () => {
    const key = getPublicKey();
    assert.ok(key, 'VAPID public key must not be empty');
    assert.strictEqual(typeof key, 'string');
    assert.ok(key.length > 30, 'VAPID public key must be valid base64url length');
  });

  await t.test('sendPush handles missing subscription gracefully without throwing error', async () => {
    const resNull = await sendPush(null, { title: 'Test' });
    assert.strictEqual(resNull, null);

    const resEmpty = await sendPush({}, { title: 'Test' });
    assert.strictEqual(resEmpty, null);
  });
});
