const webpush = require('web-push');

const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:support@kuefy.com';
const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BI2KYSmAhwI88dx8UuuT6mW575eQPn7Muk5r7vBksQfpmSNrI8evxP-J_RyYyZfi23sft2c7sz7QTND4J5s-jKs';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || 'GEXKCU4ACIeVNJGpaqP7azROLR79rP7XcXuaDmiPgTQ';

try {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[WebPush] VAPID configured successfully.');
} catch (error) {
  console.warn(`[WebPush Warning] Failed to configure VAPID: ${error.message}`);
}

/**
 * Send a web push notification to a device subscription
 */
const sendPush = async (subscription, payload) => {
  if (!subscription || !subscription.endpoint) return null;
  try {
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const result = await webpush.sendNotification(subscription, payloadStr, {
      TTL: 60 * 60, // 1 hour TTL
      urgency: 'high',
    });
    return result;
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.warn(`[WebPush] Subscription expired or no longer active (${error.statusCode}).`);
    } else {
      console.warn(`[WebPush Warning] Failed to send notification: ${error.message}`);
    }
    return null;
  }
};

module.exports = {
  webpush,
  getPublicKey: () => VAPID_PUBLIC_KEY,
  sendPush,
};
