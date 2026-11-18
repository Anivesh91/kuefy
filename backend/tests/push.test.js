const assert = require('assert');
const test = require('node:test');
const webpush = require('web-push');

test('Web Push Notification Configuration & Serialization Tests', async (t) => {
  await t.test('Gracefully disables Web Push when VAPID env vars are not set', () => {
    const prevPub = process.env.VAPID_PUBLIC_KEY;
    const prevPriv = process.env.VAPID_PRIVATE_KEY;
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;

    delete require.cache[require.resolve('../src/config/webPush')];
    const { isConfigured, getPublicKey } = require('../src/config/webPush');

    assert.strictEqual(isConfigured(), false);
    assert.strictEqual(getPublicKey(), null);

    if (prevPub !== undefined) process.env.VAPID_PUBLIC_KEY = prevPub;
    if (prevPriv !== undefined) process.env.VAPID_PRIVATE_KEY = prevPriv;
  });

  await t.test('Configures Web Push cleanly when VAPID env vars are provided', () => {
    const prevPub = process.env.VAPID_PUBLIC_KEY;
    const prevPriv = process.env.VAPID_PRIVATE_KEY;

    // Generate ephemeral test keys at runtime (never hardcoded in repo)
    const keys = webpush.generateVAPIDKeys();
    process.env.VAPID_PUBLIC_KEY = keys.publicKey;
    process.env.VAPID_PRIVATE_KEY = keys.privateKey;

    delete require.cache[require.resolve('../src/config/webPush')];
    const { isConfigured, getPublicKey } = require('../src/config/webPush');

    assert.strictEqual(isConfigured(), true);
    assert.strictEqual(getPublicKey(), keys.publicKey);

    if (prevPub !== undefined) process.env.VAPID_PUBLIC_KEY = prevPub;
    else delete process.env.VAPID_PUBLIC_KEY;
    if (prevPriv !== undefined) process.env.VAPID_PRIVATE_KEY = prevPriv;
    else delete process.env.VAPID_PRIVATE_KEY;
  });

  await t.test('sendPush handles missing subscription gracefully without throwing error', async () => {
    delete require.cache[require.resolve('../src/config/webPush')];
    const { sendPush } = require('../src/config/webPush');

    const resNull = await sendPush(null, { title: 'Test' });
    assert.strictEqual(resNull, null);

    const resEmpty = await sendPush({}, { title: 'Test' });
    assert.strictEqual(resEmpty, null);
  });
});
