const webpush = require('web-push');

const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:support@kuefy.com';
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

let isWebPushConfigured = false;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    isWebPushConfigured = true;
    console.log('[WebPush] VAPID configured successfully.');
  } catch (error) {
    isWebPushConfigured = false;
    console.warn(`[WebPush Warning] Failed to configure VAPID: ${error.message}`);
  }
} else {
  console.warn('[WebPush] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY not configured. Lock-screen push notifications disabled.');
}

/**
 * Send a web push notification to a device subscription
 */
const sendPush = async (subscription, payload) => {
  if (!isWebPushConfigured || !subscription || !subscription.endpoint) return null;
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
  isConfigured: () => isWebPushConfigured,
  getPublicKey: () => (isWebPushConfigured ? VAPID_PUBLIC_KEY : null),
  sendPush,
};
