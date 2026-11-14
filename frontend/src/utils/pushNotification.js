import { ticketApi } from '../api/ticketApi';

export const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const isPushSupported = () => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

export const getNotificationPermission = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
  return Notification.permission;
};

export const registerPushForTicket = async (publicToken) => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported on this browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const res = await ticketApi.getVapidPublicKey();
  const publicKey = res?.data?.publicKey;
  if (!publicKey) {
    throw new Error('Could not retrieve push configuration from server.');
  }

  const convertedVapidKey = urlBase64ToUint8Array(publicKey);
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });
  }

  await ticketApi.subscribePush(publicToken, subscription.toJSON());
  return true;
};
